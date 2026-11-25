// Utilidades de fechas (las mismas reglas que frontend/src/utils/dates.js).
// Las fechas sueltas se manejan como texto 'YYYY-MM-DD' (así las devuelve DATEONLY)
// y las horas como 'HH:mm'.

const pad2 = (n) => String(n).padStart(2, '0');

/** Date → 'YYYY-MM-DD' en hora local. */
export const aISO = (fecha) => `${fecha.getFullYear()}-${pad2(fecha.getMonth() + 1)}-${pad2(fecha.getDate())}`;

/** 'YYYY-MM-DD' de hoy. */
export const hoyISO = (ahora = new Date()) => aISO(ahora);

/** ¿Es un texto 'YYYY-MM-DD' con una fecha real? ('2026-02-30' → false) */
export const esFechaISO = (valor) =>
  typeof valor === 'string' &&
  /^\d{4}-\d{2}-\d{2}$/.test(valor) &&
  aISO(new Date(`${valor}T00:00:00`)) === valor;

/** Días de `desde` a `hasta`, ambos incluidos ('2026-11-25', '2026-11-27' → 3). */
export const contarDias = (desde, hasta) =>
  Math.round((new Date(`${hasta}T00:00:00`) - new Date(`${desde}T00:00:00`)) / 86400000) + 1;

/** ('2026-11-25', '10:00') → Date local de ese momento. */
export const fechaHora = (fecha, hora) => new Date(`${fecha}T${hora}:00`);
