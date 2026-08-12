import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export default class StatsController {
    public async index({ response }: HttpContext) {
        // 1. Clientes totales
        const totalCustomersResult = await db.from('customers').count('* as total')
        const totalCustomers = totalCustomersResult[0].total

        // 2. Deuda total en la calle (Fiado)
        const totalDebtResult = await db.from('customers').sum('current_debt as total')
        const totalDebt = totalDebtResult[0].total || 0

        // 3. Movimientos de hoy (compras y pagos)
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const todayTransactionsResult = await db
            .from('transactions')
            .where('created_at', '>=', today)
            .count('* as total')
        const todayTransactions = todayTransactionsResult[0].total

        return response.ok({
            data: {
                total_customers: Number(totalCustomers),
                total_debt_usd: Number(totalDebt),
                transactions_today: Number(todayTransactions),
            }
        })
    }
}
