// src/services/spaceCatalogService.js
// Datos del catálogo del encargado. La capa queda preparada para sustituir
// localStorage por la API en la siguiente entrega.

import initialDb from '../data/db.js';
import { getStoredData, saveStoredData } from './storageService.js';
import { ESTADOS_RESERVA } from '../utils/reglas.js';
import { isISODate, toISODate } from '../utils/dates.js';

const TYPE_LABELS = {
  sala: 'Sala de estudio grupal',
  laboratorio: 'Laboratorio de cómputo',
  cabina: 'Cabina de grabación',
  auditorio: 'Auditorio',
  sala_reuniones: 'Sala de reuniones',
};

const STATE_LABELS = {
  disponible: 'Disponible',
  mantenimiento: 'Mantenimiento',
  baja: 'De baja',
};

const CATALOG_ORDER = ['E-201', 'E-202', 'H-304', 'H-305', 'H-201', 'N-105', 'Q-101', 'A-410', 'A-411', 'B-102'];

function getSpacesWithSeed() {
  const storedSpaces = getStoredData().espacios ?? [];
  const storedById = new Map(storedSpaces.map((space) => [space.id, space]));
  const seedIds = new Set(initialDb.espacios.map((space) => space.id));
  const seededSpaces = initialDb.espacios.map((space) => ({
    ...space,
    ...storedById.get(space.id),
  }));
  const additionalSpaces = storedSpaces.filter((space) => !seedIds.has(space.id));

  return [...seededSpaces, ...additionalSpaces];
}

export function getSpaceCatalogOptions() {
  const spaces = getSpacesWithSeed();
  const types = [...new Set(spaces.map((space) => space.tipo))];
  const pavilions = [...new Set(spaces.map((space) => space.pabellon).filter(Boolean))];

  return {
    types: types.map((value) => ({ value, label: TYPE_LABELS[value] ?? value })),
    pavilions: pavilions.map((value) => ({ value, label: value })),
  };
}

export function getCatalogSpaces() {
  const db = getStoredData();
  return getSpacesWithSeed().map((space) => ({
    ...space,
    codigo: space.codigo ?? space.id,
    pabellon: space.pabellon ?? space.ubicacion ?? 'Sin ubicación',
    tipoLabel: TYPE_LABELS[space.tipo] ?? space.tipo,
    estadoLabel: STATE_LABELS[space.estado] ?? space.estado,
    reservasVigentes: contarReservasVigentes(db, space.id),
  })).sort((left, right) => {
    const leftIndex = CATALOG_ORDER.indexOf(left.codigo);
    const rightIndex = CATALOG_ORDER.indexOf(right.codigo);
    return (leftIndex === -1 ? CATALOG_ORDER.length : leftIndex) - (rightIndex === -1 ? CATALOG_ORDER.length : rightIndex);
  });
}

export function createCatalogSpace(space) {
  const db = getStoredData();
  const newSpace = {
    id: `esp_${Date.now()}`,
    ...space,
    reservasVigentes: 0,
    estado: 'disponible',
  };
  db.espacios = [...(db.espacios ?? []), newSpace];
  if (!saveStoredData(db)) throw new Error('El navegador no pudo guardar el espacio.');
  return newSpace;
}

export function updateCatalogSpace(spaceId, changes) {
  const db = getStoredData();
  const spaces = db.espacios ?? [];
  const existing = spaces.find((space) => String(space.id) === String(spaceId));
  let updatedSpaces;

  if (existing) {
    updatedSpaces = spaces.map((space) => (
      String(space.id) === String(spaceId) ? { ...space, ...changes } : space
    ));
  } else {
    const seed = getSpacesWithSeed().find((space) => String(space.id) === String(spaceId));
    if (!seed) throw new Error('No se encontró el espacio que intentas actualizar.');
    updatedSpaces = [...spaces, { ...seed, ...changes }];
  }

  db.espacios = updatedSpaces;
  if (!saveStoredData(db)) throw new Error('El navegador no pudo guardar los cambios.');
  return updatedSpaces.find((space) => String(space.id) === String(spaceId));
}

export function saveCatalogSpaceEquipment(spaceId, equipamiento) {
  const db = getStoredData();
  const spaceExists = (db.espacios ?? []).some((space) => space.id === spaceId);
  if (!spaceExists) throw new Error('No se encontró el espacio que intentas actualizar.');

  db.espacios = (db.espacios ?? []).map((space) => (
    space.id === spaceId ? { ...space, equipamiento } : space
  ));
  if (!saveStoredData(db)) throw new Error('El navegador no pudo guardar los cambios.');
  return db.espacios.find((space) => space.id === spaceId);
}

export function saveCatalogSpaceSchedule(spaceId, horarioAtencion) {
  const horarioFijo = { ...horarioAtencion, duracion: 60 };
  const db = getStoredData();
  let spaces = db.espacios ?? [];
  const existing = spaces.find((space) => String(space.id) === String(spaceId));

  if (existing) {
    spaces = spaces.map((space) => (
      String(space.id) === String(spaceId) ? { ...space, horarioAtencion: horarioFijo } : space
    ));
  } else {
    const seed = initialDb.espacios.find((space) => String(space.id) === String(spaceId));
    if (!seed) throw new Error('No se encontró el espacio que intentas actualizar.');
    spaces = [...spaces, { ...seed, horarioAtencion: horarioFijo }];
  }

  db.espacios = spaces;
  if (!saveStoredData(db)) throw new Error('El navegador no pudo guardar los cambios.');
  return spaces.find((space) => String(space.id) === String(spaceId));
}

export function updateCatalogSpaceStatus(spaceId, estado, motivoEstado, { fechaRestablecimiento = '', encargadoId = null, ahora = new Date() } = {}) {
  const db = getStoredData();
  let spaces = db.espacios ?? [];
  const existing = spaces.find((space) => String(space.id) === String(spaceId));

  if (!existing && !initialDb.espacios.some((space) => String(space.id) === String(spaceId))) {
    throw new Error('No se encontró el espacio que intentas actualizar.');
  }
  if (!['disponible', 'mantenimiento', 'baja'].includes(estado)) {
    throw new Error('El estado seleccionado no es válido.');
  }

  const motivo = String(motivoEstado ?? '').trim();
  if (estado !== 'disponible' && motivo.length < 5) {
    throw new Error('Describe el motivo del cambio de estado con al menos 5 caracteres.');
  }

  const hoy = toISODate(ahora);
  if (estado === 'mantenimiento') {
    if (!isISODate(fechaRestablecimiento) || fechaRestablecimiento <= hoy) {
      throw new Error('Indica una fecha de restablecimiento posterior a hoy.');
    }
  }

  const encargado = (db.usuarios ?? []).find((user) => String(user.id) === String(encargadoId));
  const canceladas = new Set();
  if (estado === 'mantenimiento' || estado === 'baja') {
    const bloques = new Map((db.bloquesHorarios ?? []).map((bloque) => [String(bloque.id), bloque]));
    const fechaMarca = ahora.toISOString();
    const motivoVisible = estado === 'mantenimiento'
      ? `Mantenimiento: ${motivo}. Restablecimiento estimado: ${fechaRestablecimiento}.`
      : `Espacio dado de baja: ${motivo}.`;

    db.reservas = (db.reservas ?? []).map((reserva) => {
      if (String(reserva.espacioId) !== String(spaceId) || reserva.estado !== ESTADOS_RESERVA.confirmada) return reserva;
      const bloque = bloques.get(String(reserva.bloqueId));
      if (!bloque || new Date(`${reserva.fecha}T${bloque.horaFin}:00`).getTime() <= ahora.getTime()) return reserva;
      // La fecha de restablecimiento es el primer día que podría volver a operar.
      if (estado === 'mantenimiento' && reserva.fecha >= fechaRestablecimiento) return reserva;

      canceladas.add(String(reserva.id));
      return {
        ...reserva,
        estado: ESTADOS_RESERVA.cancelada,
        cancelacion: {
          fecha: fechaMarca,
          porUsuarioId: encargado?.id ?? encargadoId,
          porRol: 'encargado',
          motivo: motivoVisible,
          motivoCodigo: estado === 'mantenimiento' ? 'mantenimiento_espacio' : 'baja_espacio',
          detalle: motivo,
          tardia: false,
        },
        historial: [...(reserva.historial ?? []), {
          tipo: 'cancelada',
          fecha: fechaMarca,
          actor: encargado ? [encargado.nombres, encargado.apellidos].filter(Boolean).join(' ') : 'Encargado',
        }],
      };
    });
  }

  if (existing) {
    spaces = spaces.map((space) => (
      String(space.id) === String(spaceId)
        ? {
            ...space,
            estado,
            motivoEstado: estado === 'disponible' ? '' : motivo,
            fechaRestablecimiento: estado === 'mantenimiento' ? fechaRestablecimiento : null,
            fechaBaja: estado === 'baja' ? ahora.toISOString() : null,
          }
        : space
    ));
  } else {
    const seed = initialDb.espacios.find((space) => String(space.id) === String(spaceId));
    spaces = [...spaces, {
      ...seed,
      estado,
      motivoEstado: estado === 'disponible' ? '' : motivo,
      fechaRestablecimiento: estado === 'mantenimiento' ? fechaRestablecimiento : null,
      fechaBaja: estado === 'baja' ? ahora.toISOString() : null,
    }];
  }

  db.espacios = spaces;
  if (!saveStoredData(db)) throw new Error('El navegador no pudo guardar los cambios.');
  return { ...spaces.find((space) => String(space.id) === String(spaceId)), reservasCanceladas: canceladas.size };
}

function contarReservasVigentes(db, spaceId, ahora = new Date(), antesDe = null) {
  const bloques = new Map((db.bloquesHorarios ?? []).map((bloque) => [String(bloque.id), bloque]));
  return (db.reservas ?? []).filter((reserva) => {
    if (String(reserva.espacioId) !== String(spaceId)) return false;
    if (reserva.estado !== ESTADOS_RESERVA.confirmada) return false;
    const bloque = bloques.get(String(reserva.bloqueId));
    if (!bloque) return false;
    if (antesDe && reserva.fecha >= antesDe) return false;
    return new Date(`${reserva.fecha}T${bloque.horaFin}:00`).getTime() > ahora.getTime();
  }).length;
}

export function getActiveSpaceReservationCount(spaceId, antesDe = null) {
  return contarReservasVigentes(getStoredData(), spaceId, new Date(), antesDe);
}

/** Baja lógica: cancela reservas futuras, conserva el espacio y su historial. */
export function retireCatalogSpace(spaceId, reason, encargadoId = null) {
  const cleanReason = String(reason ?? '').trim();
  if (cleanReason.length < 5) throw new Error('Describe el motivo de la baja con al menos 5 caracteres.');
  return updateCatalogSpaceStatus(spaceId, 'baja', cleanReason, { encargadoId });
}
