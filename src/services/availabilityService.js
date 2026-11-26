// src/services/availabilityService.js
//
// Servicio de DISPONIBILIDAD Y BÚSQUEDA (HU-3). Solo LEE: espacios (HU-2),
// bloques horarios (HU-2), reservas (HU-4) y bloqueos (HU-5). Nunca escribe;
// reservar es trabajo de reservationService (HU-4).
//
// Los componentes solo llaman a estas funciones. En la Entrega 2 el cuerpo se
// reemplaza por llamadas a la API manteniendo las mismas firmas (por eso todas
// son async, aunque hoy lean localStorage).
//
// Errores: se rechaza con un Error que trae message (listo para mostrar) y
// code ('NO_ENCONTRADO' | 'VALIDACION'), igual que los otros servicios.

import { getStoredData } from './storageService';
import { obtenerSedes } from './catalogService';
import { ESTADOS_QUE_OCUPAN } from '../utils/reglas';
import { toISODate } from '../utils/dates';
import { diasDeLaSemana, etiquetaDia, formatearFecha, sumarDias } from '../utils/semana';
import {
  bloqueEnFranja,
  ESTADOS_BLOQUE,
  evaluarBloque,
  normalizarEquipamiento,
  normalizarTexto,
} from '../utils/disponibilidad';

/* ------------------------------ Configuración ----------------------------- */

const NETWORK_LATENCY_MS = 400;

/* Etiquetas visibles de los tipos. Mismo mapa que spaceCatalogService (HU-2);
   cuando ambas ramas estén en main conviene moverlo a un único módulo. */
const TIPOS_ESPACIO = {
  sala: 'Sala de estudio grupal',
  laboratorio: 'Laboratorio de cómputo',
  cabina: 'Cabina de grabación',
  auditorio: 'Auditorio',
  sala_reuniones: 'Sala de reuniones',
};

/** Criterios de orden de la búsqueda (selector "Ordenar"). */
export const ORDENES_BUSQUEDA = [
  { value: 'proximidad', label: 'Proximidad' },
  { value: 'aforo', label: 'Aforo' },
  { value: 'sede', label: 'Sede' },
];

/* -------------------------------- Utilidades ------------------------------ */

const simularLatencia = (ms = NETWORK_LATENCY_MS) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const crearError = (message, extra = {}) => Object.assign(new Error(message), extra);

const etiquetaTipo = (tipo) => TIPOS_ESPACIO[tipo] ?? tipo;

const etiquetaSede = (sedeId) =>
  obtenerSedes().find((sede) => sede.value === sedeId)?.label ?? sedeId;

/* ---------------------------- Acceso a la base ---------------------------- */

function leerBase() {
  const db = getStoredData();
  return {
    espacios: db.espacios ?? [],
    bloques: [...(db.bloquesHorarios ?? [])].sort((a, b) =>
      a.horaInicio.localeCompare(b.horaInicio)
    ),
    reservas: db.reservas ?? [],
    bloqueos: db.bloqueos ?? [], // HU-5; puede no existir todavía
  };
}

/**
 * Prepara las búsquedas rápidas de un cálculo:
 *  - reservas que ocupan, indexadas por "espacio|fecha|bloque"
 *  - bloqueos agrupados por espacio
 */
function crearContexto(base, { usuarioId = null, ahora = new Date() } = {}) {
  const reservasPorClave = new Map();
  base.reservas
    .filter((r) => ESTADOS_QUE_OCUPAN.includes(r.estado))
    .forEach((r) => reservasPorClave.set(`${r.espacioId}|${r.fecha}|${r.bloqueId}`, r));

  const bloqueosPorEspacio = new Map();
  base.bloqueos.forEach((b) => {
    const lista = bloqueosPorEspacio.get(b.espacioId) ?? [];
    bloqueosPorEspacio.set(b.espacioId, [...lista, b]);
  });

  return { reservasPorClave, bloqueosPorEspacio, usuarioId, ahora };
}

/** Misma regla de cobertura que usan la HU-4 y la HU-5 (bloqueIds vacío = todo el día). */
function bloqueoQueCubre(ctx, espacioId, fecha, bloqueId) {
  return (
    (ctx.bloqueosPorEspacio.get(espacioId) ?? []).find(
      (b) =>
        fecha >= b.desde &&
        fecha <= b.hasta &&
        (!b.bloqueIds?.length || b.bloqueIds.includes(bloqueId))
    ) ?? null
  );
}

/** Estado de cada bloque de un espacio en una fecha. */
function calcularDia(espacio, fecha, bloques, ctx) {
  return bloques.map((bloque) => ({
    fecha,
    bloqueId: bloque.id,
    ...evaluarBloque({
      espacio,
      fecha,
      bloque,
      reserva: ctx.reservasPorClave.get(`${espacio.id}|${fecha}|${bloque.id}`) ?? null,
      bloqueo: bloqueoQueCubre(ctx, espacio.id, fecha, bloque.id),
      usuarioId: ctx.usuarioId,
      ahora: ctx.ahora,
    }),
  }));
}

/* ------------------------------ Vistas (DTO) ------------------------------ */

/** Espacio listo para la interfaz, tolerante a los campos que aún no existen. */
function vistaEspacio(espacio) {
  return {
    id: espacio.id,
    codigo: espacio.codigo ?? '', // lo agrega la HU-2; vacío mientras no exista
    nombre: espacio.nombre,
    tipo: espacio.tipo,
    tipoLabel: etiquetaTipo(espacio.tipo),
    sedeId: espacio.sedeId,
    sedeLabel: etiquetaSede(espacio.sedeId),
    pabellon: espacio.pabellon ?? espacio.ubicacion ?? '',
    piso: espacio.piso ?? null,
    ubicacion: espacio.ubicacion ?? espacio.pabellon ?? '',
    capacidad: Number(espacio.capacidad ?? 0),
    descripcion: espacio.descripcion ?? '',
    equipamiento: normalizarEquipamiento(espacio.equipamiento),
    estado: espacio.estado,
  };
}

const vistaBloque = (bloque) => ({
  id: bloque.id,
  horaInicio: bloque.horaInicio,
  horaFin: bloque.horaFin,
  etiqueta: `${bloque.horaInicio} – ${bloque.horaFin}`,
});

/** Cuenta bloques por estado: { libre, ocupado, propia, no_disponible }. */
function contarPorEstado(celdas) {
  const conteo = Object.fromEntries(Object.values(ESTADOS_BLOQUE).map((estado) => [estado, 0]));
  celdas.forEach((celda) => {
    conteo[celda.estado] += 1;
  });
  return conteo;
}

/* -------------------------------- Filtros --------------------------------- */

function cumpleFiltros(espacio, { sede, tipos = [], aforoMin, equipamiento = [] }) {
  if (sede && espacio.sedeId !== sede) return false;
  if (tipos.length && !tipos.includes(espacio.tipo)) return false;
  if (aforoMin && espacio.capacidad < Number(aforoMin)) return false;
  if (equipamiento.length) {
    const tiene = new Set(espacio.equipamiento.map((item) => normalizarTexto(item.nombre)));
    if (!equipamiento.every((nombre) => tiene.has(normalizarTexto(nombre)))) return false;
  }
  return true;
}

/** Desempate estable: por código y, si aún no hay código, por nombre. */
const porCodigo = (a, b) => (a.codigo || a.nombre).localeCompare(b.codigo || b.nombre, 'es');

const COMPARADORES = {
  // El siguiente bloque libre más temprano primero; empate → menor aforo.
  proximidad: (a, b) =>
    a.proximoLibre.horaInicio.localeCompare(b.proximoLibre.horaInicio) ||
    a.capacidad - b.capacidad ||
    porCodigo(a, b),
  aforo: (a, b) => a.capacidad - b.capacidad || porCodigo(a, b),
  sede: (a, b) => a.sedeLabel.localeCompare(b.sedeLabel, 'es') || porCodigo(a, b),
};

/* =============================== API pública ============================== */

/**
 * Opciones del panel de filtros (mockup 3.1), sacadas de los espacios
 * disponibles: así un ítem nuevo de la HU-2 aparece solo.
 * @returns {Promise<{ sedes, tipos, equipamiento, ordenes }>} listas de { value, label }
 */
export async function obtenerOpcionesDeBusqueda() {
  await simularLatencia(150);
  const espacios = leerBase()
    .espacios.filter((e) => e.estado === 'disponible')
    .map(vistaEspacio);

  const tipos = [...new Set(espacios.map((e) => e.tipo))];
  const equipos = new Map(); // normalizado → nombre visible (el primero que aparece)
  espacios.forEach((e) =>
    e.equipamiento.forEach((item) => {
      const clave = normalizarTexto(item.nombre);
      if (!equipos.has(clave)) equipos.set(clave, item.nombre);
    })
  );

  return {
    sedes: obtenerSedes(),
    tipos: tipos.map((value) => ({ value, label: etiquetaTipo(value) })),
    equipamiento: [...equipos.values()]
      .sort((a, b) => a.localeCompare(b, 'es'))
      .map((nombre) => ({ value: nombre, label: nombre })),
    ordenes: ORDENES_BUSQUEDA,
  };
}

/**
 * Búsqueda de espacios con al menos un bloque libre en el día y la franja.
 *
 * @param {Object} filtros
 * @param {string}   [filtros.sede]          id de sede ('sede_central')
 * @param {string[]} [filtros.tipos]         ids de tipo; vacío = todos
 * @param {number}   [filtros.aforoMin]
 * @param {string[]} [filtros.equipamiento]  nombres; el espacio debe tenerlos TODOS
 * @param {string}   [filtros.fecha]         'YYYY-MM-DD' (por defecto, hoy)
 * @param {string}   [filtros.desde]         'HH:MM' inicio de la franja
 * @param {string}   [filtros.hasta]         'HH:MM' fin de la franja
 * @param {string}   [filtros.orden]         'proximidad' | 'aforo' | 'sede'
 * @param {{ usuarioId?: string, ahora?: Date }} [opciones]
 * @returns {Promise<{ resultados: Object[], total: number, fecha: string }>}
 *          cada resultado = vistaEspacio + { bloquesLibres, proximoLibre: { bloqueId, horaInicio } }
 */
export async function buscarEspacios(filtros = {}, opciones = {}) {
  await simularLatencia();
  const { fecha = toISODate(), desde, hasta, orden = 'proximidad' } = filtros;
  if (desde && hasta && desde >= hasta) {
    throw crearError('La hora de inicio debe ser anterior a la hora de fin.', {
      code: 'VALIDACION',
    });
  }

  const base = leerBase();
  const ctx = crearContexto(base, opciones);
  const bloques = base.bloques.filter((b) => bloqueEnFranja(b, desde, hasta));

  const resultados = base.espacios
    .filter((e) => e.estado === 'disponible')
    .map((espacio) => ({ espacio, vista: vistaEspacio(espacio) }))
    .filter(({ vista }) => cumpleFiltros(vista, filtros))
    .map(({ espacio, vista }) => {
      const libres = calcularDia(espacio, fecha, bloques, ctx).filter(
        (celda) => celda.estado === ESTADOS_BLOQUE.libre
      );
      const primero = libres[0] && bloques.find((b) => b.id === libres[0].bloqueId);
      return {
        ...vista,
        bloquesLibres: libres.length,
        proximoLibre: primero ? { bloqueId: primero.id, horaInicio: primero.horaInicio } : null,
      };
    })
    .filter((resultado) => resultado.proximoLibre)
    .sort(COMPARADORES[orden] ?? COMPARADORES.proximidad);

  return { resultados, total: resultados.length, fecha };
}

/**
 * Calendario semanal de un espacio (mockups 3.4, 3.5 y 3.6).
 *
 * @param {Object} params
 * @param {string} params.espacioId
 * @param {string} [params.fecha]   cualquier día de la semana a mostrar (por defecto, hoy)
 * @param {string} [params.desde]   'HH:MM' franja opcional (mockup 3.6)
 * @param {string} [params.hasta]   'HH:MM'
 * @param {string|null} [params.usuarioId] para marcar "Mi reserva"
 * @param {Date} [params.ahora]
 * @returns {Promise<{
 *   espacio: Object,
 *   semana: { desde, hasta, rangoTexto, anterior, siguiente, dias: [{ fecha, etiqueta, esHoy }] },
 *   bloques: [{ id, horaInicio, horaFin, etiqueta }],
 *   filas:   [{ bloque, celdas: [{ fecha, bloqueId, estado, motivo, detalle }] }],
 *   resumen: { libre, ocupado, propia, no_disponible },
 *   franja:  { desde, hasta } | null,
 *   sinDisponibilidad: boolean,
 *   semanaCompleta: boolean
 * }>}
 */
export async function obtenerDisponibilidadSemanal({
  espacioId,
  fecha = toISODate(),
  desde,
  hasta,
  usuarioId = null,
  ahora = new Date(),
} = {}) {
  await simularLatencia();
  const base = leerBase();
  const espacio = base.espacios.find((e) => e.id === espacioId);
  if (!espacio) {
    throw crearError('El espacio que buscas no existe o fue retirado del catálogo.', {
      code: 'NO_ENCONTRADO',
    });
  }

  const ctx = crearContexto(base, { usuarioId, ahora });
  const dias = diasDeLaSemana(fecha);
  const bloques = base.bloques.filter((b) => bloqueEnFranja(b, desde, hasta));
  const columnas = dias.map((dia) => calcularDia(espacio, dia, bloques, ctx));

  // Pasa de columnas (día → bloques) a filas (bloque → días), que es como se dibuja.
  const filas = bloques.map((bloque, i) => ({
    bloque: vistaBloque(bloque),
    celdas: columnas.map((columna) => columna[i]),
  }));
  const resumen = contarPorEstado(columnas.flat());
  const hoy = toISODate(ahora);

  return {
    espacio: vistaEspacio(espacio),
    semana: {
      desde: dias[0],
      hasta: dias[dias.length - 1],
      rangoTexto: `${formatearFecha(dias[0])} al ${formatearFecha(dias[dias.length - 1])}`,
      anterior: sumarDias(dias[0], -7),
      siguiente: sumarDias(dias[0], 7),
      dias: dias.map((dia) => ({ fecha: dia, etiqueta: etiquetaDia(dia), esHoy: dia === hoy })),
    },
    bloques: bloques.map(vistaBloque),
    filas,
    resumen,
    franja: desde || hasta ? { desde: desde ?? null, hasta: hasta ?? null } : null,
    // 3.6: ningún bloque libre en el rango consultado.
    sinDisponibilidad: resumen[ESTADOS_BLOQUE.libre] === 0,
    // 3.5: hay bloques en horario y todos están tomados por reservas.
    semanaCompleta:
      resumen[ESTADOS_BLOQUE.libre] === 0 &&
      resumen[ESTADOS_BLOQUE.ocupado] + resumen[ESTADOS_BLOQUE.propia] > 0,
  };
}

/**
 * Espacios parecidos con bloques libres en la misma semana y franja
 * (mockups 3.5 y 3.6, "Espacios similares con disponibilidad").
 * Prioriza el mismo tipo y luego el aforo más cercano.
 *
 * @returns {Promise<Object[]>} vistaEspacio + { bloquesLibres }
 */
export async function obtenerEspaciosSimilares({
  espacioId,
  fecha = toISODate(),
  desde,
  hasta,
  limite = 3,
  ahora = new Date(),
} = {}) {
  await simularLatencia(250);
  const base = leerBase();
  const origen = base.espacios.find((e) => e.id === espacioId);
  if (!origen) return [];

  const ctx = crearContexto(base, { ahora });
  const dias = diasDeLaSemana(fecha);
  const bloques = base.bloques.filter((b) => bloqueEnFranja(b, desde, hasta));

  return base.espacios
    .filter((e) => e.id !== origen.id && e.estado === 'disponible')
    .map((espacio) => ({
      ...vistaEspacio(espacio),
      mismoTipo: espacio.tipo === origen.tipo,
      bloquesLibres: dias
        .flatMap((dia) => calcularDia(espacio, dia, bloques, ctx))
        .filter((celda) => celda.estado === ESTADOS_BLOQUE.libre).length,
    }))
    .filter((e) => e.bloquesLibres > 0)
    .sort(
      (a, b) =>
        Number(b.mismoTipo) - Number(a.mismoTipo) ||
        Math.abs(a.capacidad - origen.capacidad) - Math.abs(b.capacidad - origen.capacidad)
    )
    .slice(0, limite);
}