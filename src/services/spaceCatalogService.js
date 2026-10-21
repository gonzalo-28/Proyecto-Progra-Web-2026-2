// src/services/spaceCatalogService.js
// Datos del catálogo del encargado. La capa queda preparada para sustituir
// localStorage por la API en la siguiente entrega.

import initialDb from '../data/db.js';
import { getStoredData, saveStoredData } from './storageService.js';

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
  return getSpacesWithSeed().map((space) => ({
    ...space,
    codigo: space.codigo ?? space.id,
    pabellon: space.pabellon ?? space.ubicacion ?? 'Sin ubicación',
    tipoLabel: TYPE_LABELS[space.tipo] ?? space.tipo,
    estadoLabel: STATE_LABELS[space.estado] ?? space.estado,
    reservasVigentes: Number(space.reservasVigentes ?? 0),
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
  saveStoredData(db);
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
  const db = getStoredData();
  let spaces = db.espacios ?? [];
  const existing = spaces.find((space) => String(space.id) === String(spaceId));

  if (existing) {
    spaces = spaces.map((space) => (
      String(space.id) === String(spaceId) ? { ...space, horarioAtencion } : space
    ));
  } else {
    const seed = initialDb.espacios.find((space) => String(space.id) === String(spaceId));
    if (!seed) throw new Error('No se encontró el espacio que intentas actualizar.');
    spaces = [...spaces, { ...seed, horarioAtencion }];
  }

  db.espacios = spaces;
  if (!saveStoredData(db)) throw new Error('El navegador no pudo guardar los cambios.');
  return spaces.find((space) => String(space.id) === String(spaceId));
}

export function updateCatalogSpaceStatus(spaceId, estado, motivoEstado) {
  const db = getStoredData();
  let spaces = db.espacios ?? [];
  const existing = spaces.find((space) => String(space.id) === String(spaceId));

  if (existing) {
    spaces = spaces.map((space) => (
      String(space.id) === String(spaceId) ? { ...space, estado, motivoEstado } : space
    ));
  } else {
    const seed = initialDb.espacios.find((space) => String(space.id) === String(spaceId));
    if (!seed) throw new Error('No se encontró el espacio que intentas actualizar.');
    spaces = [...spaces, { ...seed, estado, motivoEstado }];
  }

  db.espacios = spaces;
  if (!saveStoredData(db)) throw new Error('El navegador no pudo guardar los cambios.');
  return spaces.find((space) => String(space.id) === String(spaceId));
}
