// HU-5 · Operación diaria del encargado: bandeja, llegada, inasistencia, cancelación,
// búsqueda e historial del día. Mismas reglas que frontend/src/services/operationService.js,
// operationLog.js y utils/reglasOperacion.js, ahora del lado del servidor.
import repository from '../repositories/operacion.repository.js'
import bloqueosRepository from '../repositories/bloqueos.repository.js'
import { crearError } from '../utils/errores.js'
import { exigirEncargado } from '../utils/permisos.js'
import { estadoTolerancia, TOLERANCIA_MIN } from '../utils/tolerancia.js'
import {
  conHora, esFechaISO, fechaHora, formatoCorto, formatoHora, hoyISO, rangoDelDia
} from '../utils/fechas.js'

/* ------------------------------ Reglas ------------------------------------ */

const ESTADOS = ['confirmada', 'atendida', 'inasistencia', 'cancelada'];

/** Motivos de cancelación del encargado (mockup 5.6). */
const MOTIVOS_CANCELACION = {
  mantenimiento_correctivo: 'Mantenimiento correctivo',
  corte_energia: 'Corte programado de energía',
  uso_academico: 'Uso académico prioritario',
  incidencia: 'Incidencia reportada',
  otro: 'Otro'
};
const DETALLE_MAX = 300;
const DETALLE_MIN_OTRO = 10;

const MIN_CARACTERES_BUSQUEDA = 2;
const MAX_RESULTADOS = 100;

function validarCancelacion({ motivo, detalle }) {
  const errores = {};
  const texto = String(detalle ?? '').trim();
  if (!MOTIVOS_CANCELACION[motivo]) errores.motivo = 'Selecciona el motivo de la cancelación.';
  if (texto.length > DETALLE_MAX) errores.detalle = `Máximo ${DETALLE_MAX} caracteres.`;
  else if (motivo === 'otro' && texto.length < DETALLE_MIN_OTRO) {
    errores.detalle = `Si el motivo es "Otro", explica el detalle (mínimo ${DETALLE_MIN_OTRO} caracteres).`;
  }
  return errores;
}

/** Quita tildes y pasa a minúsculas: "Ñahui" ≈ "nahui", "Lucía" ≈ "lucia". */
const normalizar = (texto) =>
  String(texto ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

const nombreCompleto = (usuario) =>
  [usuario?.nombres, usuario?.apellidos].filter(Boolean).join(' ') || 'Usuario';

/** Hora actual, o la simulada con { hora: '10:05' } para probar (ver conHora). */
const momentoActual = (hora) => conHora(new Date(), hora);

/* ------------------------------ Vistas ------------------------------------ */
/* Arman el mismo JSON que hoy reciben los componentes (aVistaReserva de operationCommon.js). */

function aVistaReserva(reserva, inasistencias) {
  const historial = [...(reserva.historial ?? [])].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  const ultimo = (tipo) => [...historial].reverse().find((e) => e.tipo === tipo) ?? null;
  const eventoLlegada = ultimo('llegada_registrada');
  const eventoInasistencia = ultimo('inasistencia_marcada');

  return {
    id: reserva.id,
    codigo: reserva.codigo,
    fecha: reserva.fecha,
    horaInicio: reserva.bloqueHorario?.horaInicio ?? '--:--',
    horaFin: reserva.bloqueHorario?.horaFin ?? '--:--',
    estado: reserva.estado,
    motivo: reserva.motivo ?? '',
    asistentes: reserva.asistentes ?? 0,
    invitados: (reserva.invitados ?? []).map((i) => i.nombre).filter(Boolean),
    llegada: reserva.llegadaRegistradaEn ? formatoHora(new Date(reserva.llegadaRegistradaEn)) : null,
    inasistenciaMarcada: eventoInasistencia ? formatoHora(new Date(eventoInasistencia.fecha)) : null,
    operadaPor: (eventoLlegada ?? eventoInasistencia)?.actor ?? null,
    cancelacion: reserva.canceladaEn
      ? { porRol: reserva.canceladaPorRol ?? 'estudiante', motivo: reserva.motivoCancelacion ?? null }
      : null,
    espacio: { id: reserva.espacio?.id, nombre: reserva.espacio?.nombre ?? 'Espacio' },
    estudiante: {
      id: reserva.usuario?.id,
      nombreCompleto: nombreCompleto(reserva.usuario),
      codigo: reserva.usuario?.codigo ?? null,
      correo: reserva.usuario?.correo ?? '',
      inasistencias: inasistencias.get(reserva.usuarioId) ?? 0
    }
  };
}

/** Map { usuarioId → inasistencias } de los estudiantes de esas reservas. */
async function contarInasistencias(reservas) {
  const ids = [...new Set(reservas.map((r) => r.usuarioId))];
  const conteo = await repository.contarInasistencias(ids);
  if (!conteo) throw crearError(500, 'No se pudieron contar las inasistencias.');
  return new Map(conteo.map((fila) => [fila.usuarioId, Number(fila.count)]));
}

/* ------------------------------ Historial del día -------------------------- */

const ACCIONES = {
  llegada_registrada: 'Llegada registrada',
  inasistencia_marcada: 'Inasistencia marcada',
  cancelada: 'Reserva cancelada',
  bloqueo: 'Bloqueo creado'
};

function detalleDeEvento(evento, reserva, momento) {
  const bloque = reserva.bloqueHorario;
  if (evento.tipo === 'llegada_registrada' && bloque) {
    const tarde = Math.round((momento - fechaHora(reserva.fecha, bloque.horaInicio)) / 60000);
    return tarde >= TOLERANCIA_MIN ? `Llegada tardía (+${tarde} min)` : 'Dentro de la tolerancia';
  }
  if (evento.tipo === 'inasistencia_marcada') return 'Sin llegada pasada la tolerancia';
  if (evento.tipo === 'cancelada') {
    const quien = reserva.canceladaPorRol === 'encargado' ? 'Por el encargado' : 'Por el estudiante';
    const extra = reserva.cancelacionTardia ? 'cancelación tardía (suma inasistencia)' : reserva.motivoCancelacion;
    return extra ? `${quien}: ${extra}` : quien;
  }
  return '';
}

/**
 * Lo que se OPERÓ ese día en la sede (cuenta el día de la acción, no el de la reserva),
 * con la misma forma que construirHistorialDelDia del frontend (es lo que se exporta).
 */
async function historialDelDia({ sedeId, fecha }) {
  const [desde, hasta] = rangoDelDia(fecha);
  const eventos = await repository.findEventosOperados({ sedeId, desde, hasta });
  const bloqueos = await repository.findBloqueosCreados({ sedeId, desde, hasta });
  if (!eventos || !bloqueos) throw crearError(500, 'No se pudo armar el historial del día.');

  const filas = eventos.map((evento) => {
    const reserva = evento.reserva;
    const momento = new Date(evento.fecha);
    const bloque = reserva.bloqueHorario;
    return {
      id: `evt-${evento.id}`,
      momento: momento.getTime(),
      hora: formatoHora(momento),
      tipo: evento.tipo,
      accion: ACCIONES[evento.tipo],
      codigo: reserva.codigo,
      estudiante: nombreCompleto(reserva.usuario),
      codigoEstudiante: reserva.usuario?.codigo ?? '',
      espacio: reserva.espacio?.nombre ?? '',
      bloque: bloque ? `${bloque.horaInicio}–${bloque.horaFin}` : '',
      fechaReserva: formatoCorto(reserva.fecha),
      responsable: evento.actor ?? '',
      detalle: detalleDeEvento(evento, reserva, momento)
    };
  });

  const canceladas = await bloqueosRepository.contarCanceladas(bloqueos.map((b) => b.id));
  const porBloqueo = new Map((canceladas ?? []).map((fila) => [fila.bloqueoId, Number(fila.count)]));

  bloqueos.forEach((bloqueo) => {
    const momento = new Date(bloqueo.createdAt);
    const horas = (bloqueo.bloques ?? []).map((f) => f.bloqueHorario?.horaInicio).filter(Boolean).sort();
    const total = porBloqueo.get(bloqueo.id) ?? 0;
    filas.push({
      id: `blq-${bloqueo.id}`,
      momento: momento.getTime(),
      hora: formatoHora(momento),
      tipo: 'bloqueo',
      accion: ACCIONES.bloqueo,
      codigo: '',
      estudiante: '',
      codigoEstudiante: '',
      espacio: bloqueo.espacio?.nombre ?? '',
      bloque: horas.length ? horas.join(' · ') : 'Todo el día',
      fechaReserva: bloqueo.desde === bloqueo.hasta
        ? formatoCorto(bloqueo.desde)
        : `${formatoCorto(bloqueo.desde)}–${formatoCorto(bloqueo.hasta)}`,
      responsable: nombreCompleto(bloqueo.creadoPor),
      detalle: `${bloqueo.tipo === 'evento' ? 'Evento institucional' : 'Mantenimiento'}: ${bloqueo.motivo}${
        total ? ` · ${total} ${total === 1 ? 'reserva cancelada' : 'reservas canceladas'}` : ''}`
    });
  });

  return filas.sort((a, b) => a.momento - b.momento);
}

/* ------------------------------ Ayudas de escritura ------------------------ */

/** Verifica que el encargado pueda operar la reserva: existe, es de su sede y sigue confirmada. */
async function reservaOperable(reservaId, encargadoId) {
  const encargado = await exigirEncargado(encargadoId, 'Solo un encargado puede operar reservas.');

  const reserva = await repository.findConDetalle(reservaId);
  if (!reserva) throw crearError(404, 'La reserva no existe.', { code: 'NO_ENCONTRADA' });

  if (encargado.sedeAsignadaId && reserva.espacio?.sedeId !== encargado.sedeAsignadaId) {
    throw crearError(403, 'Esta reserva no pertenece a tu sede.', { code: 'SIN_PERMISO' });
  }
  if (reserva.estado !== 'confirmada') {
    throw crearError(409, 'La reserva ya no está confirmada. Actualiza la bandeja.', { code: 'ESTADO_INVALIDO' });
  }
  if (!reserva.bloqueHorario) throw crearError(500, 'El bloque de la reserva no existe.');

  return { reserva, encargado };
}

async function guardar(reserva, cambios, tipoEvento, encargado, ahora) {
  const filas = await repository.operar({
    reservaId: reserva.id,
    cambios,
    evento: { tipo: tipoEvento, fecha: ahora, actor: nombreCompleto(encargado) }
  });
  if (filas === null) throw crearError(500, 'No se pudo guardar el cambio.');
  if (filas === 0) {
    throw crearError(409, 'La reserva ya no está confirmada. Actualiza la bandeja.', { code: 'ESTADO_INVALIDO' });
  }
}

/* ------------------------------ Casos de uso ------------------------------ */

/** GET /operacion/bandeja?sedeId=1&fecha=2026-11-25 */
const obtenerBandeja = async ({ sedeId, fecha }) => {
  if (!esFechaISO(fecha)) {
    throw crearError(400, 'Indica la fecha (YYYY-MM-DD).', { code: 'VALIDACION', campos: { fecha: 'Fecha inválida.' } });
  }
  const idSede = sedeId ? Number(sedeId) : null;

  const reservas = await repository.findDelDia({ sedeId: idSede, fecha });
  if (!reservas) throw crearError(500, 'No se pudo leer la bandeja.');
  const inasistencias = await contarInasistencias(reservas);

  const vistas = reservas
    .map((r) => aVistaReserva(r, inasistencias))
    .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));

  const contadores = { total: vistas.length, confirmadas: 0, atendidas: 0, inasistencias: 0, canceladas: 0 };
  const clave = { confirmada: 'confirmadas', atendida: 'atendidas', inasistencia: 'inasistencias', cancelada: 'canceladas' };
  vistas.forEach((v) => { if (clave[v.estado]) contadores[clave[v.estado]] += 1; });

  // Un grupo por espacio que tenga reservas, en el orden del catálogo (id).
  const grupos = new Map();
  reservas
    .map((r) => r.espacio)
    .sort((a, b) => a.id - b.id)
    .forEach((e) => {
      if (!grupos.has(e.id)) grupos.set(e.id, { espacio: { id: e.id, nombre: e.nombre, ubicacion: e.ubicacion ?? '' }, reservas: [] });
    });
  vistas.forEach((v) => grupos.get(v.espacio.id)?.reservas.push(v));

  return { contadores, grupos: [...grupos.values()], historial: await historialDelDia({ sedeId: idSede, fecha }) };
};

/** PUT /operacion/reservas/:id/llegada   body: { encargadoId, hora? } */
const registrarLlegada = async (reservaId, { encargadoId, hora }) => {
  const ahora = momentoActual(hora);
  const { reserva, encargado } = await reservaOperable(reservaId, encargadoId);

  if (reserva.fecha !== hoyISO(ahora)) {
    throw crearError(400, 'Solo puedes registrar llegadas de la jornada de hoy.', { code: 'FUERA_DE_JORNADA' });
  }
  const tolerancia = estadoTolerancia({
    fecha: reserva.fecha,
    horaInicio: reserva.bloqueHorario.horaInicio,
    horaFin: reserva.bloqueHorario.horaFin
  }, ahora);
  if (!tolerancia.puedeRegistrarLlegada) {
    if (tolerancia.termino) {
      throw crearError(400, 'El bloque ya terminó: ya no se puede registrar la llegada.', { code: 'BLOQUE_TERMINADO' });
    }
    throw crearError(400, `Aún es temprano: podrás registrar la llegada desde las ${tolerancia.desdeLlegada}.`, { code: 'MUY_TEMPRANO' });
  }

  await guardar(reserva, { estado: 'atendida', llegadaRegistradaEn: ahora }, 'llegada_registrada', encargado, ahora);
  return { codigo: reserva.codigo, hora: formatoHora(ahora), tardia: tolerancia.llegadaTardia };
};

/** PUT /operacion/reservas/:id/inasistencia   body: { encargadoId, hora? } */
const marcarInasistencia = async (reservaId, { encargadoId, hora }) => {
  const ahora = momentoActual(hora);
  const { reserva, encargado } = await reservaOperable(reservaId, encargadoId);

  const tolerancia = estadoTolerancia({
    fecha: reserva.fecha,
    horaInicio: reserva.bloqueHorario.horaInicio,
    horaFin: reserva.bloqueHorario.horaFin
  }, ahora);
  if (!tolerancia.puedeMarcarInasistencia) {
    throw crearError(400, `Todavía no vence la tolerancia: podrás marcar la inasistencia a las ${tolerancia.limiteTolerancia}.`, { code: 'TOLERANCIA_VIGENTE' });
  }

  await guardar(reserva, { estado: 'inasistencia' }, 'inasistencia_marcada', encargado, ahora);
  return { codigo: reserva.codigo, estudiante: nombreCompleto(reserva.usuario) };
};

/**
 * PUT /operacion/reservas/:id/cancelar   body: { encargadoId, motivo, detalle?, hora? }
 * motivo = código ('corte_energia', 'otro'…). No genera inasistencia.
 */
const cancelarPorEncargado = async (reservaId, { encargadoId, motivo, detalle = '', hora }) => {
  const campos = validarCancelacion({ motivo, detalle });
  if (Object.keys(campos).length > 0) {
    throw crearError(400, 'Revisa los campos marcados.', { code: 'VALIDACION', campos });
  }

  const ahora = momentoActual(hora);
  const { reserva, encargado } = await reservaOperable(reservaId, encargadoId);

  if (ahora >= fechaHora(reserva.fecha, reserva.bloqueHorario.horaFin)) {
    throw crearError(400, 'El bloque ya terminó: esta reserva ya no se puede cancelar.', { code: 'NO_CANCELABLE' });
  }

  const textoDetalle = String(detalle ?? '').trim();
  const etiqueta = MOTIVOS_CANCELACION[motivo];
  await guardar(reserva, {
    estado: 'cancelada',
    canceladaEn: ahora,
    canceladaPorId: encargado.id,
    canceladaPorRol: 'encargado',
    motivoCancelacion: textoDetalle ? `${etiqueta}: ${textoDetalle}` : etiqueta, // lo que ve el estudiante
    motivoCodigo: motivo,
    detalleCancelacion: textoDetalle || null,
    cancelacionTardia: false   // la cancelación del encargado nunca suma inasistencia
  }, 'cancelada', encargado, ahora);

  return { codigo: reserva.codigo, estudiante: nombreCompleto(reserva.usuario) };
};

/**
 * GET /operacion/reservas?sedeId=1&texto=lucia&espacioId=&estado=
 * Busca por código de reserva, nombre, correo o código del estudiante (sin tildes).
 */
const buscarReservas = async ({ sedeId, texto = '', espacioId = '', estado = '' }) => {
  const consulta = normalizar(texto);
  if (consulta && consulta.length < MIN_CARACTERES_BUSQUEDA) {
    const mensaje = `Escribe al menos ${MIN_CARACTERES_BUSQUEDA} caracteres.`;
    throw crearError(400, mensaje, { code: 'VALIDACION', campos: { texto: mensaje } });
  }
  if (estado && !ESTADOS.includes(estado)) {
    throw crearError(400, 'Estado inválido.', { code: 'VALIDACION', campos: { estado: 'Estado inválido.' } });
  }

  const reservas = await repository.buscar({
    sedeId: sedeId ? Number(sedeId) : null,
    espacioId: espacioId ? Number(espacioId) : null,
    estado
  });
  if (!reservas) throw crearError(500, 'No se pudo hacer la búsqueda.');
  const inasistencias = await contarInasistencias(reservas);

  const coincide = (v) =>
    !consulta ||
    [v.codigo, v.estudiante.nombreCompleto, v.estudiante.correo, v.estudiante.codigo]
      .some((campo) => normalizar(campo).includes(consulta));

  const encontradas = reservas
    .map((r) => aVistaReserva(r, inasistencias))
    .filter(coincide)
    .sort((a, b) => `${b.fecha} ${b.horaInicio}`.localeCompare(`${a.fecha} ${a.horaInicio}`));

  return {
    resultados: encontradas.slice(0, MAX_RESULTADOS),
    total: encontradas.length,
    truncado: encontradas.length > MAX_RESULTADOS
  };
};

/** GET /operacion/espacios?sedeId=1 → [{ value, label }] para el filtro "Espacio". */
const espaciosDeSede = async ({ sedeId }) => {
  const espacios = await repository.findEspacios(sedeId ? Number(sedeId) : null);
  if (!espacios) throw crearError(500, 'No se pudieron leer los espacios.');
  return espacios.map((e) => ({ value: e.id, label: e.nombre }));
};

const service = {
  obtenerBandeja, registrarLlegada, marcarInasistencia, cancelarPorEncargado, buscarReservas, espaciosDeSede
};

export default service;
