// src/components/features/availability/calendarCells.js
//
// Traduce el estado de negocio de un bloque (availabilityService) a lo que
// pinta la grilla común WeekCalendar (tono + texto). Es el único lugar donde
// "propia" se convierte en "Mi reserva" o "cerrado" en "Cerrado".

import { ESTADOS_BLOQUE, MOTIVOS_NO_DISPONIBLE } from '../../../utils/disponibilidad';

/** Leyenda del mockup 3.4, en el mismo orden. */
export const LEYENDA_DISPONIBILIDAD = [
  { tone: 'free', label: 'Libre' },
  { tone: 'busy', label: 'Ocupado' },
  { tone: 'mine', label: 'Mi reserva' },
  { tone: 'unavailable', label: 'No disponible' },
];

const TONO = {
  [ESTADOS_BLOQUE.libre]: 'free',
  [ESTADOS_BLOQUE.ocupado]: 'busy',
  [ESTADOS_BLOQUE.propia]: 'mine',
  [ESTADOS_BLOQUE.noDisponible]: 'unavailable',
};

const TEXTO = {
  [ESTADOS_BLOQUE.libre]: 'Libre',
  [ESTADOS_BLOQUE.ocupado]: 'Ocupado',
  [ESTADOS_BLOQUE.propia]: 'Mi reserva',
};

const TEXTO_NO_DISPONIBLE = {
  [MOTIVOS_NO_DISPONIBLE.cerrado]: 'Cerrado',
  [MOTIVOS_NO_DISPONIBLE.bloqueo]: 'Bloqueado',
  [MOTIVOS_NO_DISPONIBLE.pasado]: 'No disponible',
  [MOTIVOS_NO_DISPONIBLE.espacio]: 'No disponible',
};

const EXPLICACION_NO_DISPONIBLE = {
  [MOTIVOS_NO_DISPONIBLE.cerrado]: 'fuera del horario de atención',
  [MOTIVOS_NO_DISPONIBLE.bloqueo]: 'bloqueado',
  [MOTIVOS_NO_DISPONIBLE.pasado]: 'el bloque ya pasó',
  [MOTIVOS_NO_DISPONIBLE.espacio]: 'el espacio no está habilitado',
};

/**
 * Celda del servicio → celda de WeekCalendar.
 * @param {Object} celda  { estado, motivo, detalle } de availabilityService
 * @param {Object} ctx    { dia: { etiqueta }, bloque: { etiqueta }, puedeElegir }
 */
export function aCeldaCalendario(celda, { dia, bloque, puedeElegir }) {
  const esNoDisponible = celda.estado === ESTADOS_BLOQUE.noDisponible;
  const label = esNoDisponible ? TEXTO_NO_DISPONIBLE[celda.motivo] ?? 'No disponible' : TEXTO[celda.estado];

  const extra = esNoDisponible
    ? [EXPLICACION_NO_DISPONIBLE[celda.motivo], celda.detalle].filter(Boolean).join(': ')
    : celda.detalle; // en "Mi reserva", el código de la reserva

  return {
    tone: TONO[celda.estado],
    label,
    title: `${dia.etiqueta}, ${bloque.etiqueta}: ${label}${extra ? ` (${extra})` : ''}`,
    selectable: puedeElegir && celda.estado === ESTADOS_BLOQUE.libre,
  };
}
