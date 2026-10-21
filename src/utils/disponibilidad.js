// src/utils/disponibilidad.js
//
// Reglas de DISPONIBILIDAD de la HU-3 en un solo lugar. Funciones puras: no
// leen la base ni conocen React; el servicio les pasa los datos ya buscados.
// Así la misma regla sirve para el calendario, la búsqueda y los similares.

import { aFecha, claveDia } from './semana';

/** Estado de un bloque en el calendario (leyenda del mockup 3.4). */
export const ESTADOS_BLOQUE = {
  libre: 'libre',
  ocupado: 'ocupado',
  propia: 'propia', // "Mi reserva"
  noDisponible: 'no_disponible',
};

/** Por qué un bloque está "No disponible". */
export const MOTIVOS_NO_DISPONIBLE = {
  espacio: 'espacio', // el espacio está en mantenimiento o de baja
  cerrado: 'cerrado', // fuera del horario de atención de ese día
  bloqueo: 'bloqueo', // bloqueo por mantenimiento o evento (HU-5)
  pasado: 'pasado', // el bloque ya empezó o ya terminó
};

/**
 * Horario general del campus (mockup 2.5). Se usa mientras el espacio no tenga
 * su propio horarioAtencion (lo registra la HU-2). null = cerrado ese día.
 * Forma propuesta a la HU-2: { lun: { apertura: 'HH:MM', cierre: 'HH:MM' } | null, … }
 */
export const HORARIO_POR_DEFECTO = {
  dom: null,
  lun: { apertura: '07:00', cierre: '22:00' },
  mar: { apertura: '07:00', cierre: '22:00' },
  mie: { apertura: '07:00', cierre: '22:00' },
  jue: { apertura: '07:00', cierre: '22:00' },
  vie: { apertura: '07:00', cierre: '20:00' },
  sab: { apertura: '08:00', cierre: '14:00' },
};

/** Horario de un espacio en una fecha: { apertura, cierre } o null si cierra. */
export function horarioDelDia(espacio, fechaISO) {
  const horario = espacio.horarioAtencion ?? HORARIO_POR_DEFECTO;
  return horario[claveDia(fechaISO)] ?? null;
}

/** ¿El bloque cae completo dentro de la franja 'HH:MM'–'HH:MM'? (sin franja = sí) */
export function bloqueEnFranja(bloque, desde, hasta) {
  return (!desde || bloque.horaInicio >= desde) && (!hasta || bloque.horaFin <= hasta);
}

/** Texto comparable: sin tildes, en minúsculas y sin espacios sobrantes. */
export function normalizarTexto(texto) {
  return String(texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toLowerCase();
}

/**
 * La semilla guarda el equipamiento como textos ("Pizarra") y la HU-2, al
 * editarlo, como objetos ({ nombre, cantidad }). Aquí todo queda como objeto.
 */
export function normalizarEquipamiento(lista = []) {
  return lista
    .map((item) =>
      typeof item === 'string'
        ? { nombre: item.trim(), cantidad: 1 }
        : { nombre: String(item?.nombre ?? '').trim(), cantidad: Number(item?.cantidad ?? 1) }
    )
    .filter((item) => item.nombre);
}

/**
 * Estado de UN bloque de un espacio en una fecha. El orden de las reglas
 * importa: una reserva pasada se sigue viendo como ocupada o propia.
 *
 * @param {Object} p
 * @param {Object} p.espacio   espacio de la base
 * @param {string} p.fecha     'YYYY-MM-DD'
 * @param {Object} p.bloque    { id, horaInicio, horaFin }
 * @param {Object|null} p.reserva  reserva que ocupa ese bloque (si hay)
 * @param {Object|null} p.bloqueo  bloqueo que cubre ese bloque (si hay)
 * @param {string|null} p.usuarioId usuario que mira (null = visitante)
 * @param {Date} p.ahora
 * @returns {{ estado: string, motivo: string|null, detalle: string|null }}
 */
export function evaluarBloque({ espacio, fecha, bloque, reserva, bloqueo, usuarioId, ahora }) {
  const noDisponible = (motivo, detalle = null) => ({
    estado: ESTADOS_BLOQUE.noDisponible,
    motivo,
    detalle,
  });

  if (espacio.estado !== 'disponible') return noDisponible(MOTIVOS_NO_DISPONIBLE.espacio);

  const horario = horarioDelDia(espacio, fecha);
  if (!horario || bloque.horaInicio < horario.apertura || bloque.horaFin > horario.cierre) {
    return noDisponible(MOTIVOS_NO_DISPONIBLE.cerrado);
  }

  if (bloqueo) return noDisponible(MOTIVOS_NO_DISPONIBLE.bloqueo, bloqueo.motivo ?? null);

  if (reserva) {
    const esPropia = Boolean(usuarioId) && reserva.usuarioId === usuarioId;
    return {
      estado: esPropia ? ESTADOS_BLOQUE.propia : ESTADOS_BLOQUE.ocupado,
      motivo: null,
      detalle: esPropia ? reserva.codigo ?? null : null,
    };
  }

  // Misma regla que la HU-4 (BLOQUE_PASADO): no se reserva un bloque que ya empezó.
  if (aFecha(fecha, bloque.horaInicio) <= ahora) return noDisponible(MOTIVOS_NO_DISPONIBLE.pasado);

  return { estado: ESTADOS_BLOQUE.libre, motivo: null, detalle: null };
}