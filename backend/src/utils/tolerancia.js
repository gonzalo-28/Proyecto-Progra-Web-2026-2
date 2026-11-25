// HU-5 · Regla de tolerancia de llegada (igual que frontend/src/utils/tolerance.js).
//   - La llegada se puede registrar desde 15 min antes del inicio hasta el fin del bloque.
//   - La inasistencia se puede marcar cuando pasan 15 min desde el inicio.
import { fechaHora, formatoHora } from './fechas.js'

export const TOLERANCIA_MIN = 15;        // minutos de espera antes de poder marcar inasistencia
export const LLEGADA_ANTICIPADA_MIN = 15; // desde cuántos minutos antes se acepta la llegada

/**
 * @param {{ fecha: string, horaInicio: string, horaFin: string }} bloque
 * @param {Date} ahora
 */
export function estadoTolerancia({ fecha, horaInicio, horaFin }, ahora) {
  const inicio = fechaHora(fecha, horaInicio);
  const fin = fechaHora(fecha, horaFin);
  const limite = new Date(inicio.getTime() + TOLERANCIA_MIN * 60000);
  const transcurridos = Math.floor((ahora.getTime() - inicio.getTime()) / 60000); // negativo = aún no empieza
  const termino = ahora.getTime() >= fin.getTime();

  return {
    termino,
    puedeRegistrarLlegada: transcurridos >= -LLEGADA_ANTICIPADA_MIN && !termino,
    puedeMarcarInasistencia: transcurridos >= TOLERANCIA_MIN,
    llegadaTardia: transcurridos >= TOLERANCIA_MIN,
    desdeLlegada: formatoHora(new Date(inicio.getTime() - LLEGADA_ANTICIPADA_MIN * 60000)), // '09:45'
    limiteTolerancia: formatoHora(limite)                                                     // '10:15'
  };
}
