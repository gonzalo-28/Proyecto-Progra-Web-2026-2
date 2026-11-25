// HU-5 · Reglas de los bloqueos (las mismas de frontend/src/services/blockService.js
// y frontend/src/utils/reglasOperacion.js, ahora del lado del servidor).
// El controlador solo recibe y responde; aquí se valida y se decide.
import repository from '../repositories/bloqueos.repository.js'
import RepositoryBase from '../repositories/RepositoryBase.js'
import { Usuario, Espacio, BloqueHorario } from '../models/relaciones.js'
import { crearError } from '../utils/errores.js'
import { hoyISO, esFechaISO, contarDias, fechaHora } from '../utils/fechas.js'

// Para buscar por id basta el CRUD genérico del profesor
const usuarios = new RepositoryBase(Usuario);
const espacios = new RepositoryBase(Espacio);
const bloquesHorarios = new RepositoryBase(BloqueHorario);

/* ------------------------------ Reglas ------------------------------------ */

const TIPOS = ['mantenimiento', 'evento'];
const ALCANCE = { todoElDia: 'dia', rango: 'rango' };
const MAX_DIAS = 31;
const MOTIVO_MIN = 10;
const MOTIVO_MAX = 300;

/** Errores por campo (vacío si todo está bien). Igual que validarBloqueo del frontend. */
function validar({ tipo, espacioId, desde, hasta, alcance, bloqueIds, motivo }, hoy) {
  const errores = {};
  const texto = String(motivo ?? '').trim();

  if (!TIPOS.includes(tipo)) errores.tipo = 'Elige el tipo de bloqueo.';
  if (!espacioId) errores.espacioId = 'Selecciona el espacio.';

  if (!esFechaISO(desde)) errores.desde = 'Ingresa la fecha de inicio.';
  else if (desde < hoy) errores.desde = 'No se puede bloquear una fecha pasada.';

  if (!esFechaISO(hasta)) errores.hasta = 'Ingresa la fecha de fin.';
  else if (!errores.desde && hasta < desde) errores.hasta = 'Debe ser igual o posterior a "Desde".';
  else if (!errores.desde && contarDias(desde, hasta) > MAX_DIAS) {
    errores.hasta = `Un bloqueo puede cubrir como máximo ${MAX_DIAS} días.`;
  }

  if (alcance === ALCANCE.rango && bloqueIds.length === 0) {
    errores.bloqueIds = 'Elige al menos un bloque horario.';
  }

  if (texto.length < MOTIVO_MIN) errores.motivo = `Describe el motivo (mínimo ${MOTIVO_MIN} caracteres).`;
  else if (texto.length > MOTIVO_MAX) errores.motivo = `Máximo ${MOTIVO_MAX} caracteres.`;

  return errores;
}

/** [3, 4] o "3,4" (query string) → [3, 4] */
const aListaIds = (valor) => {
  const lista = Array.isArray(valor) ? valor : String(valor ?? '').split(',');
  return lista.map(Number).filter((n) => Number.isInteger(n) && n > 0);
};

/* ------------------------------ Vistas ------------------------------------ */
/* Arman el JSON que recibe el frontend (sin los objetos de Sequelize). */

function aVistaBloqueo(bloqueo, canceladas = 0) {
  const bloques = (bloqueo.bloques ?? [])
    .map((fila) => fila.bloqueHorario)
    .filter(Boolean)
    .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));

  return {
    id: bloqueo.id,
    tipo: bloqueo.tipo,
    espacioId: bloqueo.espacioId,
    espacio: bloqueo.espacio
      ? { id: bloqueo.espacio.id, codigo: bloqueo.espacio.codigo, nombre: bloqueo.espacio.nombre }
      : null,
    desde: bloqueo.desde,
    hasta: bloqueo.hasta,
    motivo: bloqueo.motivo,
    todoElDia: bloques.length === 0,
    bloqueIds: bloques.map((b) => b.id),
    bloques: bloques.map((b) => ({ id: b.id, horaInicio: b.horaInicio, horaFin: b.horaFin })),
    creadoPorId: bloqueo.creadoPorId,
    creadoEn: bloqueo.createdAt,
    canceladas
  };
}

const aVistaAfectada = (reserva) => ({
  id: reserva.id,
  codigo: reserva.codigo,
  fecha: reserva.fecha,
  horaInicio: reserva.bloqueHorario.horaInicio,
  horaFin: reserva.bloqueHorario.horaFin,
  estado: reserva.estado,
  motivo: reserva.motivo,
  asistentes: reserva.asistentes,
  estudiante: {
    id: reserva.usuario?.id,
    nombreCompleto: [reserva.usuario?.nombres, reserva.usuario?.apellidos].filter(Boolean).join(' '),
    codigo: reserva.usuario?.codigo ?? null,
    correo: reserva.usuario?.correo ?? ''
  }
});

/* ------------------------------ Ayudas ------------------------------------ */

/** Reservas confirmadas que el bloqueo cancelaría y cuyo bloque todavía no terminó. */
async function buscarAfectadas({ espacioId, desde, hasta, bloqueIds }, ahora) {
  const reservas = await repository.findReservasEnRango({ espacioId, desde, hasta, bloqueIds });
  if (!reservas) throw crearError(500, 'No se pudieron leer las reservas.');
  return reservas.filter(
    (r) => r.bloqueHorario && fechaHora(r.fecha, r.bloqueHorario.horaFin) > ahora
  );
}

async function exigirEncargado(encargadoId) {
  const encargado = encargadoId ? await usuarios.findOne(encargadoId) : null;
  if (!encargado || encargado.rol !== 'encargado') {
    throw crearError(403, 'Solo un encargado puede gestionar bloqueos.', { code: 'SIN_PERMISO' });
  }
  return encargado;
}

async function contarPorBloqueo(bloqueos) {
  const conteo = await repository.contarCanceladas(bloqueos.map((b) => b.id));
  return new Map((conteo ?? []).map((fila) => [fila.bloqueoId, Number(fila.count)]));
}

/* ------------------------------ Casos de uso ------------------------------ */

/** GET /bloqueos?sedeId=1 → bloqueos vigentes (terminan hoy o después). */
const listarVigentes = async ({ sedeId }) => {
  const bloqueos = await repository.findVigentes({ sedeId: sedeId ? Number(sedeId) : null, hoy: hoyISO() });
  if (!bloqueos) throw crearError(500, 'No se pudieron leer los bloqueos.');
  const canceladas = await contarPorBloqueo(bloqueos);
  return bloqueos.map((b) => aVistaBloqueo(b, canceladas.get(b.id) ?? 0));
};

/** GET /bloqueos/:id */
const obtener = async (id) => {
  const bloqueo = await repository.findOne(id);
  if (!bloqueo) throw crearError(404, 'El bloqueo no existe.', { code: 'NO_ENCONTRADO' });
  const canceladas = await contarPorBloqueo([bloqueo]);
  return aVistaBloqueo(bloqueo, canceladas.get(bloqueo.id) ?? 0);
};

/**
 * GET /bloqueos/preview?espacioId=3&desde=…&hasta=…&bloqueIds=4,5
 * Reservas que se cancelarían (mockup 5.4, columna derecha). Mientras el formulario
 * está incompleto devuelve una lista vacía en vez de un error.
 */
const previsualizar = async ({ espacioId, desde, hasta, bloqueIds }) => {
  if (!espacioId || !esFechaISO(desde) || !esFechaISO(hasta) || hasta < desde) {
    return { afectadas: [] };
  }
  const afectadas = await buscarAfectadas(
    { espacioId: Number(espacioId), desde, hasta, bloqueIds: aListaIds(bloqueIds) },
    new Date()
  );
  return { afectadas: afectadas.map(aVistaAfectada) };
};

/**
 * POST /bloqueos
 * body: { encargadoId, tipo, espacioId, desde, hasta, alcance: 'dia' | 'rango', bloqueIds, motivo }
 * Crea el bloqueo y cancela las reservas confirmadas que caen dentro.
 */
const crear = async (body) => {
  const ahora = new Date();
  const { encargadoId, tipo, espacioId, desde, hasta, alcance, motivo } = body;
  const bloqueIds = alcance === ALCANCE.rango ? aListaIds(body.bloqueIds) : [];

  const campos = validar({ tipo, espacioId, desde, hasta, alcance, bloqueIds, motivo }, hoyISO(ahora));
  if (Object.keys(campos).length > 0) {
    throw crearError(400, 'Revisa los campos marcados.', { code: 'VALIDACION', campos });
  }

  const encargado = await exigirEncargado(encargadoId);

  const espacio = await espacios.findOne(espacioId);
  if (!espacio) throw crearError(404, 'El espacio no existe.', { code: 'NO_ENCONTRADO' });
  if (encargado.sedeAsignadaId && espacio.sedeId !== encargado.sedeAsignadaId) {
    throw crearError(403, 'Ese espacio no pertenece a tu sede.', { code: 'SIN_PERMISO' });
  }

  if (bloqueIds.length > 0) {
    const todos = await bloquesHorarios.findAll();
    const validos = new Set((todos ?? []).map((b) => b.id));
    if (bloqueIds.some((id) => !validos.has(id))) {
      throw crearError(400, 'Hay bloques horarios que no existen.', {
        code: 'VALIDACION',
        campos: { bloqueIds: 'Elige bloques horarios válidos.' }
      });
    }
  }

  // No se permiten dos bloqueos que cubran el mismo espacio, día y bloque.
  const cruces = await repository.findCruces({ espacioId: espacio.id, desde, hasta });
  if (!cruces) throw crearError(500, 'No se pudieron revisar los bloqueos existentes.');
  const choca = cruces.some((b) => {
    const ids = b.bloques.map((fila) => fila.bloqueId);
    return ids.length === 0 || bloqueIds.length === 0 || ids.some((id) => bloqueIds.includes(id));
  });
  if (choca) {
    throw crearError(409, 'Ya existe un bloqueo para ese espacio que se cruza con estas fechas y bloques.', {
      code: 'BLOQUEO_DUPLICADO'
    });
  }

  const motivoTexto = String(motivo).trim();
  const afectadas = await buscarAfectadas({ espacioId: espacio.id, desde, hasta, bloqueIds }, ahora);

  const bloqueo = await repository.crearYCancelar({
    datos: { tipo, espacioId: espacio.id, desde, hasta, motivo: motivoTexto, creadoPorId: encargado.id },
    bloqueIds,
    reservaIds: afectadas.map((r) => r.id),
    actor: `${encargado.nombres} ${encargado.apellidos}`,
    motivoVisible: `${tipo === 'evento' ? 'Evento institucional' : 'Bloqueo por mantenimiento'}: ${motivoTexto}`,
    ahora
  });
  if (!bloqueo) throw crearError(500, 'No se pudo registrar el bloqueo.');

  return { bloqueo: aVistaBloqueo(bloqueo, afectadas.length), canceladas: afectadas.length };
};

/**
 * DELETE /bloqueos/:id?encargadoId=2
 * Los bloques vuelven a estar libres. Las reservas ya canceladas NO se reactivan
 * (el estudiante ya fue avisado).
 */
const eliminar = async (id, { encargadoId }) => {
  const encargado = await exigirEncargado(encargadoId);
  const bloqueo = await repository.findOne(id);
  if (!bloqueo) throw crearError(404, 'El bloqueo ya no existe.', { code: 'NO_ENCONTRADO' });
  if (encargado.sedeAsignadaId && bloqueo.espacio?.sedeId !== encargado.sedeAsignadaId) {
    throw crearError(403, 'Ese bloqueo no pertenece a tu sede.', { code: 'SIN_PERMISO' });
  }
  const respuesta = await repository.remove(bloqueo.id);
  if (respuesta === null) throw crearError(500, 'No se pudo eliminar el bloqueo.');
  return { eliminado: bloqueo.id };
};

const service = { listarVigentes, obtener, previsualizar, crear, eliminar };

export default service;
