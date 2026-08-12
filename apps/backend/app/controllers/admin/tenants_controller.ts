import type { HttpContext } from '@adonisjs/core/http'
import Tenant from '#models/tenant'

export default class TenantsController {
  async index({ response }: HttpContext) {
    const tenants = await Tenant.all()
    return response.ok(tenants)
  }

  async store({ request, response }: HttpContext) {
    const data = request.only(['name', 'domain'])
    const tenant = await Tenant.create(data)
    return response.created(tenant)
  }

  async show({ params, response }: HttpContext) {
    const tenant = await Tenant.findOrFail(params.id)
    return response.ok(tenant)
  }

  async update({ params, request, response }: HttpContext) {
    const tenant = await Tenant.findOrFail(params.id)
    tenant.merge(request.only(['name', 'domain']))
    await tenant.save()
    return response.ok(tenant)
  }

  async destroy({ params, response }: HttpContext) {
    const tenant = await Tenant.findOrFail(params.id)
    await tenant.delete()
    return response.noContent()
  }
}
