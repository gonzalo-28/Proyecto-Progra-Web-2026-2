// src/services/operationService.js
//
// Servicio de la HU-5 (operación diaria del encargado). Es la ÚNICA capa de
// la HU-5 que lee o escribe reservas en la base local (vía storageService),
// siguiendo el contrato de reservas de la HU-4 (src/data/reservasSemilla.js):
//
//   - Registrar llegada   → estado 'atendida', llegadaRegistradaEn, historial 'llegada_registrada'
//   - Marcar inasistencia → estado 'inasistencia', historial 'inasistencia_marcada'
//   - Cancelar            → estado 'cancelada', cancelacion { porRol: 'encargado', motivo, … }, historial 'cancelada'
//
// No usa reservationService (de la HU-4): así ninguna historia escribe a
// través del código de otra. Los componentes no conocen la forma guardada:
// reciben la "vista" que arma aVistaReserva. En la Entrega 2 se reemplaza el
// cuerpo por llamadas a la API manteniendo las mismas firmas.
//
// Errores: como authService, rechaza con Error { message, code }.
// Las validaciones se repiten aquí aunque la interfaz ya oculte los botones
// ("las validaciones se repiten en el servidor").

import { getStoredData, saveStoredData } from './storageService';
import {
  EARLY_ARRIVAL_MINUTES,
  formatTime,
  getToleranceStatus,
  toDateTime,
} from '../utils/tolerance';
import { toISODate } from '../utils/dates';
import { ESTADOS_RESERVA } from '../utils/reglas';
import { etiquetaMotivo, validarCancelacion } from '../utils/reglasOperacion';

/* ------------------------------ Configuración ----------------------------- */

const NETWORK_LATENCY_MS = 300;

const HISTORIAL = {
  llegada: 'llegada_registrada',
  inasistencia: 'inasistencia_marcada',
  cancelada: 'cancelada',
};

/* -------------------------------- Utilidades ------------------------------ */

const simularLatencia = (ms = NETWORK_LATENCY_MS) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const crearError = (message, extra = {}) => Object.assign(new Error(message), extra);

const indexarPorId = (lista = []) => new Map(lista.map((item) => [String(item.id), item]));

const nombreCompleto = (usuario) =>
  [usuario?.nombres, usuario?.apellidos].filter(Boolean).join(' ') || 'Usuario';

/** Fecha guardada (ISO o 'YYYY-MM-DDTHH:mm:00') → 'HH:MM' local, o null. */
const horaDe = (valor) => (valor ? formatTime(new Date(valor)) : null);

/** Última entrada del historial de un tipo dado, o null. */
const ultimoEvento = (reserva, tipo) =>
  [...(reserva.historial ?? [])].reverse().find((evento) => evento.tipo === tipo) ?? null;

/**
 * Inasistencias acumuladas por usuario. Misma regla que la HU-4
 * (calcularInasistencias en reservationService): inasistencias marcadas +
 * cancelaciones tardías.
 */
function contarInasistencias(reservas) {
  const conteo = new Map();
  reservas
    .filter(
      (r) =>
        r.estado === ESTADOS_RESERVA.inasistencia ||
        (r.estado === ESTADOS_RESERVA.cancelada && r.cancelacion?.tardia)
    )
    .forEach((r) => conteo.set(r.usuarioId, (conteo.get(r.usuarioId) ?? 0) + 1));
  return conteo;
}

/** Invitados del contrato: [{ nombre, correo }] (tolera strings sueltos). */
const nombresInvitados = (invitados = []) =>
  invitados.map((i) => (typeof i === 'string' ? i : i?.nombre)).filter(Boolean);

/* ------------------------- Mapeo: base → vista ---------------------------- */
/* ÚNICO lugar que conoce los nombres de campo guardados. Si el contrato de la
   HU-4 cambia, se ajusta aquí. */

function aVistaReserva(reserva, { espacio, bloque, usuario, inasistencias }) {
  const eventoLlegada = ultimoEvento(reserva, HISTORIAL.llegada);
  const eventoInasistencia = ultimoEvento(reserva, HISTORIAL.inasistencia);

  return {
    id: reserva.id,
    codigo: reserva.codigo,
    fecha: reserva.fecha,
    horaInicio: bloque?.horaInicio ?? '--:--',
    horaFin: bloque?.horaFin ?? '--:--',
    estado: reserva.estado,
    motivo: reserva.motivo ?? '',
    asistentes: reserva.asistentes ?? 0,
    invitados: nombresInvitados(reserva.invitados),
    llegada: horaDe(reserva.llegadaRegistradaEn),
    inasistenciaMarcada: horaDe(eventoInasistencia?.fecha),
    operadaPor: (eventoLlegada ?? eventoInasistencia)?.actor ?? null,
    cancelacion: reserva.cancelacion
      ? {
          porRol: reserva.cancelacion.porRol ?? 'estudiante',
          motivo: reserva.cancelacion.motivo ?? null,
        }
      : null,
    espacio: { id: espacio?.id, nombre: espacio?.nombre ?? 'Espacio' },
    estudiante: {
      id: usuario?.id,
      nombreCompleto: nombreCompleto(usuario),
      codigo: usuario?.codigo ?? null,
      correo: usuario?.correo ?? '',
      inasistencias: inasistencias ?? 0,
    },
  };
}

/** Índices de lectura que comparten las consultas. */
function leerBase() {
  const db = getStoredData();
  return {
    db,
    espacios: indexarPorId(db.espacios),
    bloques: indexarPorId(db.bloquesHorarios),
    usuarios: indexarPorId(db.usuarios),
    inasistencias: contarInasistencias(db.reservas ?? []),
  };
}

function vistaDe(reserva, base) {
  return aVistaReserva(reserva, {
    espacio: base.espacios.get(String(reserva.espacioId)),
    bloque: base.bloques.get(String(reserva.bloqueId)),
    usuario: base.usuarios.get(String(reserva.usuarioId)),
    inasistencias: base.inasistencias.get(reserva.usuarioId),
  });
}

/* --------------------------- Bandeja del día ------------------------------ */

const CONTADORES_VACIOS = { total: 0, confirmadas: 0, atendidas: 0, inasistencias: 0, canceladas: 0 };

const CLAVE_CONTADOR = {
  [ESTADOS_RESERVA.confirmada]: 'confirmadas',
  [ESTADOS_RESERVA.atendida]: 'atendidas',
  [ESTADOS_RESERVA.inasistencia]: 'inasistencias',
  [ESTADOS_RESERVA.cancelada]: 'canceladas',
};

/**
 * Reservas de un día en los espacios de una sede, agrupadas por espacio y
 * ordenadas por hora, con contadores por estado.
 *
 * @param {{ sedeId: string, fecha: string }} filtros  fecha 'YYYY-MM-DD'
 * @returns {Promise<{
 *   contadores: { total, confirmadas, atendidas, inasistencias, canceladas },
 *   grupos: { espacio: { id, nombre, ubicacion }, reservas: Object[] }[]
 * }>}
 */
export const obtenerBandejaDelDia = async ({ sedeId, fecha }) => {
  await simularLatencia();
  const base = leerBase();

  const espaciosDeLaSede = (base.db.espacios ?? []).filter(
    (espacio) => !sedeId || espacio.sedeId === sedeId
  );
  const idsEspacios = new Set(espaciosDeLaSede.map((espacio) => String(espacio.id)));

  const reservasDelDia = (base.db.reservas ?? [])
    .filter((r) => r.fecha === fecha && idsEspacios.has(String(r.espacioId)))
    .map((r) => vistaDe(r, base))
    .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));

  const contadores = { ...CONTADORES_VACIOS, total: reservasDelDia.length };
  reservasDelDia.forEach((r) => {
    const clave = CLAVE_CONTADOR[r.estado];
    if (clave) contadores[clave] += 1;
  });

  // Un grupo por espacio que tenga reservas, en el orden del catálogo.
  const grupos = espaciosDeLaSede
    .map((espacio) => ({
      espacio: { id: espacio.id, nombre: espacio.nombre, ubicacion: espacio.ubicacion ?? '' },
      reservas: reservasDelDia.filter((r) => String(r.espacio.id) === String(espacio.id)),
    }))
    .filter((grupo) => grupo.reservas.length > 0);

  return { contadores, grupos };
};

/* ------------------------------ Escrituras -------------------------------- */

/**
 * Busca la reserva y verifica que sea operable por este encargado:
 * existe, está confirmada y su espacio pertenece a la sede del encargado.
 */
function obtenerReservaOperable(db, reservaId, encargadoId) {
  const encargado = (db.usuarios ?? []).find((u) => String(u.id) === String(encargadoId));
  if (!encargado || encargado.rol !== 'encargado') {
    throw crearError('Solo un encargado puede operar reservas.', { code: 'SIN_PERMISO' });
  }

  const reserva = (db.reservas ?? []).find((r) => String(r.id) === String(reservaId));
  if (!reserva) throw crearError('La reserva no existe.', { code: 'NO_ENCONTRADA' });

  const espacio = (db.espacios ?? []).find((e) => String(e.id) === String(reserva.espacioId));
  if (encargado.sedeAsignadaId && espacio?.sedeId !== encargado.sedeAsignadaId) {
    throw crearError('Esta reserva no pertenece a tu sede.', { code: 'SIN_PERMISO' });
  }
  if (reserva.estado !== ESTADOS_RESERVA.confirmada) {
    throw crearError('La reserva ya no está confirmada. Actualiza la bandeja.', {
      code: 'ESTADO_INVALIDO',
    });
  }

  const bloque = (db.bloquesHorarios ?? []).find((b) => String(b.id) === String(reserva.bloqueId));
  if (!bloque) throw crearError('El bloque de la reserva no existe.', { code: 'BLOQUE_INVALIDO' });

  return { reserva, bloque, encargado };
}

function guardarReserva(db, actualizada) {
  saveStoredData({
    ...db,
    reservas: db.reservas.map((r) => (r.id === actualizada.id ? actualizada : r)),
  });
}

const conEvento = (reserva, tipo, fecha, encargado) => [
  ...(reserva.historial ?? []),
  { tipo, fecha, actor: nombreCompleto(encargado) },
];

/**
 * Registra la llegada del estudiante (reserva → 'atendida').
 * Solo en la jornada de hoy, desde 15 min antes del inicio hasta el fin del bloque.
 *
 * @param {string} reservaId
 * @param {{ encargadoId: string, ahora?: Date }} opciones
 * @returns {Promise<{ codigo: string, hora: string, tardia: boolean }>}
 */
export const registrarLlegada = async (reservaId, { encargadoId, ahora = new Date() }) => {
  await simularLatencia();
  const db = getStoredData();
  const { reserva, bloque, encargado } = obtenerReservaOperable(db, reservaId, encargadoId);

  if (reserva.fecha !== toISODate(ahora)) {
    throw crearError('Solo puedes registrar llegadas de la jornada de hoy.', {
      code: 'FUERA_DE_JORNADA',
    });
  }

  const tolerancia = getToleranceStatus(
    { fecha: reserva.fecha, horaInicio: bloque.horaInicio, horaFin: bloque.horaFin },
    ahora
  );
  if (!tolerancia.canRegisterArrival) {
    if (tolerancia.hasEnded) {
      throw crearError('El bloque ya terminó: ya no se puede registrar la llegada.', {
        code: 'BLOQUE_TERMINADO',
      });
    }
    const desde = new Date(
      toDateTime(reserva.fecha, bloque.horaInicio).getTime() - EARLY_ARRIVAL_MINUTES * 60000
    );
    throw crearError(`Aún es temprano: podrás registrar la llegada desde las ${formatTime(desde)}.`, {
      code: 'MUY_TEMPRANO',
    });
  }

  const marca = ahora.toISOString();
  guardarReserva(db, {
    ...reserva,
    estado: ESTADOS_RESERVA.atendida,
    llegadaRegistradaEn: marca,
    historial: conEvento(reserva, HISTORIAL.llegada, marca, encargado),
  });

  return { codigo: reserva.codigo, hora: formatTime(ahora), tardia: tolerancia.isLateArrival };
};

/**
 * Marca la inasistencia (reserva → 'inasistencia') y libera el bloque.
 * Solo una vez vencida la tolerancia; sirve también para jornadas pasadas.
 *
 * @param {string} reservaId
 * @param {{ encargadoId: string, ahora?: Date }} opciones
 * @returns {Promise<{ codigo: string, estudiante: string }>}
 */
export const marcarInasistencia = async (reservaId, { encargadoId, ahora = new Date() }) => {
  await simularLatencia();
  const db = getStoredData();
  const { reserva, bloque, encargado } = obtenerReservaOperable(db, reservaId, encargadoId);

  const tolerancia = getToleranceStatus(
    { fecha: reserva.fecha, horaInicio: bloque.horaInicio, horaFin: bloque.horaFin },
    ahora
  );
  if (!tolerancia.canMarkAbsence) {
    throw crearError(
      `Todavía no vence la tolerancia: podrás marcar la inasistencia a las ${tolerancia.deadlineLabel}.`,
      { code: 'TOLERANCIA_VIGENTE' }
    );
  }

  const marca = ahora.toISOString();
  guardarReserva(db, {
    ...reserva,
    estado: ESTADOS_RESERVA.inasistencia,
    historial: conEvento(reserva, HISTORIAL.inasistencia, marca, encargado),
  });

  const usuario = (db.usuarios ?? []).find((u) => String(u.id) === String(reserva.usuarioId));
  return { codigo: reserva.codigo, estudiante: nombreCompleto(usuario) };
};

/**
 * Cancela una reserva como encargado (mockup 5.6) → estado 'cancelada'.
 * - Motivo obligatorio (lista de reglasOperacion.js); detalle opcional, salvo
 *   con "Otro".
 * - Se puede cancelar mientras el bloque no haya terminado (hoy o días futuros).
 * - No genera inasistencia (tardia: false).
 *
 * El texto de `cancelacion.motivo` ya incluye el detalle ("Corte programado de
 * energía: …") porque es lo que el estudiante ve en "Mis reservas" (HU-4).
 * Además se guardan `motivoCodigo` y `detalle` por separado.
 *
 * @param {string} reservaId
 * @param {{ encargadoId: string, motivo: string, detalle?: string, ahora?: Date }} datos
 *        motivo = código ('corte_energia', 'otro'…)
 * @returns {Promise<{ codigo: string, estudiante: string }>}
 */
export const cancelarPorEncargado = async (
  reservaId,
  { encargadoId, motivo, detalle = '', ahora = new Date() }
) => {
  await simularLatencia();

  const campos = validarCancelacion({ motivo, detalle });
  if (Object.keys(campos).length > 0) {
    throw crearError('Revisa los campos marcados.', { code: 'VALIDACION', campos });
  }

  const db = getStoredData();
  const { reserva, bloque, encargado } = obtenerReservaOperable(db, reservaId, encargadoId);

  const fin = toDateTime(reserva.fecha, bloque.horaFin);
  if (ahora.getTime() >= fin.getTime()) {
    throw crearError('El bloque ya terminó: esta reserva ya no se puede cancelar.', {
      code: 'NO_CANCELABLE',
    });
  }

  const textoDetalle = String(detalle).trim();
  const etiqueta = etiquetaMotivo(motivo);
  const marca = ahora.toISOString();

  guardarReserva(db, {
    ...reserva,
    estado: ESTADOS_RESERVA.cancelada,
    cancelacion: {
      fecha: marca,
      porUsuarioId: encargado.id,
      porRol: 'encargado',
      motivo: textoDetalle ? `${etiqueta}: ${textoDetalle}` : etiqueta,
      motivoCodigo: motivo,
      detalle: textoDetalle || null,
      tardia: false, // la cancelación del encargado nunca suma inasistencia
    },
    historial: conEvento(reserva, HISTORIAL.cancelada, marca, encargado),
  });

  const usuario = (db.usuarios ?? []).find((u) => String(u.id) === String(reserva.usuarioId));
  return { codigo: reserva.codigo, estudiante: nombreCompleto(usuario) };
};
