import type { HttpContext } from '@adonisjs/core/http'
import { ChatOpenAI } from '@langchain/openai'
import { PromptTemplate } from '@langchain/core/prompts'
import Customer from '#models/customer'
import Bot from '#models/bot'
import ChatHistory from '#models/chat_history'
import env from '#start/env'

export default class WebhookController {
    public async handle({ request, response }: HttpContext) {
        const payload = request.all()
        response.ok({ status: 'processing', message: 'Mensaje recibido, IA pensando...' })

        // Extracting data from Evolution API payload
        const instanceName = payload.instance || env.get('EVOLUTION_INSTANCE_NAME')
        const pushName = payload.data?.pushName || 'Cliente'
        const message = payload.data?.message || ''
        
        // El número del cliente que nos escribe
        const phone = payload.data?.key?.remoteJid?.split('@')[0] || payload.data?.phone || '584248513310'

        this.processAIResponse(instanceName, phone, pushName, message)
    }

    private async processAIResponse(instanceName: string, phone: string, pushName: string, message: string) {
        try {
            // 1. Identificar el Bot y su Tenant (Multi-Tenant Logic)
            const bot = await Bot.query()
                .where('instanceName', instanceName)
                .preload('tenant')
                .preload('roles')
                .first()

            if (!bot) {
                console.error(`❌ Bot con instancia ${instanceName} no encontrado en BD.`)
                return
            }

            const tenantId = bot.tenantId
            const role = bot.roles[0] // Asumimos un rol primario por ahora
            const basePrompt = role ? role.promptTemplate : 'Eres un asistente útil.'

            console.log(`\n🔍 Buscando en BD al cliente: ${phone} para el tenant ${tenantId}...`)

            // 2. RECUPERACIÓN (Retrieval): Buscar al cliente y su deuda
            const customer = await Customer.query()
                .where('tenantId', tenantId)
                .where('phone', phone)
                .first()
                
            const isRegistered = !!customer
            const currentDebt = customer ? customer.currentDebt : 0
            
            const isBotEnabled = customer ? customer.botEnabled : true;

            // 3. Guardar mensaje entrante
            await ChatHistory.create({
                botId: bot.id,
                sessionId: phone,
                message: { type: 'human', text: message }
            })

            if (!isBotEnabled) {
                console.log(`⏸️ Bot pausado para ${phone}. Humano tomará el control.`)
                return;
            }

            // 4. CONFIGURAR EL MODELO (LangChain)
            const model = new ChatOpenAI({
                modelName: 'llama-3.1-8b-instant',
                temperature: 0.3,
                apiKey: env.get('LLM_API_KEY') as string,
                configuration: {
                    baseURL: "https://api.groq.com/openai/v1"
                }
            })

            // 5. AUMENTO (Augmented): Crear el Prompt Dinámico
            const prompt = PromptTemplate.fromTemplate(`
        ${basePrompt}
        
        Estás hablando por WhatsApp con {cliente}.
        
        [CONTEXTO DEL SISTEMA]
        - ¿Es cliente registrado en nuestra base de datos?: {registrado}
        - Deuda actual (Fiado): ${currentDebt} USD.
        
        [MENSAJE DEL CLIENTE]
        "{mensaje}"
        
        [REGLAS]
        1. Sé conciso, es un mensaje de WhatsApp.
        2. Basa tus respuestas en tu rol y en el contexto financiero proporcionado si preguntan por deuda.

        Escribe tu respuesta final:
      `)

            const formattedPrompt = await prompt.format({
                cliente: pushName,
                registrado: isRegistered ? 'Sí' : 'No',
                mensaje: message
            })

            console.log('🧠 IA Pensando...')
            const aiResponse = await model.invoke(formattedPrompt)

            // Guardar respuesta de IA
            await ChatHistory.create({
                botId: bot.id,
                sessionId: phone,
                message: { type: 'ai', text: aiResponse.content }
            })

            // 6. ENVIAR A WHATSAPP: Hacer POST a Evolution API
            const evolutionUrl = `${env.get('EVOLUTION_API_URL')}/message/sendText/${instanceName}`

            const reqEvolution = await fetch(evolutionUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': env.get('EVOLUTION_API_KEY') as string
                },
                body: JSON.stringify({
                    number: phone,
                    options: {
                        delay: 1200,
                        presence: "composing"
                    },
                    text: aiResponse.content
                })
            })

            if (!reqEvolution.ok) {
                const errorData = await reqEvolution.text()
                throw new Error(`Fallo al enviar a Evolution API: ${reqEvolution.status} - ${errorData}`)
            }

            console.log('✅ ¡Mensaje enviado exitosamente a WhatsApp!')

        } catch (error) {
            console.error('❌ Error en el motor de IA:', error)
        }
    }
}
