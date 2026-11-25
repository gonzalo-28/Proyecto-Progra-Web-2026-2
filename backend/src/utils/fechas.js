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

/** Date → '10:15' */
export const formatoHora = (fecha) => `${pad2(fecha.getHours())}:${pad2(fecha.getMinutes())}`;

/** '2026-11-25' → '25/11' */
export const formatoCorto = (iso) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;

/** Primer y último instante de un día local: para buscar lo que pasó "ese día". */
export const rangoDelDia = (iso) => [new Date(`${iso}T00:00:00`), new Date(`${iso}T23:59:59.999`)];

/**
 * Devuelve `ahora` con la hora cambiada a 'HH:mm' (mismo día). Si no llega una hora
 * válida, devuelve `ahora` sin tocar. SOLO PARA PROBAR: permite simular la hora
 * (como ?hora=10:08 en la bandeja del frontend) sin esperar al reloj.
 */
export const conHora = (ahora, hora) => {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(String(hora ?? ''))) return ahora;
  const [h, m] = hora.split(':').map(Number);
  const fecha = new Date(ahora);
  fecha.setHours(h, m, 0, 0);
  return fecha;
};
