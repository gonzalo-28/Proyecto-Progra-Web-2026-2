// src/services/operationLog.js
//
// HU-5 · "Historial de la operación del día, exportable como listado".
// Arma la lista cronológica de lo que se OPERÓ en un día en los espacios de
// una sede, a partir de lo que ya está guardado (no hay una tabla aparte):
//   - historial de cada reserva: llegada_registrada, inasistencia_marcada, cancelada
//   - bloqueos creados ese día (db.bloqueos)
// Cuenta el día en que ocurrió la acción, no el de la reserva: cancelar hoy
// una reserva de mañana es parte de la operación de hoy.
//
// Uso interno de operationService (se entrega junto con la bandeja).

import { formatShortDate, toISODate } from '../utils/dates';
import { formatTime, toDateTime, TOLERANCE_MINUTES } from '../utils/tolerance';
import { etiquetaTipoBloqueo } from '../utils/reglasOperacion';
import { HISTORIAL, nombreCompleto } from './operationCommon';

/** Tipos de evento del historial que son parte de la operación (no 'creada'). */
const ACCIONES = {
  [HISTORIAL.llegada]: 'Llegada registrada',
  [HISTORIAL.inasistencia]: 'Inasistencia marcada',
  [HISTORIAL.cancelada]: 'Reserva cancelada',
  bloqueo: 'Bloqueo creado',
};

const minutosEntre = (desde, hasta) => Math.round((hasta.getTime() - desde.getTime()) / 60000);

/** Texto de la columna "Detalle" para un evento de reserva. */
function detalleDeEvento(evento, reserva, bloque, momento) {
  if (evento.tipo === HISTORIAL.llegada && bloque) {
    const tarde = minutosEntre(toDateTime(reserva.fecha, bloque.horaInicio), momento);
    return tarde >= TOLERANCE_MINUTES ? `Llegada tardía (+${tarde} min)` : 'Dentro de la tolerancia';
  }
  if (evento.tipo === HISTORIAL.inasistencia) return 'Sin llegada pasada la tolerancia';
  if (evento.tipo === HISTORIAL.cancelada) {
    const c = reserva.cancelacion ?? {};
    const quien = c.porRol === 'encargado' ? 'Por el encargado' : 'Por el estudiante';
    const extra = c.tardia ? 'cancelación tardía (suma inasistencia)' : c.motivo;
    return extra ? `${quien}: ${extra}` : quien;
  }
  return '';
}

/**
 * @param {{ db, espacios: Map, bloques: Map, usuarios: Map }} base  (leerBase)
 * @param {{ sedeId: string, fecha: string }} filtros
 * @returns {Object[]} eventos ordenados por hora:
 *   { id, momento (ms), hora, accion, tipo, codigo, estudiante, codigoEstudiante,
 *     espacio, bloque, fechaReserva, responsable, detalle }
 */
export function construirHistorialDelDia(base, { sedeId, fecha }) {
  const enSede = (espacioId) => {
    const espacio = base.espacios.get(String(espacioId));
    return Boolean(espacio) && (!sedeId || espacio.sedeId === sedeId);
  };
  const eventos = [];

  (base.db.reservas ?? []).forEach((reserva) => {
    if (!enSede(reserva.espacioId)) return;
    const bloque = base.bloques.get(String(reserva.bloqueId));
    const usuario = base.usuarios.get(String(reserva.usuarioId));

    (reserva.historial ?? []).forEach((evento, i) => {
      if (!ACCIONES[evento.tipo] || evento.tipo === 'bloqueo') return;
      const momento = new Date(evento.fecha);
      if (Number.isNaN(momento.getTime()) || toISODate(momento) !== fecha) return;

      eventos.push({
        id: `${reserva.id}-${i}`,
        momento: momento.getTime(),
        hora: formatTime(momento),
        tipo: evento.tipo,
        accion: ACCIONES[evento.tipo],
        codigo: reserva.codigo,
        estudiante: nombreCompleto(usuario),
        codigoEstudiante: usuario?.codigo ?? '',
        espacio: base.espacios.get(String(reserva.espacioId))?.nombre ?? '',
        bloque: bloque ? `${bloque.horaInicio}–${bloque.horaFin}` : '',
        fechaReserva: formatShortDate(reserva.fecha),
        responsable: evento.actor ?? '',
        detalle: detalleDeEvento(evento, reserva, bloque, momento),
      });
    });
  });

  (base.db.bloqueos ?? []).forEach((bloqueo) => {
    if (!enSede(bloqueo.espacioId) || !bloqueo.creadoEn) return;
    const momento = new Date(bloqueo.creadoEn);
    if (Number.isNaN(momento.getTime()) || toISODate(momento) !== fecha) return;

    const horas = (bloqueo.bloqueIds ?? [])
      .map((id) => base.bloques.get(String(id))?.horaInicio)
      .filter(Boolean)
      .sort();
    const rango =
      bloqueo.desde === bloqueo.hasta
        ? formatShortDate(bloqueo.desde)
        : `${formatShortDate(bloqueo.desde)}–${formatShortDate(bloqueo.hasta)}`;
    const canceladas = bloqueo.reservasCanceladas ?? 0;

    eventos.push({
      id: bloqueo.id,
      momento: momento.getTime(),
      hora: formatTime(momento),
      tipo: 'bloqueo',
      accion: ACCIONES.bloqueo,
      codigo: '',
      estudiante: '',
      codigoEstudiante: '',
      espacio: base.espacios.get(String(bloqueo.espacioId))?.nombre ?? '',
      bloque: horas.length ? horas.join(' · ') : 'Todo el día',
      fechaReserva: rango,
      responsable: nombreCompleto(base.usuarios.get(String(bloqueo.creadoPor))),
      detalle: `${etiquetaTipoBloqueo(bloqueo.tipo)}: ${bloqueo.motivo}${
        canceladas ? ` · ${canceladas} ${canceladas === 1 ? 'reserva cancelada' : 'reservas canceladas'}` : ''
      }`,
    });
  });

  return eventos.sort((a, b) => a.momento - b.momento);
}
