/**
 * Servicio para evaluar criterios de convenios
 */

/**
 * Evalúa si un criterio coincide con los datos de entrada
 * @param {Object} criterio - {clave, operador, valor}
 * @param {Object} datos - Datos de la atención médica
 * @returns {boolean}
 */
function evaluarCriterio(criterio, datos) {
  const { clave, operador, valor } = criterio;
  const valorDatos = datos[clave];

  if (valorDatos === undefined || valorDatos === null) {
    return false;
  }

  switch (operador) {
    case 'eq':
      return valorDatos === valor;

    case 'in':
      try {
        const lista = typeof valor === 'string' ? JSON.parse(valor) : valor;
        return Array.isArray(lista) && lista.includes(valorDatos);
      } catch (e) {
        return false;
      }

    case 'like':
      return String(valorDatos).toLowerCase().includes(String(valor).toLowerCase());

    case 'gte':
      return parseFloat(valorDatos) >= parseFloat(valor);

    case 'lte':
      return parseFloat(valorDatos) <= parseFloat(valor);

    case 'between':
      try {
        const [min, max] = typeof valor === 'string' ? JSON.parse(valor) : valor;
        const numValue = parseFloat(valorDatos);
        return numValue >= parseFloat(min) && numValue <= parseFloat(max);
      } catch (e) {
        return false;
      }

    case 'regex':
      try {
        const regex = new RegExp(valor, 'i');
        return regex.test(String(valorDatos));
      } catch (e) {
        return false;
      }

    default:
      return false;
  }
}

/**
 * Evalúa si un convenio aplica según todos sus criterios
 * @param {Object} convenio - Objeto convenio con criterios
 * @param {Object} datos - Datos de la atención
 * @returns {boolean}
 */
function evaluarConvenio(convenio, datos) {
  if (!convenio.criterios || convenio.criterios.length === 0) {
    return true; // Sin criterios = aplica a todo
  }

  // TODOS los criterios deben cumplirse (AND)
  return convenio.criterios.every(criterio => evaluarCriterio(criterio, datos));
}

/**
 * Deriva tipo_dia desde una fecha
 * @param {string|Date} fecha 
 * @returns {string}
 */
function derivarTipoDia(fecha) {
  const date = new Date(fecha);
  const dayOfWeek = date.getDay(); // 0 = domingo, 6 = sábado
  
  const dias = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
  return dias[dayOfWeek];
}

/**
 * Normaliza y enriquece los datos de entrada
 * @param {Object} datos 
 * @returns {Object}
 */
function normalizarDatos(datos) {
  const normalized = { ...datos };
  
  // Derivar tipo_dia si hay fecha_evento
  if (datos.fecha_evento && !datos.tipo_dia) {
    normalized.tipo_dia = derivarTipoDia(datos.fecha_evento);
  }

  // Normalizar campos comunes
  if (normalized.tipo_prestacion) {
    normalized.tipo_prestacion = String(normalized.tipo_prestacion).toLowerCase();
  }
  
  if (normalized.especialidad) {
    normalized.especialidad = String(normalized.especialidad).toLowerCase();
  }
  
  if (normalized.rol_paciente) {
    normalized.rol_paciente = String(normalized.rol_paciente).toLowerCase();
  }

  return normalized;
}

module.exports = {
  evaluarCriterio,
  evaluarConvenio,
  derivarTipoDia,
  normalizarDatos
};