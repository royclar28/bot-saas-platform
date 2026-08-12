import type { HttpContext } from '@adonisjs/core/http'
import Transaction from '#models/transaction'
import Customer from '#models/customer'
import db from '@adonisjs/lucid/services/db'
import { createTransactionValidator } from '#validators/transaction'


export default class TransactionsController {
    /**
     * GET /api/customers/:customerId/transactions
     * Lista todas las transacciones de un cliente
     */
    async index({ params, response }: HttpContext) {
        const transactions = await Transaction.query()
            .where('customer_id', params.customerId)
            .orderBy('created_at', 'desc')

        return response.ok(transactions)
    }

    /**
     * POST /api/customers/:customerId/transactions
     * Registra una compra (PURCHASE) o un abono (PAYMENT).
     * Actualiza automáticamente current_debt del cliente.
     *
     * Body: { type, amount_usd, exchange_rate_bcv?, description? }
     */
    async store({ params, request, response }: HttpContext) {
        const customer = await Customer.findOrFail(params.customerId)
        const data = await createTransactionValidator.validate(request.all())

        const transaction = await db.transaction(async (trx) => {
            const newTransaction = await Transaction.create(
                {
                    customerId: customer.id,
                    type: data.type,
                    amountUsd: data.amount_usd,
                    exchangeRateBcv: data.exchange_rate_bcv ?? null,
                    description: data.description ?? null,
                },
                { client: trx }
            )

            // Actualizar la deuda del cliente automáticamente
            if (data.type === 'PURCHASE') {
                customer.currentDebt = Number(customer.currentDebt) + Number(data.amount_usd)
            } else {
                customer.currentDebt = Math.max(
                    0,
                    Number(customer.currentDebt) - Number(data.amount_usd)
                )
            }

            await customer.useTransaction(trx).save()

            return newTransaction
        })

        return response.created(transaction)
    }

    /**
     * DELETE /api/customers/:customerId/transactions/:id
     * Elimina una transacción (no revierte la deuda automáticamente)
     */
    async destroy({ params, response }: HttpContext) {
        const transaction = await Transaction.query()
            .where('id', params.id)
            .where('customer_id', params.customerId)
            .firstOrFail()

        await transaction.delete()
        return response.noContent()
    }
}