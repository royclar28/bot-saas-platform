import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Tenant from '#models/tenant'
import BotRole from '#models/bot_role'
import ChatHistory from '#models/chat_history'

export default class Bot extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare tenantId: number

  @column()
  declare instanceName: string

  @column()
  declare phoneNumber: string

  @column()
  declare status: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Tenant)
  declare tenant: BelongsTo<typeof Tenant>

  @hasMany(() => BotRole)
  declare roles: HasMany<typeof BotRole>
  
  @hasMany(() => ChatHistory)
  declare chatHistories: HasMany<typeof ChatHistory>
}
