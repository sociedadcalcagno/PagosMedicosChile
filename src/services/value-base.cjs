/**
 * Servicio para obtener valores base de cálculo
 */

/**
 * Obtiene el monto base según el tipo especificado en el convenio
 * @param {string} tipoBase - Tipo de valor base del convenio
 * @param {Object} datos - Datos de la atención con montos
 * @returns {number}
 */
function obtenerValorBase(tipoBase, datos) {
  switch (tipoBase) {
    case 'recaudado_exento':
      return parseFloat(datos.recaudado_exento || datos.monto_exento || 0);
      
    case 'recaudado_afecto':
      return parseFloat(datos.recaudado_afecto || datos.monto_afecto || 0);
      
    case 'recaudado_total':
      return parseFloat(datos.recaudado_total || datos.monto_bruto || datos.monto_total || datos.monto || 0);
      
    case 'devengado_hosp':
      return parseFloat(datos.devengado_hosp || datos.monto_hospital || 0);
      
    case 'fonasa_1':
      return parseFloat(datos.fonasa_1 || datos.valor_fonasa_1 || 0);
      
    case 'fonasa_2':
      return parseFloat(datos.fonasa_2 || datos.valor_fonasa_2 || 0);
      
    case 'fonasa_3':
      return parseFloat(datos.fonasa_3 || datos.valor_fonasa_3 || 0);
      
    case 'arancel_especifico':
      return parseFloat(datos.arancel_especifico || datos.valor_arancel || 0);
      
    default:
      // Default: recaudado_total
      return parseFloat(datos.recaudado_total || datos.monto_bruto || datos.monto_total || datos.monto || 0);
  }
}

/**
 * Valida que el monto base sea válido
 * @param {number} montoBase 
 * @returns {boolean}
 */
function esMontoValido(montoBase) {
  return !isNaN(montoBase) && montoBase >= 0;
}

/**
 * Obtiene información descriptiva del tipo de base
 * @param {string} tipoBase 
 * @returns {Object}
 */
function getInfoTipoBase(tipoBase) {
  const info = {
    'recaudado_exento': {
      nombre: 'Recaudado Exento',
      descripcion: 'Monto total exento de impuestos'
    },
    'recaudado_afecto': {
      nombre: 'Recaudado Afecto',
      descripcion: 'Monto total afecto a impuestos'
    },
    'recaudado_total': {
      nombre: 'Recaudado Total',
      descripcion: 'Monto bruto total de la prestación'
    },
    'devengado_hosp': {
      nombre: 'Devengado Hospital',
      descripcion: 'Monto correspondiente al hospital'
    },
    'fonasa_1': {
      nombre: 'FONASA Tramo 1',
      descripcion: 'Valor según arancel FONASA tramo 1'
    },
    'fonasa_2': {
      nombre: 'FONASA Tramo 2',
      descripcion: 'Valor según arancel FONASA tramo 2'
    },
    'fonasa_3': {
      nombre: 'FONASA Tramo 3',
      descripcion: 'Valor según arancel FONASA tramo 3'
    },
    'arancel_especifico': {
      nombre: 'Arancel Específico',
      descripcion: 'Arancel definido específicamente'
    }
  };

  return info[tipoBase] || {
    nombre: tipoBase,
    descripcion: 'Tipo de base no reconocido'
  };
}

module.exports = {
  obtenerValorBase,
  esMontoValido,
  getInfoTipoBase
};