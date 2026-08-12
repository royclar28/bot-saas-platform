import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'chat_histories'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('bot_id').unsigned().references('id').inTable('bots').onDelete('CASCADE')
      table.string('session_id', 255).notNullable()
      table.jsonb('message').notNullable()
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
      
      table.index(['bot_id', 'session_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
