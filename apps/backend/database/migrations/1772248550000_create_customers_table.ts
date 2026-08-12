import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'customers'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('tenant_id').unsigned().references('id').inTable('tenants').onDelete('CASCADE')
      table.string('name', 255).notNullable()
      table.string('phone', 50).notNullable()
      table.decimal('current_debt', 12, 2).defaultTo(0)
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
      
      // Un número de teléfono es único por negocio
      table.unique(['tenant_id', 'phone'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
