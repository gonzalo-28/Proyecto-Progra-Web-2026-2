// src/services/storageService.js
import initialDb from '../data/db.js';

export const getStoredData = () => {
  const stored = localStorage.getItem('app_db');
  if (!stored) {
    localStorage.setItem('app_db', JSON.stringify(initialDb));
    return initialDb;
  }
  return JSON.parse(stored);
};