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

        const totalBotMessagesResult = await db.from('chat_histories').count('* as total');
        const totalBotMessages = totalBotMessagesResult[0].total;

        const recentTransactions = await db.from('transactions').orderBy('created_at', 'desc').limit(5);

        return response.ok({
            data: {
                total_customers: Number(totalCustomers),
                total_debt_usd: Number(totalDebt),
                transactions_today: Number(todayTransactions),
                total_bot_messages: Number(totalBotMessages),
                recent_transactions: recentTransactions
            }
        });
    }
}
