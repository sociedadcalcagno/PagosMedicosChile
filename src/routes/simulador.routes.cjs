/**
 * Rutas para el simulador de convenios
 */

const express = require('express');
const router = express.Router();
const { resolverConvenios, generarTrazabilidad } = require('../services/resolver.cjs');

// Simulamos una conexión knex
let knex;

function initDB(knexConnection) {
  knex = knexConnection;
}

/**
 * Carga todos los convenios con sus criterios y bonos
 */
async function cargarConvenios() {
  return await knex('convenios')
    .leftJoin('convenio_criterios', 'convenios.id', 'convenio_criterios.convenio_id')
    .leftJoin('convenio_bonos', 'convenios.id', 'convenio_bonos.convenio_id')
    .select(
      'convenios.*',
      knex.raw(`
        COALESCE(
          JSON_AGG(
            DISTINCT CASE WHEN convenio_criterios.id IS NOT NULL THEN
              JSON_BUILD_OBJECT(
                'id', convenio_criterios.id,
                'clave', convenio_criterios.clave,
                'operador', convenio_criterios.operador,
                'valor', convenio_criterios.valor
              )
            END
          ) FILTER (WHERE convenio_criterios.id IS NOT NULL),
          '[]'::json
        ) as criterios
      `),
      knex.raw(`
        COALESCE(
          JSON_AGG(
            DISTINCT CASE WHEN convenio_bonos.id IS NOT NULL THEN
              JSON_BUILD_OBJECT(
                'id', convenio_bonos.id,
                'descripcion', convenio_bonos.descripcion,
                'porcentaje', convenio_bonos.porcentaje,
                'criterio_clave', convenio_bonos.criterio_clave,
                'criterio_operador', convenio_bonos.criterio_operador,
                'criterio_valor', convenio_bonos.criterio_valor
              )
            END
          ) FILTER (WHERE convenio_bonos.id IS NOT NULL),
          '[]'::json
        ) as bonos
      `)
    )
    .where('convenios.estado', true)
    .groupBy('convenios.id')
    .orderBy('convenios.prioridad');
}

/**
 * Procesa una línea de atención médica
 * @param {Object} atencion - Datos de la atención
 * @param {Array} convenios - Lista de convenios disponibles
 * @returns {Object}
 */
function procesarAtencion(atencion, convenios) {
  // Resolver convenios aplicables
  const resolucion = resolverConvenios(convenios, atencion, 'first_win');
  
  // Generar resultado
  const resultado = {
    entrada: atencion,
    valor_base_usado: resolucion.convenio ? resolucion.convenio.valor_base : null,
    reglas_base_aplicadas: resolucion.convenio ? [resolucion.convenio.nombre] : [],
    bonos_aplicados: [], // TODO: Implementar bonos stack si se requiere
    porcentaje_total: resolucion.convenio ? resolucion.convenio.valor_regla * 100 : 0,
    monto_profesional: resolucion.resultado.monto,
    advertencias: resolucion.resultado.advertencias || [],
    trazabilidad: generarTrazabilidad(resolucion)
  };

  return resultado;
}

/**
 * Guarda auditoría en base de datos
 * @param {Object} entrada
 * @param {Array} resultados
 */
async function guardarAuditoria(entrada, resultados) {
  try {
    await knex('auditoria_calculos').insert({
      entrada: JSON.stringify(entrada),
      reglas_aplicadas: JSON.stringify(resultados.map(r => r.trazabilidad)),
      resultado: JSON.stringify(resultados)
    });
  } catch (error) {
    console.error('Error al guardar auditoría:', error);
  }
}

/**
 * POST /api/simular - Simular cálculo de honorarios
 */
router.post('/', async (req, res) => {
  try {
    const { atenciones, fecha_evento } = req.body;

    if (!atenciones || !Array.isArray(atenciones)) {
      return res.status(422).json({
        success: false,
        message: 'Se requiere array de atenciones'
      });
    }

    // Cargar convenios activos
    const convenios = await cargarConvenios();

    // Procesar cada atención
    const resultados = [];
    
    for (const atencion of atenciones) {
      // Agregar fecha_evento si se proporciona
      const atencionConFecha = {
        ...atencion,
        fecha_evento: fecha_evento || atencion.fecha_evento || new Date().toISOString().split('T')[0]
      };

      const resultado = procesarAtencion(atencionConFecha, convenios);
      resultados.push(resultado);
    }

    // Guardar auditoría
    await guardarAuditoria({ atenciones, fecha_evento }, resultados);

    // Generar resumen
    const resumen = {
      total_atenciones: atenciones.length,
      total_honorarios: resultados.reduce((sum, r) => sum + r.monto_profesional, 0),
      atenciones_sin_convenio: resultados.filter(r => r.advertencias.length > 0).length,
      convenios_utilizados: [...new Set(resultados.map(r => r.reglas_base_aplicadas).flat())].length
    };

    res.json({
      success: true,
      data: {
        resultados,
        resumen,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error en simulación:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

/**
 * POST /api/simular/csv - Simular desde archivo CSV
 */
router.post('/csv', async (req, res) => {
  try {
    // TODO: Implementar parser CSV
    res.status(501).json({
      success: false,
      message: 'Funcionalidad CSV pendiente de implementar'
    });
  } catch (error) {
    console.error('Error en simulación CSV:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

/**
 * GET /api/simular/ejemplo - Obtener datos de ejemplo
 */
router.get('/ejemplo', (req, res) => {
  const ejemploMadreBebe = [
    {
      id: 'madre-cesarea',
      tipo_prestacion: 'cirugia',
      especialidad: 'ginecologia',
      rol_paciente: 'madre',
      monto_bruto: 1000000,
      descripcion: 'Cesárea - Madre'
    },
    {
      id: 'bebe-visita-1',
      tipo_prestacion: 'visita',
      rol_paciente: 'bebe',
      monto_bruto: 80000,
      descripcion: 'Visita de control - Bebé'
    },
    {
      id: 'bebe-insumo',
      tipo_prestacion: 'insumo',
      rol_paciente: 'bebe',
      monto_bruto: 150000,
      descripcion: 'Materiales médicos - Bebé'
    },
    {
      id: 'bebe-visita-2',
      tipo_prestacion: 'visita',
      rol_paciente: 'bebe',
      especialidad: 'cardiologia',
      monto_bruto: 90000,
      descripcion: 'Visita cardiología - Bebé'
    }
  ];

  res.json({
    success: true,
    data: {
      atenciones: ejemploMadreBebe,
      fecha_evento: new Date().toISOString().split('T')[0],
      descripcion: 'Ejemplo: Madre cesárea + 3 atenciones bebé'
    }
  });
});

module.exports = { router, initDB };