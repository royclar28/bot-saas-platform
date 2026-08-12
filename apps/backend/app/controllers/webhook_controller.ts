import type { HttpContext } from '@adonisjs/core/http'
import { ChatOpenAI } from '@langchain/openai'
import { PromptTemplate } from '@langchain/core/prompts'
import Customer from '#models/customer'
import env from '#start/env'

export default class WebhookController {
    public async handle({ request, response }: HttpContext) {
        const payload = request.all()

        // 1. Responder a n8n/Evolution de inmediato (Status 200)
        // Esto evita que WhatsApp marque error por "timeout"
        response.ok({ status: 'processing', message: 'Mensaje recibido, IA pensando...' })

        // 2. Extraer datos del payload (Ajustado al JSON de prueba que enviaste)
        const pushName = payload.data?.pushName || 'Cliente'
        const message = payload.data?.message || ''
        // Nota: Evolution API manda el número en remoteJid. Para la prueba usaremos un número fijo.
        const phone = payload.data?.phone || '584248513310'

        this.processAIResponse(phone, pushName, message)
    }

    // Ejecutamos la IA en un proceso de fondo para no bloquear la respuesta HTTP
    private async processAIResponse(phone: string, pushName: string, message: string) {
        try {
            console.log(`\n🔍 Buscando en BD al cliente: ${phone}...`)

            // 3. RECUPERACIÓN (Retrieval): Buscar al cliente y su deuda
            const customer = await Customer.findBy('phone', phone)
            const isRegistered = !!customer
            const currentDebt = customer ? customer.currentDebt : 0

            // 4. CONFIGURAR EL MODELO (LangChain)
            const model = new ChatOpenAI({
                modelName: 'llama-3.1-8b-instant', // Groq model
                temperature: 0.3,
                apiKey: env.get('LLM_API_KEY') as string,
                configuration: {
                    baseURL: "https://api.groq.com/openai/v1"
                }
            })

            // 5. AUMENTO (Augmented): Crear el Prompt con el contexto financiero
            const prompt = PromptTemplate.fromTemplate(`
        Eres el asistente virtual estrella de GabyStore, una tienda de ropa con estilo.
        Estás hablando por WhatsApp con {cliente}.
        
        [CONTEXTO DEL SISTEMA]
        - ¿Es cliente registrado en la base de datos?: {registrado}
        - Deuda actual (Fiado): ${currentDebt} USD.
        
        [MENSAJE DEL CLIENTE]
        "{mensaje}"
        
        [REGLAS]
        1. Sé amable, conversacional y usa emojis.
        2. Si el cliente pregunta por su deuda o saldo fiado, indícale el monto exacto en dólares basándote estrictamente en el [CONTEXTO DEL SISTEMA].
        3. Si la deuda es 0, felicítalo por estar al día.
        4. Sé conciso, es un mensaje de WhatsApp.

        Escribe tu respuesta final:
      `)

            const formattedPrompt = await prompt.format({
                cliente: pushName,
                registrado: isRegistered ? 'Sí' : 'No',
                mensaje: message
            })

            console.log('🧠 IA Pensando...')

            // 6. GENERACIÓN: Ejecutar la IA
            const aiResponse = await model.invoke(formattedPrompt)

            console.log('\n💬 RESPUESTA GENERADA PARA WHATSAPP:')
            console.log('====================================')
            console.log(aiResponse.content)
            console.log('====================================\n')

            // 7. ENVIAR A WHATSAPP: Hacer POST a Evolution API
            const evolutionUrl = `${env.get('EVOLUTION_API_URL')}/message/sendText/${env.get('EVOLUTION_INSTANCE_NAME')}`

            console.log(`🚀 Enviando mensaje a Evolution API (${evolutionUrl})...`)

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
