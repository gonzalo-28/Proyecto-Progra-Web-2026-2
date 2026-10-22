// src/components/routes/rutasEspacios.js
//
// Rutas bajo /espacios en un solo lugar: buscador y calendario (HU-3) y la
// ficha pública (HU-2). Las usan el AppRouter, las páginas y los enlaces de
// otras HU (la landing, el navbar y Mis reservas apuntan a /espacios).
// Los filtros viajan en la URL, así un enlace se puede compartir o volver
// atrás sin perder nada.

export const RUTAS_ESPACIOS = {
  busqueda: '/espacios', // HU-3 · buscador (3.1–3.3)
  disponibilidad: '/espacios/:espacioId', // HU-3 · ficha resumida + calendario (3.4–3.6)
  ficha: '/espacios/:spaceId/ficha', // HU-2 · ficha pública (2.6); PublicSpaceDetailPage lee :spaceId
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

/** /espacios?tipo=sala&dia=2026-09-14 (mismos nombres que ya usa la landing) */
export const rutaBusqueda = (filtros = {}) => `${RUTAS_ESPACIOS.busqueda}${armarQuery(filtros)}`;

/** /espacios/esp_001/ficha → ficha pública de la HU-2 ("Ver ficha completa →") */
export const rutaFicha = (espacioId) => `/espacios/${encodeURIComponent(espacioId)}/ficha`;
