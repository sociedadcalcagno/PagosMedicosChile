/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Limpiar tablas existentes
  await knex('convenio_bonos').del();
  await knex('convenio_criterios').del();
  await knex('convenios').del();
  await knex('auditoria_calculos').del();

  // Resetear secuencias
  await knex.raw('ALTER SEQUENCE convenios_id_seq RESTART WITH 1');
  await knex.raw('ALTER SEQUENCE convenio_criterios_id_seq RESTART WITH 1');
  await knex.raw('ALTER SEQUENCE convenio_bonos_id_seq RESTART WITH 1');

  // 1. Convenio base: Cirugía 70%
  const [convenio_cirugia] = await knex('convenios').insert({
    nombre: 'Base Cirugía 70%',
    estado: true,
    prioridad: 10,
    vigencia_inicio: '2024-01-01',
    vigencia_fin: null,
    fecha_referencia: 'ejecucion',
    tipo_regla: '%',
    valor_regla: 0.70,
    valor_base: 'recaudado_total',
    modo_exclusividad: 'first_win'
  }).returning('id');

  // Criterio: tipo_prestacion = 'cirugia'
  await knex('convenio_criterios').insert({
    convenio_id: convenio_cirugia.id,
    clave: 'tipo_prestacion',
    operador: 'eq',
    valor: 'cirugia'
  });

  // 2. Bono +10% para ginecología/obstetricia
  const [convenio_bono_gine] = await knex('convenios').insert({
    nombre: 'Bono Ginecología/Obstetricia +10%',
    estado: true,
    prioridad: 5, // Mayor prioridad para que se evalúe primero
    vigencia_inicio: '2024-01-01',
    vigencia_fin: null,
    fecha_referencia: 'ejecucion',
    tipo_regla: '%',
    valor_regla: 0.80, // 70% + 10% = 80%
    valor_base: 'recaudado_total',
    modo_exclusividad: 'first_win'
  }).returning('id');

  // Criterios: tipo_prestacion = 'cirugia' AND especialidad in ('ginecologia','obstetricia')
  await knex('convenio_criterios').insert([
    {
      convenio_id: convenio_bono_gine.id,
      clave: 'tipo_prestacion',
      operador: 'eq',
      valor: 'cirugia'
    },
    {
      convenio_id: convenio_bono_gine.id,
      clave: 'especialidad',
      operador: 'in',
      valor: JSON.stringify(['ginecologia', 'obstetricia'])
    }
  ]);

  // 3. Visita bebé 20%
  const [convenio_visita_bebe] = await knex('convenios').insert({
    nombre: 'Visita Bebé 20%',
    estado: true,
    prioridad: 20,
    vigencia_inicio: '2024-01-01',
    vigencia_fin: null,
    fecha_referencia: 'ejecucion',
    tipo_regla: '%',
    valor_regla: 0.20,
    valor_base: 'recaudado_total',
    modo_exclusividad: 'first_win'
  }).returning('id');

  // Criterios: tipo_prestacion = 'visita' AND rol_paciente = 'bebe'
  await knex('convenio_criterios').insert([
    {
      convenio_id: convenio_visita_bebe.id,
      clave: 'tipo_prestacion',
      operador: 'eq',
      valor: 'visita'
    },
    {
      convenio_id: convenio_visita_bebe.id,
      clave: 'rol_paciente',
      operador: 'eq',
      valor: 'bebe'
    }
  ]);

  // 4. Visita madre 15%
  const [convenio_visita_madre] = await knex('convenios').insert({
    nombre: 'Visita Madre 15%',
    estado: true,
    prioridad: 20,
    vigencia_inicio: '2024-01-01',
    vigencia_fin: null,
    fecha_referencia: 'ejecucion',
    tipo_regla: '%',
    valor_regla: 0.15,
    valor_base: 'recaudado_total',
    modo_exclusividad: 'first_win'
  }).returning('id');

  // Criterios: tipo_prestacion = 'visita' AND rol_paciente = 'madre'
  await knex('convenio_criterios').insert([
    {
      convenio_id: convenio_visita_madre.id,
      clave: 'tipo_prestacion',
      operador: 'eq',
      valor: 'visita'
    },
    {
      convenio_id: convenio_visita_madre.id,
      clave: 'rol_paciente',
      operador: 'eq',
      valor: 'madre'
    }
  ]);

  // 5. Insumos 0% (bloquea honorarios por materiales)
  const [convenio_insumos] = await knex('convenios').insert({
    nombre: 'Insumos 0% (Sin Honorarios)',
    estado: true,
    prioridad: 5, // Alta prioridad para bloquear
    vigencia_inicio: '2024-01-01',
    vigencia_fin: null,
    fecha_referencia: 'ejecucion',
    tipo_regla: '%',
    valor_regla: 0.0,
    valor_base: 'recaudado_total',
    modo_exclusividad: 'first_win'
  }).returning('id');

  // Criterio: tipo_prestacion = 'insumo'
  await knex('convenio_criterios').insert({
    convenio_id: convenio_insumos.id,
    clave: 'tipo_prestacion',
    operador: 'eq',
    valor: 'insumo'
  });

  console.log('Seeds cargados exitosamente:');
  console.log('- Base Cirugía 70%');
  console.log('- Bono Ginecología/Obstetricia +10% (Total: 80%)');
  console.log('- Visita Bebé 20%');
  console.log('- Visita Madre 15%');
  console.log('- Insumos 0%');
};