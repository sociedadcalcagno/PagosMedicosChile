/**
 * Servicio para resolver conflictos entre convenios
 */

const { evaluarConvenio, normalizarDatos } = require('./criteria-matcher.cjs');
const { calcularHonorario, estaVigente } = require('./rules-engine.cjs');

/**
 * Encuentra todos los convenios aplicables para una atención
 * @param {Array} convenios - Lista de convenios
 * @param {Object} datos - Datos de la atención
 * @returns {Array}
 */
function encontrarConveniosAplicables(convenios, datos) {
  const datosNormalizados = normalizarDatos(datos);
  
  return convenios
    .filter(convenio => {
      // Solo convenios activos
      if (!convenio.estado) return false;
      
      // Verificar vigencia
      if (!estaVigente(convenio, datosNormalizados.fecha_evento)) return false;
      
      // Evaluar criterios
      return evaluarConvenio(convenio, datosNormalizados);
    })
    .sort((a, b) => a.prioridad - b.prioridad); // Ordenar por prioridad (menor = primero)
}

/**
 * Resuelve usando estrategia first_win
 * @param {Array} conveniosAplicables
 * @param {Object} datos
 * @returns {Object}
 */
function resolverFirstWin(conveniosAplicables, datos) {
  if (conveniosAplicables.length === 0) {
    return {
      convenio: null,
      resultado: { monto: 0, advertencias: ['Sin convenio aplicable'] },
      alternativas: []
    };
  }

  // Tomar el primero (mayor prioridad)
  const convenioGanador = conveniosAplicables[0];
  const resultado = calcularHonorario(convenioGanador, datos);
  
  return {
    convenio: convenioGanador,
    resultado,
    alternativas: conveniosAplicables.slice(1) // Los demás como alternativas
  };
}

/**
 * Resuelve usando estrategia stack (acumular bonos)
 * @param {Array} conveniosAplicables
 * @param {Object} datos
 * @returns {Object}
 */
function resolverStack(conveniosAplicables, datos) {
  if (conveniosAplicables.length === 0) {
    return {
      convenios: [],
      resultado: { monto: 0, advertencias: ['Sin convenio aplicable'] },
      detalle: []
    };
  }

  let montoTotal = 0;
  const detalle = [];
  const advertencias = [];

  for (const convenio of conveniosAplicables) {
    const resultado = calcularHonorario(convenio, datos);
    
    montoTotal += resultado.monto;
    detalle.push({
      convenio: convenio.nombre,
      monto: resultado.monto,
      base: resultado.montoBase,
      regla: `${convenio.tipo_regla}: ${convenio.valor_regla}`
    });

    if (resultado.advertencias && resultado.advertencias.length > 0) {
      advertencias.push(...resultado.advertencias);
    }
  }

  return {
    convenios: conveniosAplicables,
    resultado: {
      monto: montoTotal,
      advertencias
    },
    detalle
  };
}

/**
 * Resuelve convenios según la estrategia especificada
 * @param {Array} convenios - Todos los convenios
 * @param {Object} datos - Datos de la atención
 * @param {string} estrategia - 'first_win' | 'stack'
 * @returns {Object}
 */
function resolverConvenios(convenios, datos, estrategia = 'first_win') {
  const aplicables = encontrarConveniosAplicables(convenios, datos);
  
  const metadata = {
    total_convenios: convenios.length,
    convenios_aplicables: aplicables.length,
    estrategia_usada: estrategia,
    fecha_evaluacion: new Date().toISOString(),
    datos_evaluados: Object.keys(datos)
  };

  let resolucion;
  
  if (estrategia === 'stack') {
    resolucion = resolverStack(aplicables, datos);
  } else {
    resolucion = resolverFirstWin(aplicables, datos);
  }

  return {
    ...resolucion,
    metadata
  };
}

/**
 * Compara dos montos y retorna el mayor (para estrategia comparador)
 * @param {Object} resultado1
 * @param {Object} resultado2
 * @returns {Object}
 */
function compararMontos(resultado1, resultado2) {
  if (!resultado1.convenio) return resultado2;
  if (!resultado2.convenio) return resultado1;
  
  return resultado1.resultado.monto >= resultado2.resultado.monto ? resultado1 : resultado2;
}

/**
 * Genera trazabilidad detallada del proceso
 * @param {Object} resolucion
 * @returns {Object}
 */
function generarTrazabilidad(resolucion) {
  const { metadata, convenio, convenios, resultado, alternativas, detalle } = resolucion;
  
  return {
    resumen: {
      convenios_evaluados: metadata.total_convenios,
      convenios_aplicables: metadata.convenios_aplicables,
      estrategia: metadata.estrategia_usada,
      monto_final: resultado.monto
    },
    convenio_seleccionado: convenio ? {
      id: convenio.id,
      nombre: convenio.nombre,
      prioridad: convenio.prioridad,
      tipo_regla: convenio.tipo_regla,
      valor_regla: convenio.valor_regla
    } : null,
    convenios_aplicables: (convenios || [convenio]).filter(c => c).map(c => ({
      id: c.id,
      nombre: c.nombre,
      prioridad: c.prioridad
    })),
    alternativas_descartadas: (alternativas || []).map(c => ({
      id: c.id,
      nombre: c.nombre,
      motivo: 'Menor prioridad'
    })),
    detalle_calculos: detalle || [],
    advertencias: resultado.advertencias || []
  };
}

module.exports = {
  encontrarConveniosAplicables,
  resolverFirstWin,
  resolverStack,
  resolverConvenios,
  compararMontos,
  generarTrazabilidad
};