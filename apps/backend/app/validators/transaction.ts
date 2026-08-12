import vine from '@vinejs/vine'

/**
 * Validador para crear una transacción
 */
export const createTransactionValidator = vine.compile(
    vine.object({
        type: vine.enum(['PURCHASE', 'PAYMENT']),
        amount_usd: vine.number().min(0.01).decimal([0, 2]),
        exchange_rate_bcv: vine.number().min(0).decimal([0, 2]).optional(),
        description: vine.string().trim().maxLength(255).optional(),
    })
)