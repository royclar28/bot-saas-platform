import type { HttpContext } from '@adonisjs/core/http'
import ChatHistory from '#models/chat_history'
import Customer from '#models/customer'
import Bot from '#models/bot'
import env from '#start/env'
import db from '@adonisjs/lucid/services/db'

export default class ChatsController {
    // 1. Listar todas las conversaciones activas (clientes con su último mensaje)
    public async index({ request, response }: HttpContext) {
        const tenantId = request.input('tenantId', 1)

        // Usamos raw query para obtener el último mensaje por cada sessionId (teléfono)
        const activeSessions = await db.rawQuery(`
            SELECT 
                ch.session_id, 
                MAX(ch.created_at) as last_message_at,
                c.name as customer_name,
                c.bot_enabled
            FROM chat_histories ch
            LEFT JOIN customers c ON c.phone = ch.session_id AND c.tenant_id = ?
            GROUP BY ch.session_id, c.name, c.bot_enabled
            ORDER BY last_message_at DESC
        `, [tenantId])

        return response.ok(activeSessions.rows)
    }

    // 2. Obtener los mensajes de una sesión específica (teléfono)
    public async show({ params, response }: HttpContext) {
        const { id: sessionId } = params

        const messages = await ChatHistory.query()
            .where('sessionId', sessionId)
            .orderBy('createdAt', 'asc')
            .limit(100)

        // Obtener estado del bot para este cliente
        const customer = await Customer.query().where('phone', sessionId).first()
        const botEnabled = customer ? customer.botEnabled : true

        return response.ok({
            messages,
            botEnabled
        })
    }

    // 3. Pausar o Reactivar el Bot para un cliente
    public async toggleBot({ params, request, response }: HttpContext) {
        const { id: sessionId } = params
        const { enabled } = request.only(['enabled'])

        let customer = await Customer.query().where('phone', sessionId).first()
        
        if (!customer) {
            // Si el cliente no existe, lo creamos para poder guardar su preferencia
            customer = new Customer()
            customer.phone = sessionId
            customer.tenantId = 1 // Default tenant
            customer.name = 'Cliente Nuevo'
            customer.currentDebt = 0
        }

        customer.botEnabled = enabled
        await customer.save()

        // Si apagamos el bot, enviar mensaje automático
        if (!enabled) {
            try {
                const bot = await Bot.query().first() // Toma el primer bot disponible
                if (bot) {
                    const evolutionUrl = `${env.get('EVOLUTION_API_URL')}/message/sendText/${bot.instanceName}`
                    await fetch(evolutionUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'apikey': env.get('EVOLUTION_API_KEY') as string
                        },
                        body: JSON.stringify({
                            number: sessionId,
                            options: { delay: 1000, presence: "composing" },
                            text: "🤖 *Aviso:* Te transferiré con un asesor humano. Por favor espera un momento."
                        })
                    })

                    // Guardar este mensaje automático en el historial
                    await ChatHistory.create({
                        botId: bot.id,
                        sessionId: sessionId,
                        message: { type: 'ai', text: "🤖 *Aviso:* Te transferiré con un asesor humano. Por favor espera un momento." }
                    })
                }
            } catch (error) {
                console.error("Error enviando mensaje de handoff:", error)
            }
        }

        return response.ok({ success: true, botEnabled: enabled })
    }

    // 4. Enviar un mensaje manual (como humano)
    public async send({ params, request, response }: HttpContext) {
        const { id: sessionId } = params
        const { text } = request.only(['text'])

        try {
            const bot = await Bot.query().first()
            if (!bot) return response.internalServerError("No hay bots configurados")

            const evolutionUrl = `${env.get('EVOLUTION_API_URL')}/message/sendText/${bot.instanceName}`
            
            const reqEvolution = await fetch(evolutionUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': env.get('EVOLUTION_API_KEY') as string
                },
                body: JSON.stringify({
                    number: sessionId,
                    options: { delay: 0, presence: "composing" },
                    text: text
                })
            })

            if (!reqEvolution.ok) {
                throw new Error("Fallo en Evolution API")
            }

            // Guardar el mensaje del humano en el historial
            const chatMsg = await ChatHistory.create({
                botId: bot.id,
                sessionId: sessionId,
                message: { type: 'human-agent', text: text }
            })

            return response.ok({ success: true, message: chatMsg })

        } catch (error) {
            console.error("Error enviando mensaje manual:", error)
            return response.internalServerError("Error enviando mensaje")
        }
    }
}
