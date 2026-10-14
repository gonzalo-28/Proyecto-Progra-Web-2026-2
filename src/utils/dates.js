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
