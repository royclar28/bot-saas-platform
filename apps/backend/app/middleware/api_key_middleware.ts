import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import env from '#start/env'

/**
 * Middleware de seguridad por API Key.
 * Todas las rutas /api/* requieren el header: X-API-Key: <API_SECRET_KEY>
 */
export default class ApiKeyMiddleware {
  async handle({ request, response }: HttpContext, next: NextFn) {
    const apiKey = request.header('X-API-Key')
    const secret = env.get('API_SECRET_KEY')

    if (!apiKey || apiKey !== secret) {
      return response.unauthorized({ message: 'API Key inválida o ausente.' })
    }

    await next()
  }
}