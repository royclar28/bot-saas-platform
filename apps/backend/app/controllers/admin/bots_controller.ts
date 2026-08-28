import type { HttpContext } from '@adonisjs/core/http'
import Bot from '#models/bot'
import BotRole from '#models/bot_role'
import env from '#start/env'

export default class BotsController {
  async index({ request, response }: HttpContext) {
    const tenantId = request.qs().tenantId || 1
    let bot = await Bot.query().where('tenantId', tenantId).preload('roles').first()
    
    if (!bot) {
      bot = await Bot.create({
        tenantId,
        instanceName: env.get('EVOLUTION_INSTANCE_NAME', 'MerxBotSaaS'),
        phoneNumber: 'pending',
        status: 'disconnected'
      })
      await BotRole.create({
        botId: bot.id,
        name: 'Vendedor',
        promptTemplate: 'Eres un asistente virtual de ventas.'
      })
      await bot.load('roles')
    }
    
    return response.ok([bot])
  }

  async qr({ params, response }: HttpContext) {
    const bot = await Bot.findOrFail(params.id)
    const evolutionUrl = env.get('EVOLUTION_API_URL')
    const apikey = env.get('EVOLUTION_API_KEY') as string
    const instanceName = bot.instanceName

    try {
      // Create instance if not exists (Evolution ignores if exists)
      await fetch(`${evolutionUrl}/instance/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': apikey },
        body: JSON.stringify({ instanceName, qrcode: true, integration: 'WHATSAPP-BAILEYS' })
      })

      // Get connection state
      const stateRes = await fetch(`${evolutionUrl}/instance/connectionState/${instanceName}`, {
        headers: { 'apikey': apikey }
      })
      const stateData = await stateRes.json() as any

      if (stateData?.instance?.state === 'open') {
        bot.status = 'connected'
        await bot.save()
        return response.ok({ status: 'connected' })
      }

      // En Evolution v2, el QR puede venir directamente en el estado si está 'connecting'
      if (stateData?.instance?.state === 'connecting' && (stateData?.base64 || stateData?.qrcode)) {
          return response.ok({
              status: 'pending',
              qrCode: stateData?.base64 || stateData?.qrcode
          })
      }

      // Fetch QR (esto inicia la conexión si estaba desconectado)
      const connectRes = await fetch(`${evolutionUrl}/instance/connect/${instanceName}`, {
        headers: { 'apikey': apikey }
      })
      const connectData = await connectRes.json() as any
      
      // Si la API dice que ya está conectando pero no teníamos el QR (estado trabado), forzamos reinicio
      if (connectData?.error?.includes('already') || connectData?.status === 403 || connectData?.status === 401) {
          await fetch(`${evolutionUrl}/instance/logout/${instanceName}`, {
              method: 'DELETE',
              headers: { 'apikey': apikey }
          })
          // Al cerrar sesión, la instancia se libera. Volvemos a pedir el QR limpiecito.
          const freshConnectRes = await fetch(`${evolutionUrl}/instance/connect/${instanceName}`, {
            headers: { 'apikey': apikey }
          })
          const freshConnectData = await freshConnectRes.json() as any
          return response.ok({ 
            status: 'pending', 
            qrCode: freshConnectData?.base64 || freshConnectData?.qrcode
          })
      }

      return response.ok({ 
        status: 'pending', 
        qrCode: connectData?.base64 || connectData?.qrcode
      })
    } catch (error) {
      return response.internalServerError({ error: error.message })
    }
  }

  async updateRole({ params, request, response }: HttpContext) {
    const bot = await Bot.findOrFail(params.id)
    const { promptTemplate } = request.only(['promptTemplate'])
    
    let role = await BotRole.query().where('botId', bot.id).first()
    if (!role) {
      role = await BotRole.create({ botId: bot.id, name: 'Vendedor', promptTemplate })
    } else {
      role.promptTemplate = promptTemplate
      await role.save()
    }
    
    return response.ok(role)
  }
}
