import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Tenant from '#models/tenant'
import InventoryCategory from '#models/inventory_category'

export default class Inventory extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare tenantId: number

  @column()
  declare categoryId: number | null

  @column()
  declare description: string

  @column()
  declare size: string | null

  @column()
  declare color: string | null

  @column()
  declare gender: string | null

  @column()
  declare style: string | null

  @column()
  declare costPrice: number

  @column()
  declare salePrice: number

  @column()
  declare imageUrl: string | null

  @column()
  declare status: string

  @column()
  declare isAvailable: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Tenant)
  declare tenant: BelongsTo<typeof Tenant>

  @belongsTo(() => InventoryCategory, { foreignKey: 'categoryId' })
  declare category: BelongsTo<typeof InventoryCategory>
}
