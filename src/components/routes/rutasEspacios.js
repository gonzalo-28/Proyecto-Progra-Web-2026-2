// src/components/routes/rutasEspacios.js
//
// Rutas de la HU-3 (búsqueda y disponibilidad) en un solo lugar. Las usan el
// AppRouter, las páginas y los enlaces de otras HU (la landing ya apunta a
// /espacios y a /espacios/:id). Los filtros viajan en la URL, así un enlace
// se puede compartir o volver atrás sin perder nada.

export const RUTAS_ESPACIOS = {
  busqueda: '/espacios',
  disponibilidad: '/espacios/:espacioId',
  ficha: '/espacios/:spaceId/ficha',
};

/** Arma '?a=1&b=2' omitiendo valores vacíos; los arreglos se repiten (?tipo=a&tipo=b). */
function armarQuery(params) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([clave, valor]) => {
    const valores = Array.isArray(valor) ? valor : [valor];
    valores
      .filter((v) => v !== undefined && v !== null && v !== '')
      .forEach((v) => query.append(clave, String(v)));
  });
  const texto = query.toString();
  return texto ? `?${texto}` : '';
}

/** /espacios/esp_001?semana=2026-09-14&desde=08:00&hasta=10:00 */
export const rutaDisponibilidad = (espacioId, { semana, desde, hasta } = {}) =>
  `/espacios/${encodeURIComponent(espacioId)}${armarQuery({ semana, desde, hasta })}`;

/** /espacios/esp_001/ficha */
export const rutaFichaPublica = (spaceId) =>
  `/espacios/${encodeURIComponent(spaceId)}/ficha`;

/** /espacios?tipo=sala&dia=2026-09-14 (mismos nombres que ya usa la landing) */
export const rutaBusqueda = (filtros = {}) => `${RUTAS_ESPACIOS.busqueda}${armarQuery(filtros)}`;
