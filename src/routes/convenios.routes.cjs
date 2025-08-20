/**
 * Rutas para la gestión de convenios
 */

const express = require('express');
const router = express.Router();

// Simulamos una conexión knex (se configurará en index.js)
let knex;

function initDB(knexConnection) {
  knex = knexConnection;
}

/**
 * GET /api/convenios - Listar convenios
 */
router.get('/', async (req, res) => {
  try {
    const { estado, vigente } = req.query;
    
    let query = knex('convenios')
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
      .groupBy('convenios.id')
      .orderBy('convenios.prioridad');

    // Filtros
    if (estado !== undefined) {
      query = query.where('convenios.estado', estado === 'true');
    }

    if (vigente === 'true') {
      const hoy = new Date().toISOString().split('T')[0];
      query = query
        .where('convenios.vigencia_inicio', '<=', hoy)
        .where(function() {
          this.whereNull('convenios.vigencia_fin').orWhere('convenios.vigencia_fin', '>=', hoy);
        });
    }

    const convenios = await query;
    
    res.json({
      success: true,
      data: convenios,
      count: convenios.length
    });
    
  } catch (error) {
    console.error('Error al listar convenios:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

/**
 * GET /api/convenios/:id - Obtener convenio por ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const convenio = await knex('convenios').where('id', id).first();
    
    if (!convenio) {
      return res.status(404).json({
        success: false,
        message: 'Convenio no encontrado'
      });
    }

    // Obtener criterios
    const criterios = await knex('convenio_criterios').where('convenio_id', id);
    
    // Obtener bonos
    const bonos = await knex('convenio_bonos').where('convenio_id', id);
    
    res.json({
      success: true,
      data: {
        ...convenio,
        criterios,
        bonos
      }
    });
    
  } catch (error) {
    console.error('Error al obtener convenio:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

/**
 * POST /api/convenios - Crear nuevo convenio
 */
router.post('/', async (req, res) => {
  const trx = await knex.transaction();
  
  try {
    const {
      nombre,
      estado = true,
      prioridad = 100,
      vigencia_inicio,
      vigencia_fin,
      fecha_referencia = 'ejecucion',
      tipo_regla = '%',
      valor_regla,
      combinacion,
      valor_base = 'recaudado_total',
      modo_exclusividad = 'first_win',
      criterios = [],
      bonos = []
    } = req.body;

    // Validaciones básicas
    if (!nombre || !vigencia_inicio) {
      await trx.rollback();
      return res.status(422).json({
        success: false,
        message: 'Campos requeridos: nombre, vigencia_inicio'
      });
    }

    // Crear convenio
    const [convenio] = await trx('convenios').insert({
      nombre,
      estado,
      prioridad,
      vigencia_inicio,
      vigencia_fin,
      fecha_referencia,
      tipo_regla,
      valor_regla,
      combinacion,
      valor_base,
      modo_exclusividad
    }).returning('*');

    // Crear criterios
    if (criterios.length > 0) {
      const criteriosConId = criterios.map(c => ({
        convenio_id: convenio.id,
        clave: c.clave,
        operador: c.operador || 'eq',
        valor: c.valor
      }));
      
      await trx('convenio_criterios').insert(criteriosConId);
    }

    // Crear bonos
    if (bonos.length > 0) {
      const bonosConId = bonos.map(b => ({
        convenio_id: convenio.id,
        descripcion: b.descripcion,
        porcentaje: b.porcentaje,
        criterio_clave: b.criterio_clave,
        criterio_operador: b.criterio_operador || 'eq',
        criterio_valor: b.criterio_valor,
        prioridad: b.prioridad || 100
      }));
      
      await trx('convenio_bonos').insert(bonosConId);
    }

    await trx.commit();

    res.status(201).json({
      success: true,
      message: 'Convenio creado exitosamente',
      data: { id: convenio.id, ...convenio }
    });
    
  } catch (error) {
    await trx.rollback();
    console.error('Error al crear convenio:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

/**
 * PUT /api/convenios/:id - Actualizar convenio
 */
router.put('/:id', async (req, res) => {
  const trx = await knex.transaction();
  
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    // Remover arrays de criterios y bonos del update principal
    delete updateData.criterios;
    delete updateData.bonos;
    
    // Verificar que existe
    const convenioExistente = await trx('convenios').where('id', id).first();
    if (!convenioExistente) {
      await trx.rollback();
      return res.status(404).json({
        success: false,
        message: 'Convenio no encontrado'
      });
    }

    // Actualizar convenio principal
    await trx('convenios').where('id', id).update({
      ...updateData,
      updated_at: knex.fn.now()
    });

    // Actualizar criterios si se proporcionan
    if (req.body.criterios) {
      await trx('convenio_criterios').where('convenio_id', id).del();
      
      if (req.body.criterios.length > 0) {
        const criteriosConId = req.body.criterios.map(c => ({
          convenio_id: id,
          clave: c.clave,
          operador: c.operador || 'eq',
          valor: c.valor
        }));
        
        await trx('convenio_criterios').insert(criteriosConId);
      }
    }

    // Actualizar bonos si se proporcionan
    if (req.body.bonos) {
      await trx('convenio_bonos').where('convenio_id', id).del();
      
      if (req.body.bonos.length > 0) {
        const bonosConId = req.body.bonos.map(b => ({
          convenio_id: id,
          descripcion: b.descripcion,
          porcentaje: b.porcentaje,
          criterio_clave: b.criterio_clave,
          criterio_operador: b.criterio_operador || 'eq',
          criterio_valor: b.criterio_valor,
          prioridad: b.prioridad || 100
        }));
        
        await trx('convenio_bonos').insert(bonosConId);
      }
    }

    await trx.commit();

    res.json({
      success: true,
      message: 'Convenio actualizado exitosamente'
    });
    
  } catch (error) {
    await trx.rollback();
    console.error('Error al actualizar convenio:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

/**
 * DELETE /api/convenios/:id - Deshabilitar convenio (soft delete)
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await knex('convenios')
      .where('id', id)
      .update({
        estado: false,
        updated_at: knex.fn.now()
      });

    if (result === 0) {
      return res.status(404).json({
        success: false,
        message: 'Convenio no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Convenio deshabilitado exitosamente'
    });
    
  } catch (error) {
    console.error('Error al deshabilitar convenio:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

module.exports = { router, initDB };