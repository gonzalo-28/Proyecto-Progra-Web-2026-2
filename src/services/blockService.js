// src/services/blockService.js
//
// Bloqueos por mantenimiento o evento institucional (HU-5, mockup 5.4).
// Vive en db.bloqueos con la forma acordada con la HU-4:
//   { id, espacioId, desde, hasta, bloqueIds: [] (vacío = todo el día), motivo }
// más tipo ('mantenimiento' | 'evento'), creadoPor, creadoEn y reservasCanceladas.
// crearReserva (HU-4) ya rechaza reservas en bloques bloqueados.
//
// Al crear un bloqueo se cancelan, en la MISMA escritura, las reservas
// confirmadas que caen dentro (sin inasistencia y con el motivo visible).

import { getStoredData, saveStoredData } from './storageService';
import {
  conEvento,
  crearError,
  HISTORIAL,
  indexarPorId,
  leerBase,
  simularLatencia,
  vistaDe,
} from './operationCommon';
import { toDateTime } from '../utils/tolerance';
import { formatShortDate, listDays, toISODate } from '../utils/dates';
import { ESTADOS_RESERVA } from '../utils/reglas';
import { ALCANCE_BLOQUEO, etiquetaTipoBloqueo, validarBloqueo } from '../utils/reglasOperacion';

/** Bloques horarios del catálogo, ordenados por hora (para los chips del formulario). */
export const obtenerBloquesHorarios = () =>
  [...(getStoredData().bloquesHorarios ?? [])]
    .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
    .map((b) => ({ id: b.id, horaInicio: b.horaInicio, horaFin: b.horaFin }));

/** ¿El bloqueo cubre esa fecha y ese bloque? (misma regla que usa crearReserva de la HU-4) */
const cubre = (bloqueo, fecha, bloqueId) =>
  fecha >= bloqueo.desde &&
  fecha <= bloqueo.hasta &&
  (!bloqueo.bloqueIds?.length || bloqueo.bloqueIds.includes(bloqueId));

/**
 * Reservas confirmadas que un bloqueo cancelaría: mismo espacio, dentro del
 * rango y de los bloques elegidos, y cuyo bloque todavía no terminó.
 */
function reservasAfectadas(db, { espacioId, desde, hasta, bloqueIds }, ahora) {
  const bloques = indexarPorId(db.bloquesHorarios);
  const bloqueo = { desde, hasta, bloqueIds };
  return (db.reservas ?? []).filter((r) => {
    if (String(r.espacioId) !== String(espacioId)) return false;
    if (r.estado !== ESTADOS_RESERVA.confirmada) return false;
    if (!cubre(bloqueo, r.fecha, r.bloqueId)) return false;
    const bloque = bloques.get(String(r.bloqueId));
    return bloque ? toDateTime(r.fecha, bloque.horaFin).getTime() > ahora.getTime() : false;
  });
}

/**
 * Vista previa del bloqueo (mockup 5.4, columna derecha). Es síncrona porque
 * se recalcula mientras el encargado llena el formulario.
 *
 * @param {{ espacioId, desde, hasta, bloqueIds }} datos  bloqueIds vacío = todo el día
 * @returns {{ dias: string[], bloques: Object[], afectadas: Object[] }}
 *          afectadas = vistas de reserva que se cancelarían
 */
export const previsualizarBloqueo = ({ espacioId, desde, hasta, bloqueIds = [] }, ahora = new Date()) => {
  const base = leerBase();
  const afectadas = reservasAfectadas(base.db, { espacioId, desde, hasta, bloqueIds }, ahora)
    .map((r) => vistaDe(r, base))
    .sort((a, b) => `${a.fecha} ${a.horaInicio}`.localeCompare(`${b.fecha} ${b.horaInicio}`));

  return { dias: listDays(desde, hasta), bloques: obtenerBloquesHorarios(), afectadas };
};

/** Vista de un bloqueo para la lista de "Bloqueos vigentes". */
function aVistaBloqueo(bloqueo, base) {
  const horas = (bloqueo.bloqueIds ?? [])
    .map((id) => base.bloques.get(String(id)))
    .filter(Boolean)
    .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
    .map((b) => b.horaInicio);
  return {
    id: bloqueo.id,
    tipo: bloqueo.tipo ?? 'mantenimiento',
    tipoLabel: etiquetaTipoBloqueo(bloqueo.tipo ?? 'mantenimiento'),
    espacio: base.espacios.get(String(bloqueo.espacioId))?.nombre ?? 'Espacio',
    rango:
      bloqueo.desde === bloqueo.hasta
        ? formatShortDate(bloqueo.desde)
        : `${formatShortDate(bloqueo.desde)} – ${formatShortDate(bloqueo.hasta)}`,
    bloques: horas.length ? horas.join(' · ') : 'Todo el día',
    motivo: bloqueo.motivo,
    canceladas: bloqueo.reservasCanceladas ?? 0,
  };
}

/**
 * Bloqueos vigentes (que terminan hoy o después) de los espacios de una sede.
 * @returns {Promise<Object[]>}
 */
export const obtenerBloqueosVigentes = async ({ sedeId, ahora = new Date() }) => {
  await simularLatencia();
  const base = leerBase();
  const hoy = toISODate(ahora);
  const idsSede = new Set(
    (base.db.espacios ?? []).filter((e) => !sedeId || e.sedeId === sedeId).map((e) => String(e.id))
  );
  return (base.db.bloqueos ?? [])
    .filter((b) => b.hasta >= hoy && idsSede.has(String(b.espacioId)))
    .sort((a, b) => a.desde.localeCompare(b.desde))
    .map((b) => aVistaBloqueo(b, base));
};

/**
 * Crea un bloqueo y cancela (en la misma escritura) las reservas confirmadas
 * que caen dentro. Esas cancelaciones no generan inasistencia y llevan el
 * motivo del bloqueo, visible para cada estudiante en "Mis reservas".
 *
 * @param {{ encargadoId, tipo, espacioId, desde, hasta, alcance, bloqueIds, motivo, ahora? }} datos
 * @returns {Promise<{ bloqueo: Object, canceladas: number }>}
 */
export const crearBloqueo = async ({
  encargadoId,
  tipo,
  espacioId,
  desde,
  hasta,
  alcance,
  bloqueIds = [],
  motivo,
  ahora = new Date(),
}) => {
  await simularLatencia();

  const datos = { tipo, espacioId, desde, hasta, alcance, bloqueIds, motivo };
  const campos = validarBloqueo(datos, toISODate(ahora));
  if (Object.keys(campos).length > 0) {
    throw crearError('Revisa los campos marcados.', { code: 'VALIDACION', campos });
  }

  const db = getStoredData();
  const encargado = (db.usuarios ?? []).find((u) => String(u.id) === String(encargadoId));
  if (!encargado || encargado.rol !== 'encargado') {
    throw crearError('Solo un encargado puede registrar bloqueos.', { code: 'SIN_PERMISO' });
  }
  const espacio = (db.espacios ?? []).find((e) => String(e.id) === String(espacioId));
  if (!espacio) throw crearError('El espacio no existe.', { code: 'NO_ENCONTRADO' });
  if (encargado.sedeAsignadaId && espacio.sedeId !== encargado.sedeAsignadaId) {
    throw crearError('Ese espacio no pertenece a tu sede.', { code: 'SIN_PERMISO' });
  }

  const bloquesElegidos = alcance === ALCANCE_BLOQUEO.rango ? [...bloqueIds] : [];
  const idsValidos = new Set((db.bloquesHorarios ?? []).map((b) => String(b.id)));
  if (bloquesElegidos.some((id) => !idsValidos.has(String(id)))) {
    throw crearError('Hay bloques horarios que no existen.', {
      code: 'VALIDACION',
      campos: { bloqueIds: 'Elige bloques horarios válidos.' },
    });
  }

  // No se permiten dos bloqueos que cubran el mismo espacio, día y bloque.
  const nuevo = { desde, hasta, bloqueIds: bloquesElegidos };
  const choca = (db.bloqueos ?? []).some(
    (b) =>
      String(b.espacioId) === String(espacioId) &&
      b.desde <= hasta &&
      b.hasta >= desde &&
      (!b.bloqueIds?.length || !bloquesElegidos.length || b.bloqueIds.some((id) => bloquesElegidos.includes(id)))
  );
  if (choca) {
    throw crearError('Ya existe un bloqueo para ese espacio que se cruza con estas fechas y bloques.', {
      code: 'BLOQUEO_DUPLICADO',
    });
  }

  const marca = ahora.toISOString();
  const motivoTexto = String(motivo).trim();
  const bloqueo = {
    id: `blq_${Date.now()}`,
    espacioId,
    desde,
    hasta,
    bloqueIds: bloquesElegidos,
    motivo: motivoTexto,
    tipo,
    creadoPor: encargado.id,
    creadoEn: marca,
  };

  const afectadas = new Set(reservasAfectadas(db, { espacioId, ...nuevo }, ahora).map((r) => r.id));
  const motivoVisible = `${tipo === 'evento' ? 'Evento institucional' : 'Bloqueo por mantenimiento'}: ${motivoTexto}`;

  const reservas = (db.reservas ?? []).map((r) =>
    afectadas.has(r.id)
      ? {
          ...r,
          estado: ESTADOS_RESERVA.cancelada,
          cancelacion: {
            fecha: marca,
            porUsuarioId: encargado.id,
            porRol: 'encargado',
            motivo: motivoVisible,
            motivoCodigo: 'bloqueo',
            detalle: motivoTexto,
            bloqueoId: bloqueo.id,
            tardia: false,
          },
          historial: conEvento(r, HISTORIAL.cancelada, marca, encargado),
        }
      : r
  );

  bloqueo.reservasCanceladas = afectadas.size;
  saveStoredData({ ...db, reservas, bloqueos: [...(db.bloqueos ?? []), bloqueo] });

  return { bloqueo, canceladas: afectadas.size };
};

/**
 * Elimina un bloqueo (los bloques vuelven a estar libres). Las reservas que ya
 * se cancelaron NO se reactivan: el estudiante ya fue avisado.
 */
export const eliminarBloqueo = async (bloqueoId, { encargadoId }) => {
  await simularLatencia();
  const db = getStoredData();
  const encargado = (db.usuarios ?? []).find((u) => String(u.id) === String(encargadoId));
  if (!encargado || encargado.rol !== 'encargado') {
    throw crearError('Solo un encargado puede eliminar bloqueos.', { code: 'SIN_PERMISO' });
  }
  const bloqueo = (db.bloqueos ?? []).find((b) => b.id === bloqueoId);
  if (!bloqueo) throw crearError('El bloqueo ya no existe.', { code: 'NO_ENCONTRADO' });
  const espacio = (db.espacios ?? []).find((e) => String(e.id) === String(bloqueo.espacioId));
  if (encargado.sedeAsignadaId && espacio?.sedeId !== encargado.sedeAsignadaId) {
    throw crearError('Ese bloqueo no pertenece a tu sede.', { code: 'SIN_PERMISO' });
  }
  saveStoredData({ ...db, bloqueos: db.bloqueos.filter((b) => b.id !== bloqueoId) });
};
