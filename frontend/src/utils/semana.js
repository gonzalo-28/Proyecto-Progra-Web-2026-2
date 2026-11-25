// src/utils/semana.js
//
// Utilidades de la SEMANA DE RESERVAS (lunes a sábado) para el calendario de
// la HU-3. Funciones puras: reciben y devuelven fechas 'YYYY-MM-DD' en hora
// LOCAL (nunca toISOString, que en Lima de noche ya marcaría "mañana").
//
// Regla compartida con la HU-4 (reservationService.rangoSemana): el domingo
// pertenece a la semana que acaba de terminar.

import { toISODate } from './dates';

const pad2 = (n) => String(n).padStart(2, '0');

const DIAS_CORTOS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const DIAS_LARGOS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

/** Claves de día que usa horarioAtencion (índice = Date.getDay()). */
export const CLAVES_DIA = ['dom', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab'];

/** La semana de reservas tiene 6 días: lunes a sábado. */
export const DIAS_POR_SEMANA = 6;

/** 'YYYY-MM-DD' (+ 'HH:MM') → Date en hora local. */
export function aFecha(fechaISO, hora = '00:00') {
  const [y, m, d] = fechaISO.split('-').map(Number);
  const [hh, mm] = hora.split(':').map(Number);
  return new Date(y, m - 1, d, hh, mm);
}

/** Suma (o resta) días a una fecha 'YYYY-MM-DD'. */
export function sumarDias(fechaISO, dias) {
  const base = aFecha(fechaISO);
  return toISODate(new Date(base.getFullYear(), base.getMonth(), base.getDate() + dias));
}

/** Lunes de la semana de reservas a la que pertenece la fecha. */
export function lunesDe(fechaISO = toISODate()) {
  const diasDesdeLunes = (aFecha(fechaISO).getDay() + 6) % 7;
  return sumarDias(fechaISO, -diasDesdeLunes);
}

/** Las 6 fechas (lunes a sábado) de la semana de la fecha dada. */
export function diasDeLaSemana(fechaISO = toISODate()) {
  const lunes = lunesDe(fechaISO);
  return Array.from({ length: DIAS_POR_SEMANA }, (_, i) => sumarDias(lunes, i));
}

/** Clave del día para horarioAtencion: '2026-09-14' → 'lun'. */
export const claveDia = (fechaISO) => CLAVES_DIA[aFecha(fechaISO).getDay()];

/** '2026-09-14' → 'Lun 14/09' (encabezado de columna del calendario). */
export function etiquetaDia(fechaISO) {
  const fecha = aFecha(fechaISO);
  return `${DIAS_CORTOS[fecha.getDay()]} ${pad2(fecha.getDate())}/${pad2(fecha.getMonth() + 1)}`;
}

/** '2026-09-14' → '14/09/2026' */
export function formatearFecha(fechaISO) {
  const [y, m, d] = fechaISO.split('-');
  return `${d}/${m}/${y}`;
}

/** '2026-09-14' → 'lunes 14/09/2026' (textos como "4 resultados para el lunes…"). */
export function fechaConDiaLargo(fechaISO) {
  return `${DIAS_LARGOS[aFecha(fechaISO).getDay()]} ${formatearFecha(fechaISO)}`;
}