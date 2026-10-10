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
    if (stored) return JSON.parse(stored);
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
  } catch (error) {
    console.error('No se pudo guardar en localStorage:', error);
  }
};

/** Vuelve a los datos semilla (útil para pruebas). */
export const resetStoredData = () => saveStoredData(clonarSemilla());