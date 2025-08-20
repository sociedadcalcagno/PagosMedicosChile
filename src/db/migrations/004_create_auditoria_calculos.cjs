/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('auditoria_calculos', function(table) {
    table.bigIncrements('id').primary();
    table.timestamp('ts', { useTz: true }).defaultTo(knex.fn.now());
    table.jsonb('entrada');
    table.jsonb('reglas_aplicadas');
    table.jsonb('resultado');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('auditoria_calculos');
};