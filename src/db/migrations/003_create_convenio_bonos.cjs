/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('convenio_bonos', function(table) {
    table.increments('id').primary();
    table.integer('convenio_id').references('id').inTable('convenios').onDelete('CASCADE');
    table.text('descripcion').notNullable();
    table.decimal('porcentaje', 12, 4).notNullable().defaultTo(0); // 0.10 = +10%
    table.text('criterio_clave').notNullable();
    table.text('criterio_operador').notNullable().defaultTo('eq');
    table.check("criterio_operador in ('eq','in','like')");
    table.text('criterio_valor').notNullable(); // texto o JSON
    table.integer('prioridad').notNullable().defaultTo(100);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('convenio_bonos');
};