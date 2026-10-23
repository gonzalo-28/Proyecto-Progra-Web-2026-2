// src/services/storageService.js
// ÚNICA puerta de acceso a la "base" local (localStorage, clave 'app_db').
// Todos los servicios leen y escriben por aquí; en la Entrega 2 se reemplaza
// por llamadas a la API sin tocar a los componentes.
import initialDb from '../data/db.js';

const DB_KEY = 'app_db';

const clonarSemilla = () => JSON.parse(JSON.stringify(initialDb));

export const getStoredData = () => {
  try {
    const stored = localStorage.getItem(DB_KEY);
    if (stored) {
      const db = JSON.parse(stored);
      const bloquesGuardados = db.bloquesHorarios ?? [];
      const idsGuardados = new Set(bloquesGuardados.map((bloque) => bloque.id));
      const bloquesNuevos = initialDb.bloquesHorarios.filter((bloque) => !idsGuardados.has(bloque.id));

      // Añade los nuevos bloques semilla sin borrar reservas ni datos locales existentes.
      if (bloquesNuevos.length) {
        db.bloquesHorarios = [...bloquesGuardados, ...bloquesNuevos];
        saveStoredData(db);
      }

      return db;
    }
  } catch (error) {
    console.error('Base local ilegible, se restaura la semilla:', error);
  }
  const semilla = clonarSemilla();
  saveStoredData(semilla);
  return semilla;
};

export const saveStoredData = (db) => {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
    return true;
  } catch (error) {
    console.error('No se pudo guardar en localStorage:', error);
    return false;
  }
};

export const MENSAJE_ERROR_GUARDADO =
  'No pudimos guardar los cambios: el navegador no tiene espacio o bloquea el almacenamiento. Inténtalo de nuevo.';

/**
 * Guarda la base y, si el navegador no puede persistirla, lanza un Error con
 * code 'ERROR_GUARDADO'. Es lo que deben usar los servicios en cada escritura
 * iniciada por el usuario, para que la interfaz nunca trate como exitoso un
 * cambio que no se guardó.
 */
export const guardarOFallar = (db, mensaje = MENSAJE_ERROR_GUARDADO) => {
  if (!saveStoredData(db)) {
    throw Object.assign(new Error(mensaje), { code: 'ERROR_GUARDADO' });
  }
};

/** Vuelve a los datos semilla (útil para pruebas). */
export const resetStoredData = () => saveStoredData(clonarSemilla());