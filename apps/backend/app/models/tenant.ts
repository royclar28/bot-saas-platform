import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Bot from '#models/bot'
import Customer from '#models/customer'
import Inventory from '#models/inventory'

export default class Tenant extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare domain: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => Bot)
  declare bots: HasMany<typeof Bot>

  @hasMany(() => Customer)
  declare customers: HasMany<typeof Customer>

  @hasMany(() => Inventory)
  declare inventories: HasMany<typeof Inventory>
}
