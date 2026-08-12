import type { HttpContext } from '@adonisjs/core/http'
import Inventory from '#models/inventory'

export default class InventoriesController {
  async index({ request, response }: HttpContext) {
    const tenantId = request.qs().tenantId
    if (!tenantId) return response.badRequest('tenantId is required')

    const inventories = await Inventory.query().where('tenantId', tenantId).preload('category')
    return response.ok(inventories)
  }

  async store({ request, response }: HttpContext) {
    const data = request.only([
      'tenantId', 'categoryId', 'description', 'size', 'color', 
      'gender', 'style', 'costPrice', 'salePrice', 'imageUrl', 'status', 'isAvailable'
    ])
    const inventory = await Inventory.create(data)
    return response.created(inventory)
  }

  async show({ params, response }: HttpContext) {
    const inventory = await Inventory.query().where('id', params.id).preload('category').firstOrFail()
    return response.ok(inventory)
  }

  async update({ params, request, response }: HttpContext) {
    const inventory = await Inventory.findOrFail(params.id)
    inventory.merge(request.only([
      'categoryId', 'description', 'size', 'color', 
      'gender', 'style', 'costPrice', 'salePrice', 'imageUrl', 'status', 'isAvailable'
    ]))
    await inventory.save()
    return response.ok(inventory)
  }

  async destroy({ params, response }: HttpContext) {
    const inventory = await Inventory.findOrFail(params.id)
    await inventory.delete()
    return response.noContent()
  }
}
