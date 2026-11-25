// src/utils/trayStatus.js
//
// HU-5 · Estado que se MUESTRA en la bandeja del día.
//
// Difiere del `estadoVisible` de la HU-4 (reservationService) a propósito:
// en los mockups de la bandeja (5.1) "En curso" es una reserva ATENDIDA cuyo
// bloque aún no termina (ya llegó: "Llegada 09:02"); una reserva confirmada
// dentro de su bloque sigue mostrándose "Confirmada" mientras se espera la
// llegada (Camila 10:00–11:00 a las 10:08). Los textos y colores salen de
// ESTADO_RESERVA_UI (reglas.js), así que la etiqueta se ve igual en todo el sistema.

import { ESTADOS_RESERVA } from './reglas';
import { toDateTime } from './tolerance';

/**
 * @param {{ estado: string, fecha: string, horaFin: string }} reserva
 * @param {Date} now
 * @returns {string} clave de ESTADO_RESERVA_UI: 'confirmada' | 'en_curso' | 'atendida' | 'inasistencia' | 'cancelada'
 */
export function getTrayStatus(reserva, now = new Date()) {
  if (reserva.estado === ESTADOS_RESERVA.atendida && reserva.horaFin) {
    if (now.getTime() < toDateTime(reserva.fecha, reserva.horaFin).getTime()) {
      return ESTADOS_RESERVA.enCurso;
    }
  }
  return reserva.estado;
}
