import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'inventories'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('tenant_id').unsigned().references('id').inTable('tenants').onDelete('CASCADE')
      table.integer('category_id').unsigned().references('id').inTable('inventory_categories').onDelete('SET NULL')
      table.string('description', 255).notNullable()
      table.string('size', 20).nullable()
      table.string('color', 50).nullable()
      table.string('gender', 50).nullable()
      table.string('style', 100).nullable()
      table.decimal('cost_price', 10, 2).defaultTo(0)
      table.decimal('sale_price', 10, 2).defaultTo(0)
      table.text('image_url').nullable()
      table.string('status', 20).defaultTo('draft')
      table.boolean('is_available').defaultTo(true)
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
      
      // Unique constraint for items within the same tenant
      table.unique(['tenant_id', 'description', 'category_id', 'color', 'gender', 'style'], 'unique_inventory_item')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
