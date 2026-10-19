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

const pad2 = (value) => String(value).padStart(2, '0');

/**
 * Rango de la semana de reservas (lunes a sábado) de la fecha dada, como
 * 'DD/MM – DD/MM' (ej. '14/09 – 19/09'). El domingo cuenta como parte de la
 * semana que acaba de terminar.
 */
export function getWeekRangeLabel(date = new Date()) {
  const diffToMonday = (date.getDay() + 6) % 7;
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate() - diffToMonday);
  const saturday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 5);
  const format = (d) => `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}`;
  return `${format(monday)} – ${format(saturday)}`;
}

/* ---------------------------------------------------------------------------
   HU-5 · Operación diaria. Todas trabajan con fechas ISO locales 'YYYY-MM-DD'
   (las mismas que produce toISODate) para no mezclar zonas horarias.
   ------------------------------------------------------------------------- */

const WEEKDAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** 'YYYY-MM-DD' → Date local a las 00:00 (sin el desfase de new Date('YYYY-MM-DD'), que es UTC). */
export function parseISODate(iso) {
  const [year, month, day] = String(iso).split('-').map(Number);
  return new Date(year, month - 1, day);
}

/** true si el texto es una fecha 'YYYY-MM-DD' que existe (rechaza '2026-02-31'). */
export function isISODate(value) {
  if (!ISO_DATE_RE.test(String(value ?? ''))) return false;
  return toISODate(parseISODate(value)) === value;
}

/** Suma (o resta, con n negativo) días a una fecha ISO. */
export function addDays(iso, days) {
  const date = parseISODate(iso);
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

/** 'lunes', 'martes'… */
export function getWeekdayName(iso) {
  return WEEKDAYS[parseISODate(iso).getDay()];
}

/** true si la fecha cae domingo. */
export function isSunday(iso) {
  return parseISODate(iso).getDay() === 0;
}

/** '2026-09-14' → '14/09' */
export function formatShortDate(iso) {
  const date = parseISODate(iso);
  return `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}`;
}

/** '2026-09-14' → '14/09/2026' */
export function formatDate(iso) {
  return `${formatShortDate(iso)}/${parseISODate(iso).getFullYear()}`;
}

/** '2026-09-14' → 'Lunes 14/09/2026' (como el subtítulo de la bandeja) */
export function formatDayLabel(iso) {
  const weekday = getWeekdayName(iso);
  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)} ${formatDate(iso)}`;
}

/** Días entre dos fechas ISO, ambos incluidos: ('2026-09-16', '2026-09-18') → 3. */
export function countDays(desde, hasta) {
  const ms = parseISODate(hasta).getTime() - parseISODate(desde).getTime();
  return Math.round(ms / 86400000) + 1;
}

/** Lista de fechas ISO de `desde` a `hasta`, ambos incluidos. */
export function listDays(desde, hasta) {
  const total = countDays(desde, hasta);
  return Array.from({ length: Math.max(total, 0) }, (_, i) => addDays(desde, i));
}
