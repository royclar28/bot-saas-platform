import vine from '@vinejs/vine'

/**
 * Validador para crear una transacción
 */
export const createTransactionValidator = vine.compile(
    vine.object({
        type: vine.enum(['credit', 'payment']),
        amount: vine.number().min(0.01).decimal([0, 2]),
                description: vine.string().trim().maxLength(255).optional(),
    })
)