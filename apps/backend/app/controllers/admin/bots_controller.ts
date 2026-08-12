import type { HttpContext } from '@adonisjs/core/http'
import Bot from '#models/bot'

export default class BotsController {
  async index({ request, response }: HttpContext) {
    const tenantId = request.qs().tenantId
    const query = Bot.query()
    if (tenantId) query.where('tenantId', tenantId)
    
    const bots = await query.preload('roles')
    return response.ok(bots)
  }

  async store({ request, response }: HttpContext) {
    const data = request.only(['tenantId', 'instanceName', 'phoneNumber', 'status'])
    const bot = await Bot.create(data)
    return response.created(bot)
  }

  async show({ params, response }: HttpContext) {
    const bot = await Bot.query().where('id', params.id).preload('roles').firstOrFail()
    return response.ok(bot)
  }

  async update({ params, request, response }: HttpContext) {
    const bot = await Bot.findOrFail(params.id)
    bot.merge(request.only(['instanceName', 'phoneNumber', 'status']))
    await bot.save()
    return response.ok(bot)
  }

  async destroy({ params, response }: HttpContext) {
    const bot = await Bot.findOrFail(params.id)
    await bot.delete()
    return response.noContent()
  }
}
