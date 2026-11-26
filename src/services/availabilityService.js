// src/services/availabilityService.js
//
// Servicio de DISPONIBILIDAD Y BÚSQUEDA (HU-3). Ahora pide los datos al API
// (/disponibilidad) con api.js, en lugar de calcularlos con localStorage.
// Las funciones y las respuestas son las MISMAS que en la primera entrega, así
// los Providers (SpaceSearchProvider, AvailabilityProvider) y los componentes
// no cambian. El cálculo (qué bloque está libre, ocupado o bloqueado) lo hace
// el servidor: ver services/disponibilidad.service.js en el repositorio del API.
//
// Si algo falla, api.js lanza un Error con el `message` del backend
// (y `code`: 'VALIDACION', 'NO_ENCONTRADO' o 'SIN_CONEXION').
import api from './api';

/** Criterios de orden de la búsqueda (selector "Ordenar" del mockup 3.1). */
export const ORDENES_BUSQUEDA = [
  { value: 'proximidad', label: 'Proximidad' },
  { value: 'aforo', label: 'Aforo' },
  { value: 'sede', label: 'Sede' },
];

/**
 * { tipo: ['sala', 'cabina'], aforo: 6, desde: '' } → '?tipo=sala&tipo=cabina&aforo=6'
 * Los arreglos se repiten (así los lee Express) y los valores vacíos se omiten.
 */
function aQuery(params) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([clave, valor]) => {
    (Array.isArray(valor) ? valor : [valor])
      .filter((v) => v !== undefined && v !== null && v !== '')
      .forEach((v) => query.append(clave, String(v)));
  });
  const texto = query.toString();
  return texto ? `?${texto}` : '';
}

/**
 * El API identifica la sede por su id numérico (1). La portada todavía manda el código
 * de la primera entrega ('sede_central'): mientras haya una sola sede, eso equivale a
 * no filtrar por sede.
 */
const aSedeId = (sede) => (/^\d+$/.test(String(sede ?? '')) ? sede : undefined);

const rutaEspacio = (espacioId) => `/disponibilidad/espacios/${encodeURIComponent(espacioId)}`;

/**
 * Opciones del panel de filtros: sedes, tipos y equipamiento que existen en el catálogo.
 * @returns {Promise<{ sedes, tipos, equipamiento, ordenes }>}
 */
export async function obtenerOpcionesDeBusqueda() {
  return await api.get('/disponibilidad/opciones');
}

/**
 * Espacios con al menos un bloque libre en el día y la franja pedidos (mockups 3.1 y 3.2).
 * @param {{ sede?, tipos?, aforoMin?, equipamiento?, fecha?, desde?, hasta?, orden? }} filtros
 * @param {{ usuarioId?: number }} [opciones]
 * @returns {Promise<{ resultados: Object[], total: number, fecha: string }>}
 */
export async function buscarEspacios(filtros = {}, { usuarioId = null } = {}) {
  return await api.get(
    '/disponibilidad/espacios' +
      aQuery({
        sedeId: aSedeId(filtros.sede),
        tipo: filtros.tipos,
        aforo: filtros.aforoMin || undefined,
        equipo: filtros.equipamiento,
        dia: filtros.fecha,
        desde: filtros.desde,
        hasta: filtros.hasta,
        orden: filtros.orden,
        usuarioId,
      })
  );
}

/**
 * Calendario semanal de un espacio (mockups 3.4, 3.5 y 3.6).
 * Con usuarioId, los bloques del estudiante salen como "Mi reserva".
 */
export async function obtenerDisponibilidadSemanal({ espacioId, fecha, desde, hasta, usuarioId = null } = {}) {
  return await api.get(`${rutaEspacio(espacioId)}/semana` + aQuery({ semana: fecha, desde, hasta, usuarioId }));
}

/** Espacios parecidos con bloques libres en la misma semana y franja (mockups 3.5 y 3.6). */
export async function obtenerEspaciosSimilares({ espacioId, fecha, desde, hasta, limite } = {}) {
  try {
    return await api.get(`${rutaEspacio(espacioId)}/similares` + aQuery({ semana: fecha, desde, hasta, limite }));
  } catch (error) {
    // Igual que antes: si el espacio no existe, no hay similares que mostrar.
    if (error.status === 404) return [];
    throw error;
  }
}
