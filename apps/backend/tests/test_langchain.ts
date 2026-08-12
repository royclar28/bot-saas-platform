import { ChatOpenAI } from '@langchain/openai'
import { PromptTemplate } from '@langchain/core/prompts'

async function run() {
    const model = new ChatOpenAI({
        modelName: 'llama-3.1-8b-instant',
        temperature: 0.3,
        openAIApiKey: process.env.LLM_API_KEY,
        configuration: {
            baseURL: "https://api.groq.com/openai/v1"
        }
    })

    const prompt = PromptTemplate.fromTemplate(`
    Eres el asistente virtual estrella de GabyStore, una tienda de ropa con estilo.
    Estás hablando por WhatsApp con {cliente}.
    
    [CONTEXTO DEL SISTEMA]
    - ¿Es cliente registrado en la base de datos?: {registrado}
    - Deuda actual (Fiado): 25.50 USD.
    
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
        cliente: "Roy Prueba",
        registrado: "Sí",
        mensaje: "Hola, soy yo. Quería saber si les debo algo del fiado."
    })

    const aiResponse = await model.invoke(formattedPrompt)
    console.log(aiResponse.content)
}

run().catch(console.error)
