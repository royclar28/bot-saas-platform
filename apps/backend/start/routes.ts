/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const CustomersController = () => import('#controllers/customers_controller')
const TransactionsController = () => import('#controllers/transactions_controller')
const StatsController = () => import('#controllers/stats_controller')
const WebhookController = () => import('#controllers/webhook_controller')

router.get('/', async () => ({
    name: 'GabyStore V2 API',
    version: '2.0.0',
}))

router.get('/api/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'gabystore-v2-backend',
}))

// ─── Catálogo Público ────────────────────────────────────────────────────────
const CatalogController = () => import('#controllers/catalog_controller')
router.get('/api/catalog', [CatalogController, 'index'])

// ─── Clientes (Fiados) ───────────────────────────────────────────────────────
router
    .group(() => {
        router.get('customers', [CustomersController, 'index'])
        router.post('customers', [CustomersController, 'store'])
        router.get('customers/by-phone/:phone', [CustomersController, 'findByPhone'])
        router.get('customers/:id', [CustomersController, 'show'])
        router.put('customers/:id', [CustomersController, 'update'])
        router.delete('customers/:id', [CustomersController, 'destroy'])

        // ─── Transacciones (anidadas en cliente) ──────────────────────────────────
        router.get('customers/:customerId/transactions', [TransactionsController, 'index'])
        router.post('customers/:customerId/transactions', [TransactionsController, 'store'])
        router.delete('customers/:customerId/transactions/:id', [TransactionsController, 'destroy'])

        // ─── Estadísticas ─────────────────────────────────────────────────────────
        router.get('stats', [StatsController, 'index'])

        // ─── Webhook (n8n WhatsApp) ───────────────────────────────────────────────
        router.post('webhook/whatsapp', [WebhookController, 'handle'])

        // ─── Admin SaaS ─────────────────────────────────────────────────────────
        const TenantsController = () => import('#controllers/admin/tenants_controller')
        const BotsController = () => import('#controllers/admin/bots_controller')
        const InventoriesController = () => import('#controllers/admin/inventories_controller')
        
        router.resource('admin/tenants', TenantsController).apiOnly()
        router.resource('admin/bots', BotsController).apiOnly()
        router.get('admin/bots/:id/qr', [BotsController, 'qr'])
        router.put('admin/bots/:id/role', [BotsController, 'updateRole'])
        router.resource('admin/inventories', InventoriesController).apiOnly()
    })
    .prefix('/api')
    .use(middleware.apiKey())
