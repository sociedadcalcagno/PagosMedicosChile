/**
 * Motor de Reglas - Núcleo del sistema de cálculo de convenios
 */

const { obtenerValorBase, esMontoValido } = require('./value-base.cjs');

/**
 * Aplica una regla de cálculo según su tipo
 * @param {Object} convenio - Convenio con tipo_regla y valor_regla
 * @param {number} montoBase - Monto base para el cálculo
 * @returns {number}
 */
function aplicarRegla(convenio, montoBase) {
  const { tipo_regla, valor_regla, combinacion } = convenio;

  switch (tipo_regla) {
    case '%':
      return montoBase * (valor_regla || 0);

    case 'fijo':
      return valor_regla || 0;

    case 'factor':
      return montoBase * (valor_regla || 1);

    case 'calc_mas_fijo':
      if (!combinacion) return 0;
      const porcentaje = combinacion.porcentaje || 0;
      const fijo = combinacion.fijo || 0;
      return (montoBase * porcentaje) + fijo;

    case 'tabla_acumulada':
      return aplicarTablaAcumulada(combinacion, montoBase);

    case 'tabla_directa':
      return aplicarTablaDirecta(combinacion, montoBase);

    default:
      return 0;
  }
}

/**
 * Aplica tabla acumulada (por tramos)
 * @param {Object} combinacion - {tramos: [{desde, hasta, valor, tipo}]}
 * @param {number} monto
 * @returns {number}
 */
function aplicarTablaAcumulada(combinacion, monto) {
  if (!combinacion || !combinacion.tramos) return 0;

  let total = 0;
  let montoRestante = monto;

  for (const tramo of combinacion.tramos) {
    const desde = tramo.desde || 0;
    const hasta = tramo.hasta || Infinity;
    const valor = tramo.valor || 0;
    const tipo = tramo.tipo || '%'; // % o fijo

    if (montoRestante <= 0) break;

    const montoTramo = Math.min(montoRestante, hasta - desde);
    
    if (montoTramo > 0) {
      if (tipo === '%') {
        total += montoTramo * valor;
      } else {
        total += valor;
      }
      montoRestante -= montoTramo;
    }
  }

  return total;
}

/**
 * Aplica tabla directa (busca tramo específico)
 * @param {Object} combinacion - {tramos: [{desde, hasta, valor}]}
 * @param {number} monto
 * @returns {number}
 */
function aplicarTablaDirecta(combinacion, monto) {
  if (!combinacion || !combinacion.tramos) return 0;

  for (const tramo of combinacion.tramos) {
    const desde = tramo.desde || 0;
    const hasta = tramo.hasta || Infinity;
    const valor = tramo.valor || 0;

    if (monto >= desde && monto < hasta) {
      return valor;
    }
  }

  return 0;
}

/**
 * Verifica si un convenio está vigente para una fecha
 * @param {Object} convenio
 * @param {string} fechaEvento
 * @returns {boolean}
 */
function estaVigente(convenio, fechaEvento) {
  if (!fechaEvento) return true;

  const fecha = new Date(fechaEvento);
  const inicio = new Date(convenio.vigencia_inicio);
  const fin = convenio.vigencia_fin ? new Date(convenio.vigencia_fin) : null;

  if (fecha < inicio) return false;
  if (fin && fecha > fin) return false;

  return true;
}

/**
 * Calcula el honorario según un convenio específico
 * @param {Object} convenio
 * @param {Object} datos
 * @returns {Object}
 */
function calcularHonorario(convenio, datos) {
  // Obtener valor base
  const montoBase = obtenerValorBase(convenio.valor_base, datos);
  
  if (!esMontoValido(montoBase)) {
    return {
      monto: 0,
      advertencias: [`Monto base inválido para ${convenio.valor_base}`]
    };
  }

  // Aplicar regla
  const montoCalculado = aplicarRegla(convenio, montoBase);

  return {
    monto: Math.max(0, montoCalculado), // No negativos
    montoBase,
    tipoRegla: convenio.tipo_regla,
    valorRegla: convenio.valor_regla,
    valorBase: convenio.valor_base,
    advertencias: []
  };
}

/**
 * Obtiene descripción amigable de una regla
 * @param {Object} convenio
 * @returns {string}
 */
function describirRegla(convenio) {
  const { tipo_regla, valor_regla } = convenio;

  switch (tipo_regla) {
    case '%':
      return `${(valor_regla * 100).toFixed(1)}% del ${convenio.valor_base}`;
    case 'fijo':
      return `Monto fijo de $${valor_regla?.toLocaleString('es-CL')}`;
    case 'factor':
      return `Factor ${valor_regla}x del ${convenio.valor_base}`;
    case 'calc_mas_fijo':
      return `Cálculo mixto (% + fijo)`;
    case 'tabla_acumulada':
      return `Tabla acumulada por tramos`;
    case 'tabla_directa':
      return `Tabla directa por rangos`;
    default:
      return 'Regla no reconocida';
  }
}

module.exports = {
  aplicarRegla,
  estaVigente,
  calcularHonorario,
  describirRegla,
  aplicarTablaAcumulada,
  aplicarTablaDirecta
};