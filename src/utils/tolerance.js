// src/utils/tolerance.js
//
// HU-5 · Regla de tolerancia de llegada (mockup 5.3 y franja de reglas de la
// landing: "Pasada la tolerancia, el encargado puede marcar la inasistencia").
// Funciones PURAS: reciben la hora actual como parámetro, así se prueban sin
// esperar el reloj y no dependen de cómo se guarde la reserva.

import { parseISODate } from './dates';
import { TOLERANCIA_LLEGADA_MIN } from './reglas';

/** Minutos de espera desde el inicio del bloque antes de poder marcar inasistencia.
    El valor vive en reglas.js (HU-4) para que todo el sistema use el mismo. */
export const TOLERANCE_MINUTES = TOLERANCIA_LLEGADA_MIN;

/** Desde cuántos minutos antes del inicio se acepta registrar la llegada. */
export const EARLY_ARRIVAL_MINUTES = 15;

const MS_PER_MINUTE = 60 * 1000;
const pad2 = (value) => String(value).padStart(2, '0');

/** ('2026-09-14', '10:00') → Date local 14/09/2026 10:00 */
export function toDateTime(isoDate, time) {
  const [hours, minutes] = String(time).split(':').map(Number);
  const date = parseISODate(isoDate);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

/** Date → '10:15' */
export function formatTime(date) {
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

/**
 * Estado de la tolerancia de una reserva en un momento dado.
 *
 * @param {{ fecha: string, horaInicio: string, horaFin?: string }} bloque
 *        fecha 'YYYY-MM-DD', horas 'HH:MM'
 * @param {Date} now  hora actual (se inyecta para poder probarla)
 * @returns {{
 *   phase: 'upcoming' | 'grace' | 'expired',
 *   minutesToStart: number,   // > 0 solo en 'upcoming'
 *   minutesLeft: number,      // > 0 solo en 'grace'  → "Faltan 7 min"
 *   minutesLate: number,      // ≥ TOLERANCE_MINUTES solo en 'expired' → "+16 min"
 *   startLabel: string,       // "10:00" (inicio del bloque)
 *   deadlineLabel: string,    // "10:15" → "Podrás marcar la inasistencia a las 10:15."
 *   canRegisterArrival: boolean,
 *   canMarkAbsence: boolean,
 *   isLateArrival: boolean,   // true → el botón dice "Registrar llegada tardía"
 *   hasEnded: boolean,        // ya pasó la hora de fin del bloque
 * }}
 */
export function getToleranceStatus({ fecha, horaInicio, horaFin }, now = new Date()) {
  const start = toDateTime(fecha, horaInicio);
  const deadline = new Date(start.getTime() + TOLERANCE_MINUTES * MS_PER_MINUTE);
  const end = horaFin ? toDateTime(fecha, horaFin) : null;

  // Minutos completos transcurridos desde el inicio (negativo = aún no empieza).
  const elapsed = Math.floor((now.getTime() - start.getTime()) / MS_PER_MINUTE);

  let phase = 'grace';
  if (elapsed < 0) phase = 'upcoming';
  else if (elapsed >= TOLERANCE_MINUTES) phase = 'expired';

  const hasEnded = end ? now.getTime() >= end.getTime() : false;

  return {
    phase,
    minutesToStart: phase === 'upcoming' ? -elapsed : 0,
    minutesLeft: phase === 'grace' ? TOLERANCE_MINUTES - elapsed : 0,
    minutesLate: phase === 'expired' ? elapsed : 0,
    startLabel: formatTime(start),
    deadlineLabel: formatTime(deadline),
    canRegisterArrival: elapsed >= -EARLY_ARRIVAL_MINUTES && !hasEnded,
    canMarkAbsence: phase === 'expired',
    isLateArrival: phase === 'expired',
    hasEnded,
  };
}

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

/**
 * Devuelve `now` con la hora cambiada a 'HH:MM' (mismo día). Si `time` no es
 * una hora válida, devuelve `now` sin tocar. Sirve para simular la hora en
 * desarrollo (?hora=10:08) y probar la tolerancia sin esperar al reloj.
 */
export function withTimeOfDay(now, time) {
  if (!TIME_RE.test(String(time ?? ''))) return now;
  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date(now);
  date.setHours(hours, minutes, 0, 0);
  return date;
}
