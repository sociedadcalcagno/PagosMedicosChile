/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('convenios', function(table) {
    table.increments('id').primary();
    table.text('nombre').notNullable();
    table.boolean('estado').notNullable().defaultTo(true);
    table.integer('prioridad').notNullable().defaultTo(100); // menor = evalúa primero
    table.date('vigencia_inicio').notNullable();
    table.date('vigencia_fin').nullable();
    table.text('fecha_referencia').notNullable().defaultTo('ejecucion');
    table.check("fecha_referencia in ('ejecucion','venta_pago')");
    table.text('tipo_regla').notNullable().defaultTo('%');
    table.check("tipo_regla in ('%','fijo','factor','tabla_acumulada','tabla_directa','calc_mas_fijo')");
    table.decimal('valor_regla', 12, 4).nullable();
    table.jsonb('combinacion').nullable(); // para tablas o calc_mas_fijo
    table.text('valor_base').notNullable().defaultTo('recaudado_total');
    table.check("valor_base in ('recaudado_exento','recaudado_afecto','recaudado_total','devengado_hosp','fonasa_1','fonasa_2','fonasa_3','arancel_especifico')");
    table.text('modo_exclusividad').notNullable().defaultTo('first_win');
    table.check("modo_exclusividad in ('first_win','stack')");
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('convenios');
};