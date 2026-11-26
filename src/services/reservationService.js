// src/services/reservationService.js
//
// Servicio de reservas (HU-4). Es la ÚNICA capa que lee y escribe reservas;
// los componentes solo llaman a estas funciones. En la Entrega 2 el cuerpo se
// reemplaza por llamadas a la API (y estas mismas validaciones se repiten en
// Express) manteniendo las firmas.
//
// Errores: igual que authService, se rechaza con un Error que trae
//   - message: texto listo para mostrar
//   - code:    'VALIDACION' | 'TOPE_EXCEDIDO' | 'SOLAPAMIENTO' | 'BLOQUE_OCUPADO'
//              | 'AFORO_EXCEDIDO' | 'USUARIO_BLOQUEADO' | 'ESPACIO_NO_DISPONIBLE'
//              | 'BLOQUE_PASADO' | 'NO_ENCONTRADA' | 'NO_CANCELABLE' | 'SIN_PERMISO'
//   - campos:  { campo: mensaje } cuando es un error de formulario
//   - detalle: datos extra para el modal (p. ej. la reserva con la que se solapa)

import { getStoredData, guardarOFallar } from './storageService';
import { isBlank, isInstitutionalEmail } from '../utils/validators';
import {
    DIAS_BLOQUEO_POR_INASISTENCIAS,
    ESTADOS_QUE_OCUPAN,
    ESTADOS_RESERVA,
    HORAS_CANCELACION_SIN_PENALIDAD,
    MOTIVO_MAX_CARACTERES,
    MOTIVO_MIN_CARACTERES,
    TOPE_HORAS_SEMANALES,
    UMBRAL_INASISTENCIAS,
} from '../utils/reglas';

/* ------------------------------ Configuración ----------------------------- */

const NETWORK_LATENCY_MS = 400;
const MS_HORA = 60 * 60 * 1000;
const MS_DIA = 24 * MS_HORA;

/* Reloj inyectable: en la app es la hora real; en pruebas o demos se puede
   fijar con configurarReloj(() => new Date('2026-09-14T09:00:00')). */
let reloj = () => new Date();
export const configurarReloj = (fn) => {
    reloj = typeof fn === 'function' ? fn : () => new Date();
};

/* -------------------------------- Utilidades ------------------------------ */

const simularLatencia = (ms = NETWORK_LATENCY_MS) =>
    new Promise((resolve) => setTimeout(resolve, ms));

const crearError = (message, extra = {}) => Object.assign(new Error(message), extra);

const pad2 = (n) => String(n).padStart(2, '0');

/** 'YYYY-MM-DD' local (no UTC). */
const aISO = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

/** 'YYYY-MM-DD' + 'HH:mm' → Date local. */
const aFecha = (fechaISO, hora = '00:00') => {
    const [y, m, d] = fechaISO.split('-').map(Number);
    const [hh, mm] = hora.split(':').map(Number);
    return new Date(y, m - 1, d, hh, mm);
};

/** 'YYYY-MM-DD' → 'DD/MM/YYYY' */
export const formatearFecha = (fechaISO) => {
    const [y, m, d] = fechaISO.split('-');
    return `${d}/${m}/${y}`;
};

/** Lunes y sábado de la semana de reservas de una fecha. */
const rangoSemana = (fechaISO) => {
    const base = aFecha(fechaISO);
    const lunes = new Date(base.getFullYear(), base.getMonth(), base.getDate() - ((base.getDay() + 6) % 7));
    const sabado = new Date(lunes.getFullYear(), lunes.getMonth(), lunes.getDate() + 5);
    return { desde: aISO(lunes), hasta: aISO(sabado) };
};

const minutosEntre = (inicio, fin) => {
    const [h1, m1] = inicio.split(':').map(Number);
    const [h2, m2] = fin.split(':').map(Number);
    return h2 * 60 + m2 - (h1 * 60 + m1);
};

const nombreCompleto = (u) => (u ? `${u.nombres} ${u.apellidos}`.trim() : 'Usuario');

/* ---------------------------- Acceso a la base ---------------------------- */

const leerBase = () => {
    const db = getStoredData();
    return {
        db,
        reservas: db.reservas ?? [],
        espacios: db.espacios ?? [],
        bloques: db.bloquesHorarios ?? [],
        usuarios: db.usuarios ?? [],
        bloqueos: db.bloqueos ?? [], // HU-5 (bloqueos por mantenimiento), si existen
    };
};

const guardarReservas = (reservas) => {
    guardarOFallar({ ...getStoredData(), reservas }); // lanza ERROR_GUARDADO si el navegador no guarda
};

/* ------------------------------ Enriquecimiento --------------------------- */

/** Inicio y fin (Date) de una reserva según su bloque. */
const tiemposDe = (reserva, bloques) => {
    const bloque = bloques.find((b) => b.id === reserva.bloqueId);
    if (!bloque) return { inicio: aFecha(reserva.fecha), fin: aFecha(reserva.fecha), bloque: null };
    return {
        bloque,
        inicio: aFecha(reserva.fecha, bloque.horaInicio),
        fin: aFecha(reserva.fecha, bloque.horaFin),
    };
};

/**
 * Estado que se MUESTRA: una reserva confirmada cuyo bloque está ocurriendo se
 * ve como "en curso". En la base sigue siendo 'confirmada' (HU-5 la cambia).
 */
const estadoVisible = (reserva, inicio, fin, ahora) => {
    if (reserva.estado === ESTADOS_RESERVA.confirmada && ahora >= inicio && ahora < fin) {
        return ESTADOS_RESERVA.enCurso;
    }
    return reserva.estado;
};

/**
 * Reserva lista para la interfaz: agrega espacio, bloque, horas, estado
 * visible, si es próxima o histórica y si se puede cancelar.
 */
const enriquecer = (reserva, base, ahora = reloj()) => {
    const { inicio, fin, bloque } = tiemposDe(reserva, base.bloques);
    const espacio = base.espacios.find((e) => e.id === reserva.espacioId) ?? null;
    const visible = estadoVisible(reserva, inicio, fin, ahora);
    const esHistorica =
        fin <= ahora ||
        [ESTADOS_RESERVA.atendida, ESTADOS_RESERVA.inasistencia, ESTADOS_RESERVA.cancelada].includes(
            reserva.estado
        );
    const limiteSinPenalidad = new Date(inicio.getTime() - HORAS_CANCELACION_SIN_PENALIDAD * MS_HORA);

    return {
        ...reserva,
        espacio: espacio && {
            id: espacio.id,
            nombre: espacio.nombre,
            ubicacion: espacio.ubicacion,
            capacidad: espacio.capacidad,
            tipo: espacio.tipo,
        },
        horaInicio: bloque?.horaInicio ?? '',
        horaFin: bloque?.horaFin ?? '',
        fechaTexto: formatearFecha(reserva.fecha),
        estadoVisible: visible,
        esHistorica,
        puedeCancelar: reserva.estado === ESTADOS_RESERVA.confirmada && ahora < inicio,
        cancelacionSinPenalidadHasta: limiteSinPenalidad.toISOString(),
        cancelacionGeneraInasistencia: ahora >= limiteSinPenalidad,
    };
};

/* ------------------------------- Inasistencias ---------------------------- */

/** Inasistencias del usuario: marcadas por el encargado + cancelaciones tardías. */
const calcularInasistencias = (usuarioId, reservas, ahora = reloj()) => {
    const fechas = reservas
        .filter((r) => r.usuarioId === usuarioId)
        .filter(
            (r) =>
                r.estado === ESTADOS_RESERVA.inasistencia ||
                (r.estado === ESTADOS_RESERVA.cancelada && r.cancelacion?.tardia)
        )
        .map((r) => aFecha(r.fecha))
        .sort((a, b) => a - b);

    let bloqueadoHasta = null;
    if (fechas.length >= UMBRAL_INASISTENCIAS) {
        const ultima = fechas[fechas.length - 1];
        const fin = new Date(ultima.getTime() + DIAS_BLOQUEO_POR_INASISTENCIAS * MS_DIA);
        if (fin > ahora) bloqueadoHasta = aISO(fin);
    }
    return { cantidad: fechas.length, bloqueadoHasta };
};

/* ------------------------------- Uso semanal ------------------------------ */

const horasUsadasEnSemana = (usuarioId, fechaISO, base, excluirId = null) => {
    const { desde, hasta } = rangoSemana(fechaISO);
    return base.reservas
        .filter(
            (r) =>
                r.usuarioId === usuarioId &&
                r.id !== excluirId &&
                ESTADOS_QUE_OCUPAN.includes(r.estado) &&
                r.fecha >= desde &&
                r.fecha <= hasta
        )
        .reduce((total, r) => {
            const bloque = base.bloques.find((b) => b.id === r.bloqueId);
            return total + (bloque ? minutosEntre(bloque.horaInicio, bloque.horaFin) / 60 : 1);
        }, 0);
};

/**
 * Uso de la semana de una fecha (por defecto, la actual).
 * @returns {{ usadas, tope, restantes, desde, hasta, inasistencias, bloqueadoHasta }}
 */
export const obtenerUsoSemanal = async (usuarioId, fechaISO = aISO(reloj())) => {
    const base = leerBase();
    const usadas = horasUsadasEnSemana(usuarioId, fechaISO, base);
    const { desde, hasta } = rangoSemana(fechaISO);
    const { cantidad, bloqueadoHasta } = calcularInasistencias(usuarioId, base.reservas);
    return {
        usadas,
        tope: TOPE_HORAS_SEMANALES,
        restantes: Math.max(TOPE_HORAS_SEMANALES - usadas, 0),
        desde,
        hasta,
        inasistencias: cantidad,
        bloqueadoHasta,
    };
};

/* ------------------------------- Validaciones ----------------------------- */

/**
 * Valida los campos del formulario (motivo, asistentes, invitados).
 * @returns {Object} { campo: mensaje } — vacío si todo está bien
 */
const validarCampos = ({ motivo, asistentes, invitados = [] }, espacio, usuario) => {
    const campos = {};

    const motivoLimpio = String(motivo ?? '').trim();
    if (isBlank(motivoLimpio)) campos.motivo = 'Indica el motivo de la reserva.';
    else if (motivoLimpio.length < MOTIVO_MIN_CARACTERES)
        campos.motivo = `El motivo debe tener al menos ${MOTIVO_MIN_CARACTERES} caracteres.`;
    else if (motivoLimpio.length > MOTIVO_MAX_CARACTERES)
        campos.motivo = `El motivo no puede superar los ${MOTIVO_MAX_CARACTERES} caracteres.`;

    const n = Number(asistentes);
    if (!Number.isInteger(n) || n < 1) campos.asistentes = 'Indica un número de asistentes válido.';
    else if (espacio && n > espacio.capacidad)
        campos.asistentes = `El aforo de este espacio es de ${espacio.capacidad} personas.`;

    const correos = new Set();
    for (const invitado of invitados) {
        const correo = String(invitado?.correo ?? '').trim().toLowerCase();
        if (!isInstitutionalEmail(correo)) {
            campos.invitados = `"${invitado?.correo ?? ''}" no es un correo @ulima.edu.pe válido.`;
            break;
        }
        if (usuario && correo === usuario.correo.toLowerCase()) {
            campos.invitados = 'No necesitas invitarte a ti mismo.';
            break;
        }
        if (correos.has(correo)) {
            campos.invitados = `${correo} está repetido.`;
            break;
        }
        correos.add(correo);
    }
    if (!campos.invitados && !campos.asistentes && invitados.length > n - 1) {
        campos.invitados = `Con ${n} asistente(s) puedes agregar hasta ${n - 1} invitado(s).`;
    }

    return campos;
};

/**
 * Reglas de negocio que no dependen del formulario: se pueden revisar apenas
 * se abre el modal (mockup 4.5: "tope excedido" y "solapamiento" deshabilitan
 * el botón antes de escribir nada).
 * @returns {Error|null} el primer impedimento encontrado
 */
const validarReglas = ({ usuarioId, espacioId, bloqueId, fecha }, base, ahora = reloj()) => {
    const usuario = base.usuarios.find((u) => u.id === usuarioId);
    if (!usuario || usuario.rol !== 'estudiante') {
        return crearError('Solo los estudiantes pueden reservar espacios.', { code: 'SIN_PERMISO' });
    }

    const espacio = base.espacios.find((e) => e.id === espacioId);
    const bloque = base.bloques.find((b) => b.id === bloqueId);
    if (!espacio || !bloque || !/^\d{4}-\d{2}-\d{2}$/.test(String(fecha))) {
        return crearError('El bloque seleccionado no existe.', { code: 'VALIDACION' });
    }

    if (espacio.estado !== 'disponible') {
        return crearError('Este espacio no está disponible para reservas en este momento.', {
            code: 'ESPACIO_NO_DISPONIBLE',
        });
    }

    if (aFecha(fecha, bloque.horaInicio) <= ahora) {
        return crearError('Este bloque ya empezó o ya pasó. Elige uno posterior.', { code: 'BLOQUE_PASADO' });
    }

    const { cantidad, bloqueadoHasta } = calcularInasistencias(usuarioId, base.reservas, ahora);
    if (bloqueadoHasta) {
        return crearError(
            `Tus reservas están bloqueadas hasta el ${formatearFecha(bloqueadoHasta)} por acumular ${cantidad} inasistencias.`,
            { code: 'USUARIO_BLOQUEADO', detalle: { inasistencias: cantidad, bloqueadoHasta } }
        );
    }

    const bloqueado = base.bloqueos.some(
        (b) =>
            b.espacioId === espacioId &&
            fecha >= b.desde &&
            fecha <= b.hasta &&
            (!b.bloqueIds?.length || b.bloqueIds.includes(bloqueId))
    );
    const ocupado = base.reservas.some(
        (r) =>
            r.espacioId === espacioId &&
            r.fecha === fecha &&
            r.bloqueId === bloqueId &&
            ESTADOS_QUE_OCUPAN.includes(r.estado)
    );
    if (bloqueado || ocupado) {
        return crearError('Este bloque ya no está libre. Elige otro bloque.', { code: 'BLOQUE_OCUPADO' });
    }

    // Solapamiento con otra reserva del propio usuario (en cualquier espacio).
    const propia = base.reservas.find((r) => {
        if (r.usuarioId !== usuarioId || r.fecha !== fecha || r.estado !== ESTADOS_RESERVA.confirmada) return false;
        const otro = base.bloques.find((b) => b.id === r.bloqueId);
        return otro && otro.horaInicio < bloque.horaFin && bloque.horaInicio < otro.horaFin;
    });
    if (propia) {
        const otro = enriquecer(propia, base, ahora);
        return crearError(
            `Ya tienes una reserva el ${otro.fechaTexto} de ${otro.horaInicio} a ${otro.horaFin} en ${otro.espacio?.nombre ?? 'otro espacio'} (${otro.codigo}).`,
            { code: 'SOLAPAMIENTO', detalle: { reserva: otro } }
        );
    }

    // Tope semanal.
    const usadas = horasUsadasEnSemana(usuarioId, fecha, base);
    const horasBloque = minutosEntre(bloque.horaInicio, bloque.horaFin) / 60;
    if (usadas + horasBloque > TOPE_HORAS_SEMANALES) {
        const { desde, hasta } = rangoSemana(fecha);
        return crearError(
            `Ya tienes ${usadas} de ${TOPE_HORAS_SEMANALES} horas reservadas del ${formatearFecha(desde).slice(0, 5)} al ${formatearFecha(hasta).slice(0, 5)}. Cancela una reserva o elige la próxima semana.`,
            {
                code: 'TOPE_EXCEDIDO',
                detalle: { usadas, tope: TOPE_HORAS_SEMANALES, restantes: Math.max(TOPE_HORAS_SEMANALES - usadas, 0) },
            }
        );
    }

    return null;
};

/**
 * Pre-chequeo para el modal "Reservar bloque": dice si se puede reservar ese
 * bloque y devuelve el resumen que muestra el modal. No lanza.
 * @returns {{ ok, error: {code, message, detalle}|null, espacio, bloque, fecha, fechaTexto, uso }}
 */
export const prevalidarReserva = async ({ usuarioId, espacioId, bloqueId, fecha }) => {
    const base = leerBase();
    const error = validarReglas({ usuarioId, espacioId, bloqueId, fecha }, base);
    const espacio = base.espacios.find((e) => e.id === espacioId) ?? null;
    const bloque = base.bloques.find((b) => b.id === bloqueId) ?? null;
    return {
        ok: !error,
        error: error && { code: error.code, message: error.message, detalle: error.detalle ?? null },
        espacio,
        bloque,
        fecha,
        fechaTexto: fecha ? formatearFecha(fecha) : '',
        uso: await obtenerUsoSemanal(usuarioId, fecha),
    };
};

/* -------------------------------- Creación -------------------------------- */

const siguienteCodigo = (reservas, anio) => {
    const prefijo = `RSV-${anio}-`;
    const max = reservas
        .map((r) => r.codigo)
        .filter((c) => c?.startsWith(prefijo))
        .map((c) => Number(c.slice(prefijo.length)) || 0)
        .reduce((a, b) => Math.max(a, b), 0);
    return `${prefijo}${String(max + 1).padStart(4, '0')}`;
};

/**
 * Crea una reserva sobre un bloque libre.
 * @param {{ usuarioId, espacioId, bloqueId, fecha, motivo, asistentes, invitados: {nombre?, correo}[] }} datos
 * @returns {Promise<Object>} la reserva enriquecida (para la pantalla de confirmación)
 */
export const crearReserva = async (datos) => {
    await simularLatencia();
    const base = leerBase();
    const ahora = reloj();

    const errorRegla = validarReglas(datos, base, ahora);
    if (errorRegla) throw errorRegla;

    const espacio = base.espacios.find((e) => e.id === datos.espacioId);
    const usuario = base.usuarios.find((u) => u.id === datos.usuarioId);
    const invitados = (datos.invitados ?? []).map((i) => ({
        nombre: String(i.nombre ?? '').trim() || i.correo.split('@')[0],
        correo: String(i.correo).trim().toLowerCase(),
    }));

    const campos = validarCampos({ ...datos, invitados }, espacio, usuario);
    if (Object.keys(campos).length) {
        const esAforo = campos.asistentes?.startsWith('El aforo');
        throw crearError(esAforo ? campos.asistentes : 'Revisa los campos marcados.', {
            code: esAforo ? 'AFORO_EXCEDIDO' : 'VALIDACION',
            campos,
        });
    }

    const marca = ahora.toISOString();
    const historial = [{ tipo: 'creada', fecha: marca, actor: nombreCompleto(usuario) }];
    if (invitados.length) historial.push({ tipo: 'invitados_notificados', fecha: marca, actor: 'Sistema' });
    historial.push({ tipo: 'confirmada', fecha: marca, actor: 'Sistema' }); // "Estado: confirmada" (mockup 4.4)
    const nueva = {
        id: `res_${Date.now()}`,
        codigo: siguienteCodigo(base.reservas, aFecha(datos.fecha).getFullYear()),
        usuarioId: datos.usuarioId,
        espacioId: datos.espacioId,
        bloqueId: datos.bloqueId,
        fecha: datos.fecha,
        motivo: String(datos.motivo).trim(),
        asistentes: Number(datos.asistentes),
        invitados,
        estado: ESTADOS_RESERVA.confirmada,
        creadaEn: marca,
        llegadaRegistradaEn: null,
        cancelacion: null,
        historial,
    };

    guardarReservas([...base.reservas, nueva]);
    return enriquecer(nueva, leerBase(), ahora);
};

/* -------------------------------- Consultas ------------------------------- */

/**
 * "Mis reservas" con filtros. Devuelve las próximas (más cercana primero) y
 * las históricas (más reciente primero).
 * @param {string} usuarioId
 * @param {{ estado?: string, desde?: 'YYYY-MM-DD', hasta?: 'YYYY-MM-DD', texto?: string }} filtros
 *        estado: 'todos' | 'confirmada' | 'en_curso' | 'atendida' | 'inasistencia' | 'cancelada'
 * @returns {Promise<{ proximas: Object[], historicas: Object[], total: number }>}
 */
export const obtenerMisReservas = async (usuarioId, filtros = {}) => {
    await simularLatencia(200);
    const base = leerBase();
    const ahora = reloj();
    const { estado = 'todos', desde, hasta, texto } = filtros;
    const busqueda = String(texto ?? '').trim().toLowerCase();

    const delUsuario = base.reservas.filter((r) => r.usuarioId === usuarioId);
    const lista = delUsuario
        .map((r) => enriquecer(r, base, ahora))
        .filter((r) => estado === 'todos' || !estado || r.estadoVisible === estado)
        .filter((r) => !desde || r.fecha >= desde)
        .filter((r) => !hasta || r.fecha <= hasta)
        .filter(
            (r) =>
                !busqueda ||
                r.codigo.toLowerCase().includes(busqueda) ||
                r.espacio?.nombre.toLowerCase().includes(busqueda)
        );

    const clave = (r) => `${r.fecha} ${r.horaInicio}`;
    const proximas = lista.filter((r) => !r.esHistorica).sort((a, b) => clave(a).localeCompare(clave(b)));
    const historicas = lista.filter((r) => r.esHistorica).sort((a, b) => clave(b).localeCompare(clave(a)));

    return { proximas, historicas, total: lista.length, totalUsuario: delUsuario.length };
};

/**
 * Detalle de una reserva por su código (mockup 4.4). Solo el dueño la ve.
 */
export const obtenerReservaPorCodigo = async (codigo, usuarioId) => {
    await simularLatencia(200);
    const base = leerBase();
    const reserva = base.reservas.find((r) => r.codigo === String(codigo).toUpperCase());
    if (!reserva) throw crearError('No encontramos esa reserva.', { code: 'NO_ENCONTRADA' });
    if (usuarioId && reserva.usuarioId !== usuarioId) {
        throw crearError('No tienes permiso para ver esta reserva.', { code: 'SIN_PERMISO' });
    }
    return enriquecer(reserva, base);
};

/* ------------------------------- Cancelación ------------------------------ */

/**
 * Cancela una reserva del propio usuario. Se puede hasta el inicio del bloque;
 * con menos de 2 h de anticipación suma una inasistencia (cancelacion.tardia).
 * @returns {Promise<Object>} la reserva cancelada, enriquecida
 */
export const cancelarReserva = async (reservaId, usuarioId, motivo = '') => {
    await simularLatencia();
    const base = leerBase();
    const ahora = reloj();
    const reserva = base.reservas.find((r) => r.id === reservaId);

    if (!reserva) throw crearError('No encontramos esa reserva.', { code: 'NO_ENCONTRADA' });
    if (reserva.usuarioId !== usuarioId) {
        throw crearError('Solo puedes cancelar tus propias reservas.', { code: 'SIN_PERMISO' });
    }

    const actual = enriquecer(reserva, base, ahora);
    if (!actual.puedeCancelar) {
        throw crearError(
            reserva.estado === ESTADOS_RESERVA.confirmada
                ? 'El bloque ya empezó; ya no se puede cancelar.'
                : 'Esta reserva ya no se puede cancelar.',
            { code: 'NO_CANCELABLE' }
        );
    }

    const usuario = base.usuarios.find((u) => u.id === usuarioId);
    const marca = ahora.toISOString();
    const cancelada = {
        ...reserva,
        estado: ESTADOS_RESERVA.cancelada,
        cancelacion: {
            fecha: marca,
            porUsuarioId: usuarioId,
            porRol: 'estudiante',
            motivo: String(motivo ?? '').trim() || null,
            tardia: actual.cancelacionGeneraInasistencia,
        },
        historial: [...(reserva.historial ?? []), { tipo: 'cancelada', fecha: marca, actor: nombreCompleto(usuario) }],
    };

    guardarReservas(base.reservas.map((r) => (r.id === reservaId ? cancelada : r)));
    return enriquecer(cancelada, leerBase(), ahora);
};

/* ------------------------- Apoyo para elegir bloque ----------------------- */

/**
 * Espacios disponibles y bloques horarios (solo lectura), para la página de
 * prueba que hace de calendario mientras no exista el de la HU-3.
 * @returns {Promise<{ espacios: Object[], bloques: Object[] }>}
 */
export const obtenerEspaciosYBloques = async () => {
    const { espacios, bloques } = leerBase();
    return {
        espacios: espacios.filter((e) => e.estado === 'disponible'),
        bloques,
    };
};