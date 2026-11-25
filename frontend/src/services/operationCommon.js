// src/services/operationCommon.js
//
// Piezas INTERNAS que comparten los servicios de la HU-5 (operationService y
// blockService): latencia simulada, errores, lectura de la base y el mapeo de
// una reserva guardada a la "vista" que reciben los componentes.
// Los componentes NO importan este archivo; solo los servicios.

import { getStoredData } from './storageService';
import { formatTime } from '../utils/tolerance';
import { ESTADOS_RESERVA } from '../utils/reglas';

/* ------------------------------ Configuración ----------------------------- */

const NETWORK_LATENCY_MS = 300;

export const HISTORIAL = {
  llegada: 'llegada_registrada',
  inasistencia: 'inasistencia_marcada',
  cancelada: 'cancelada',
};

/* -------------------------------- Utilidades ------------------------------ */

export const simularLatencia = (ms = NETWORK_LATENCY_MS) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const crearError = (message, extra = {}) => Object.assign(new Error(message), extra);

export const indexarPorId = (lista = []) => new Map(lista.map((item) => [String(item.id), item]));

export const nombreCompleto = (usuario) =>
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
export function leerBase() {
  const db = getStoredData();
  return {
    db,
    espacios: indexarPorId(db.espacios),
    bloques: indexarPorId(db.bloquesHorarios),
    usuarios: indexarPorId(db.usuarios),
    inasistencias: contarInasistencias(db.reservas ?? []),
  };
}

export function vistaDe(reserva, base) {
  return aVistaReserva(reserva, {
    espacio: base.espacios.get(String(reserva.espacioId)),
    bloque: base.bloques.get(String(reserva.bloqueId)),
    usuario: base.usuarios.get(String(reserva.usuarioId)),
    inasistencias: base.inasistencias.get(reserva.usuarioId),
  });
}


export const conEvento = (reserva, tipo, fecha, encargado) => [
  ...(reserva.historial ?? []),
  { tipo, fecha, actor: nombreCompleto(encargado) },
];
