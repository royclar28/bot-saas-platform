import vine from '@vinejs/vine'

/**
 * Validador para crear un cliente
 */
export const createCustomerValidator = vine.compile(
    vine.object({
        phone: vine.string().trim().minLength(7).maxLength(20),
        name: vine.string().trim().minLength(2).maxLength(100).optional(),
            })
)

/**
 * Validador para actualizar un cliente (todos los campos opcionales)
 */
export const updateCustomerValidator = vine.compile(
    vine.object({
        name: vine.string().trim().minLength(2).maxLength(100).optional(),
            })
)