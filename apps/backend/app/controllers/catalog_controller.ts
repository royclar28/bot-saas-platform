import type { HttpContext } from '@adonisjs/core/http'
import Inventory from '#models/inventory'

export default class CatalogController {
    public async index({ request, response }: HttpContext) {
        const tenantId = request.input('tenantId', 1)
        
        const products = await Inventory.query()
            .where('tenantId', tenantId)
            .where('status', '!=', 'draft')
            .where('isAvailable', true)
            .preload('category')
            
        return response.ok(products)
    }
}
