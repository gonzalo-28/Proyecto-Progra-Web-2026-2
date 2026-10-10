/**
 * Fecha LOCAL en formato 'YYYY-MM-DD' (lo que espera <input type="date">).
 * No usa toISOString(): ese devuelve UTC y en Lima, de noche, ya marcaría "mañana".
 */
export function toISODate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
