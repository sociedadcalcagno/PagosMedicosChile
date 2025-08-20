/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('convenio_criterios', function(table) {
    table.increments('id').primary();
    table.integer('convenio_id').references('id').inTable('convenios').onDelete('CASCADE');
    table.text('clave').notNullable(); // ej: 'tipo_prestacion','especialidad','rol_paciente','tipo_dia'
    table.text('operador').notNullable().defaultTo('eq');
    table.check("operador in ('eq','in','like','gte','lte','between','regex')");
    table.text('valor').notNullable(); // texto o JSON stringificado
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('convenio_criterios');
};