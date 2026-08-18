import type { HttpContext } from '@adonisjs/core/http'
import Customer from '#models/customer'
import {
    createCustomerValidator,
    updateCustomerValidator,
} from '#validators/customer'


export default class CustomersController {
    /**
     * GET /api/customers
     * Lista todos los clientes ordenados por deuda mayor
     */
    async index({ response }: HttpContext) {
        const customers = await Customer.query().orderBy('current_debt', 'desc')
        return response.ok(customers)
    }

    /**
     * GET /api/customers/by-phone/:phone
     * Busca un cliente por número de WhatsApp (incluye historial)
     */
    async findByPhone({ params, response }: HttpContext) {
        const customer = await Customer.query()
            .where('phone', params.phone)
            .preload('transactions', (q) => q.orderBy('created_at', 'desc'))
            .firstOrFail()

        return response.ok(customer)
    }

    /**
     * GET /api/customers/:id
     * Muestra un cliente con su historial de transacciones
     */
    async show({ params, response }: HttpContext) {
        const customer = await Customer.query()
            .where('id', params.id)
            .preload('transactions', (q) => q.orderBy('created_at', 'desc'))
            .firstOrFail()

        return response.ok(customer)
    }

    /**
     * POST /api/customers
     * Crea un nuevo cliente. El teléfono es el identificador único (WhatsApp).
     * Body: { phone, name?, trust_level? }
     */
    async store({ request, response }: HttpContext) {
        const data = await createCustomerValidator.validate(request.all())
        const customer = await Customer.create({
            phone: data.phone,
            name: data.name,
                    })
        return response.created(customer)
    }

    /**
     * PUT /api/customers/:id
     * Actualiza datos del cliente (nombre, nivel de confianza).
     * Body: { name?, trust_level? }
     */
    async update({ params, request, response }: HttpContext) {
        const customer = await Customer.findOrFail(params.id)
        const data = await updateCustomerValidator.validate(request.all())
        customer.merge({
            name: data.name,
                    })
        await customer.save()
        return response.ok(customer)
    }

    /**
     * DELETE /api/customers/:id
     * Elimina un cliente (y sus transacciones por CASCADE)
     */
    async destroy({ params, response }: HttpContext) {
        const customer = await Customer.findOrFail(params.id)
        await customer.delete()
        return response.noContent()
    }
}