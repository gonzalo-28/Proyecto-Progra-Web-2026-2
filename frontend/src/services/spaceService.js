// src/services/spaceService.js

import { getStoredData } from './storageService';

/**
 * spaceService.js
 * Traduce la base guardada (storageService -> localStorage 'app_db') a la forma
 * que esperan los componentes de espacios. Cada función lee la base en el
 * momento de llamarla, así que siempre ve las reservas más recientes.
 * Si mañana los datos vienen de otro lado (API), se cambia SOLO este archivo.
 */

/* La base solo guarda ids ("sede_central", "laboratorio"). Aquí viven las
   etiquetas visibles; un id sin etiqueta se muestra "humanizado". */
const SEDE_LABELS = {
  sede_central: 'Campus Monterrico',
};

const TYPE_LABELS = {
  sala: 'Sala de estudio grupal',
  laboratorio: 'Laboratorio de cómputo',
  cabina: 'Cabina de grabación',
  auditorio: 'Auditorio',
};

const AVAILABLE_STATE = 'disponible';

/** "sede_central" -> "Central" (solo como último recurso). */
function humanize(id) {
  const text = String(id).replace(/^sede_/, '').replace(/_/g, ' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function uniqueOptions(values, labels) {
  return [...new Set(values)].map((value) => ({
    value,
    label: labels[value] ?? humanize(value),
  }));
}

/** Opciones del selector "Sede": las sedes que tienen espacios. */
export function getSedeOptions() {
  const { espacios = [] } = getStoredData();
  return uniqueOptions(
    espacios.map((space) => space.sedeId),
    SEDE_LABELS
  );
}

/** Opciones del selector "Tipo de espacio": los tipos que existen en la base. */
export function getSpaceTypeOptions() {
  const { espacios = [] } = getStoredData();
  return uniqueOptions(
    espacios.map((space) => space.tipo),
    TYPE_LABELS
  );
}

/**
 * Bloques libres de un espacio en una fecha = total de bloques del día
 * menos los bloques ya reservados.
 * SUPUESTO: una reserva tiene { espacioId, bloqueId, fecha: 'YYYY-MM-DD', estado }
 * y las canceladas no ocupan bloque. Ajustar cuando exista el esquema real.
 */
function countFreeBlocks(db, spaceId, dateISO) {
  const { bloquesHorarios = [], reservas = [] } = db;
  const taken = new Set(
    reservas
      .filter(
        (reservation) =>
          reservation.espacioId === spaceId &&
          reservation.fecha === dateISO &&
          reservation.estado !== 'cancelada'
      )
      .map((reservation) => reservation.bloqueId)
  );
  return Math.max(bloquesHorarios.length - taken.size, 0);
}

/**
 * Espacios destacados del día, en la forma de SpaceCard:
 * { id, name, location, capacity, freeBlocks }
 * Solo entran los espacios con estado "disponible".
 */
export function getFeaturedSpaces(dateISO, limit = 4) {
  const db = getStoredData();
  const { espacios = [] } = db;

  return espacios
    .filter((space) => space.estado === AVAILABLE_STATE)
    .slice(0, limit)
    .map((space) => ({
      id: space.id,
      name: space.nombre,
      location: space.ubicacion,
      capacity: space.capacidad,
      freeBlocks: countFreeBlocks(db, space.id, dateISO),
    }));
}