// src/services/authService.js
//
// Servicio de autenticación (HU-1). Es la ÚNICA capa que conoce usuarios,
// sesión, intentos de login y tokens de recuperación. Los componentes solo
// llaman a estas funciones (a través de AuthContext). En la Entrega 2 se
// reemplaza el cuerpo por llamadas a la API manteniendo las mismas firmas.
//
// Errores: todas las funciones rechazan con un Error que trae
//   - message: texto listo para mostrar al usuario
//   - code:    identificador estable (p. ej. 'CREDENCIALES_INVALIDAS')
//   - campos:  { campo: mensaje } cuando el error es de validación de formulario
//   - intentosRestantes / bloqueadoHasta: solo en errores de login

import { getStoredData, guardarOFallar, MENSAJE_ERROR_GUARDADO } from './storageService';
import {
  INSTITUTIONAL_DOMAIN,
  isBlank,
  isInstitutionalEmail,
  isPasswordValid,
  isValidEmail,
  PASSWORD_REQUIREMENTS_TEXT,
} from '../utils/validators';

/* ------------------------------ Configuración ----------------------------- */

const NETWORK_LATENCY_MS = 500;

export const MAX_INTENTOS_LOGIN = 5;
const BLOQUEO_MS = 15 * 60 * 1000; // bloqueo temporal tras agotar los intentos
const RECUPERACION_TTL_MS = 30 * 60 * 1000; // "El enlace vence en 30 minutos"

const SESSION_KEY = 'app_session';
const INTENTOS_KEY = 'app_login_intentos';
const RECUPERACION_KEY = 'app_recuperacion';

export const ROLES = { estudiante: 'estudiante', encargado: 'encargado' };
export const ESTADOS = {
  activo: 'activo',
  pendiente: 'pendiente', // encargado a la espera de aprobación
  inactivo: 'inactivo',
};

/* -------------------------------- Utilidades ------------------------------ */

const simularLatencia = (ms = NETWORK_LATENCY_MS) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const crearError = (message, extra = {}) =>
  Object.assign(new Error(message), extra);

const errorValidacion = (campos) =>
  crearError('Revisa los campos marcados.', { code: 'VALIDACION', campos });

const normalizarCorreo = (correo) => String(correo ?? '').trim().toLowerCase();

const sinContrasena = (usuario) => {
  const copia = { ...usuario };
  delete copia.contrasena;
  return copia;
};

/** localStorage / sessionStorage pueden fallar (modo privado, bloqueo). */
const leerJSON = (storage, key, fallback) => {
  try {
    const raw = storage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

/** Devuelve true si guardó. Los datos de apoyo (contador de intentos) toleran el fallo. */
const escribirJSON = (storage, key, value) => {
  try {
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`No se pudo guardar "${key}":`, error);
    return false;
  }
};

/** Igual que escribirJSON, pero lanza ERROR_GUARDADO si no se pudo guardar. */
const escribirJSONOFallar = (storage, key, value) => {
  if (!escribirJSON(storage, key, value)) {
    throw crearError(MENSAJE_ERROR_GUARDADO, { code: 'ERROR_GUARDADO' });
  }
};

const borrar = (storage, key) => {
  try {
    storage.removeItem(key);
  } catch {
    /* nada que hacer */
  }
};

const generarId = () => `usr_${Date.now()}`;

const generarToken = () =>
  globalThis.crypto?.randomUUID?.() ??
  `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;

/* ------------------------- Acceso a usuarios (app_db) --------------------- */

const obtenerUsuarios = () => getStoredData().usuarios ?? [];

const guardarUsuarios = (usuarios) => {
  guardarOFallar({ ...getStoredData(), usuarios });
};

const buscarPorCorreo = (correo) =>
  obtenerUsuarios().find((u) => normalizarCorreo(u.correo) === normalizarCorreo(correo));

const buscarPorId = (id) =>
  obtenerUsuarios().find((u) => String(u.id) === String(id));

/* ---------------------------------- Sesión -------------------------------- */
/* Solo se guarda el id. "Recuérdame" → localStorage (persiste al cerrar el
   navegador); sin marcar → sessionStorage (muere al cerrar la pestaña). */

const guardarSesion = (id, recordar) => {
  borrar(localStorage, SESSION_KEY);
  borrar(sessionStorage, SESSION_KEY);
  escribirJSONOFallar(recordar ? localStorage : sessionStorage, SESSION_KEY, { id });
};

const limpiarSesion = () => {
  borrar(localStorage, SESSION_KEY);
  borrar(sessionStorage, SESSION_KEY);
};

/**
 * Devuelve el usuario de la sesión vigente o null. Relee la base, así que
 * refleja cambios de perfil y descarta cuentas que ya no están activas.
 */
export const obtenerSesionActual = async () => {
  const sesion =
    leerJSON(sessionStorage, SESSION_KEY, null) ??
    leerJSON(localStorage, SESSION_KEY, null);
  if (!sesion?.id) return null;

  const usuario = buscarPorId(sesion.id);
  if (!usuario || usuario.estado !== ESTADOS.activo) {
    limpiarSesion();
    return null;
  }
  return sinContrasena(usuario);
};

export const logout = async () => {
  limpiarSesion();
};

/* ------------------------- Intentos de login / bloqueo -------------------- */

const leerIntentos = () => leerJSON(localStorage, INTENTOS_KEY, {});
const escribirIntentos = (mapa) => escribirJSON(localStorage, INTENTOS_KEY, mapa);

const minutosRestantes = (hasta) => Math.max(Math.ceil((hasta - Date.now()) / 60000), 1);

const errorBloqueo = (hasta) =>
  crearError(
    `Demasiados intentos fallidos. Inténtalo de nuevo en ${minutosRestantes(hasta)} min.`,
    { code: 'CUENTA_BLOQUEADA', bloqueadoHasta: hasta, intentosRestantes: 0 }
  );

/* ---------------------------------- Login --------------------------------- */

/**
 * @param {string}  correo
 * @param {string}  contrasena
 * @param {boolean} recordar  true → la sesión sobrevive al cierre del navegador
 * @returns {Promise<Object>} usuario sin contraseña
 */
export const login = async (correo, contrasena, recordar = false) => {
  await simularLatencia();

  const clave = normalizarCorreo(correo);
  const mapa = leerIntentos();
  let registro = mapa[clave] ?? { intentos: 0, bloqueadoHasta: null };

  if (registro.bloqueadoHasta) {
    if (registro.bloqueadoHasta > Date.now()) throw errorBloqueo(registro.bloqueadoHasta);
    registro = { intentos: 0, bloqueadoHasta: null }; // el bloqueo ya venció
  }

  const usuario = buscarPorCorreo(clave);

  if (!usuario || usuario.contrasena !== contrasena) {
    // También cuenta si el correo no existe: así no se revela qué correos están registrados.
    registro.intentos += 1;
    const restantes = MAX_INTENTOS_LOGIN - registro.intentos;

    if (restantes <= 0) {
      registro.bloqueadoHasta = Date.now() + BLOQUEO_MS;
      mapa[clave] = registro;
      escribirIntentos(mapa);
      throw errorBloqueo(registro.bloqueadoHasta);
    }

    mapa[clave] = registro;
    escribirIntentos(mapa);
    throw crearError(
      `Correo o contraseña incorrectos. Te quedan ${restantes} ${
        restantes === 1 ? 'intento' : 'intentos'
      } antes del bloqueo temporal.`,
      { code: 'CREDENCIALES_INVALIDAS', intentosRestantes: restantes }
    );
  }

  // Credenciales correctas: se revisa el estado de la cuenta.
  if (usuario.estado === ESTADOS.pendiente) {
    throw crearError(
      'Tu cuenta está pendiente de aprobación por la Dirección de Servicios Académicos.',
      { code: 'CUENTA_PENDIENTE' }
    );
  }
  if (usuario.estado !== ESTADOS.activo) {
    throw crearError('Tu cuenta está desactivada. Escribe a reservas@ulima.edu.pe.', {
      code: 'CUENTA_INACTIVA',
    });
  }

  delete mapa[clave];
  escribirIntentos(mapa);
  guardarSesion(usuario.id, Boolean(recordar));
  return sinContrasena(usuario);
};

/* --------------------------------- Registro ------------------------------- */

const validarRegistro = (datos) => {
  const campos = {};

  if (isBlank(datos.nombres)) campos.nombres = 'Ingresa tus nombres.';
  if (isBlank(datos.apellidos)) campos.apellidos = 'Ingresa tus apellidos.';

  if (isBlank(datos.correo)) {
    campos.correo = 'Ingresa tu correo institucional.';
  } else if (!isValidEmail(datos.correo)) {
    campos.correo = 'Ingresa un correo válido.';
  } else if (!isInstitutionalEmail(datos.correo)) {
    campos.correo = `El correo debe terminar en ${INSTITUTIONAL_DOMAIN}`;
  } else if (buscarPorCorreo(datos.correo)) {
    campos.correo = 'Este correo ya está registrado.';
  }

  if (!isPasswordValid(datos.contrasena)) campos.contrasena = PASSWORD_REQUIREMENTS_TEXT;

  if (datos.rol === ROLES.estudiante) {
    if (isBlank(datos.carrera)) campos.carrera = 'Selecciona tu carrera.';
    const ciclo = Number(datos.ciclo);
    if (!Number.isInteger(ciclo) || ciclo < 1 || ciclo > 10) campos.ciclo = 'Selecciona tu ciclo.';
  } else if (datos.rol === ROLES.encargado) {
    if (isBlank(datos.sedeAsignadaId)) campos.sedeAsignadaId = 'Selecciona la sede asignada.';
  } else {
    throw crearError('Tipo de cuenta no válido.', { code: 'ROL_INVALIDO' });
  }

  if (Object.keys(campos).length > 0) throw errorValidacion(campos);
};

/**
 * Crea una cuenta. NO inicia sesión (el mockup manda a "Ir a iniciar sesión").
 *  - estudiante: nace 'activo' (la confirmación por correo se simula; no hay envío real).
 *  - encargado:  nace 'pendiente' hasta que la Dirección de Servicios Académicos lo apruebe.
 * @param {Object} datos { rol, nombres, apellidos, correo, contrasena, carrera?, ciclo?, sedeAsignadaId? }
 * @returns {Promise<Object>} usuario creado, sin contraseña, con la forma del contrato
 */
export const registro = async (datos) => {
  await simularLatencia();
  validarRegistro(datos);

  const esEstudiante = datos.rol === ROLES.estudiante;
  const nuevoUsuario = {
    id: generarId(),
    nombres: datos.nombres.trim(),
    apellidos: datos.apellidos.trim(),
    correo: normalizarCorreo(datos.correo),
    contrasena: datos.contrasena,
    rol: datos.rol,
    carrera: esEstudiante ? datos.carrera.trim() : null,
    ciclo: esEstudiante ? Number(datos.ciclo) : null,
    sedeAsignadaId: esEstudiante ? null : datos.sedeAsignadaId,
    estado: esEstudiante ? ESTADOS.activo : ESTADOS.pendiente,
  };

  guardarUsuarios([...obtenerUsuarios(), nuevoUsuario]);
  return sinContrasena(nuevoUsuario);
};

/* --------------------------------- Perfil --------------------------------- */

/**
 * Edita los datos de la cuenta. Solo se aceptan nombres y apellidos (ambos
 * roles) y carrera y ciclo (estudiante). Correo, rol, estado y sede no se editan.
 */
export const actualizarPerfil = async (id, nuevosDatos) => {
  await simularLatencia();

  const usuarios = obtenerUsuarios();
  const index = usuarios.findIndex((u) => String(u.id) === String(id));
  if (index === -1) throw crearError('Usuario no encontrado.', { code: 'NO_ENCONTRADO' });

  const actual = usuarios[index];
  const cambios = {};
  const campos = {};

  if ('nombres' in nuevosDatos) {
    if (isBlank(nuevosDatos.nombres)) campos.nombres = 'Ingresa tus nombres.';
    else cambios.nombres = nuevosDatos.nombres.trim();
  }
  if ('apellidos' in nuevosDatos) {
    if (isBlank(nuevosDatos.apellidos)) campos.apellidos = 'Ingresa tus apellidos.';
    else cambios.apellidos = nuevosDatos.apellidos.trim();
  }
  if (actual.rol === ROLES.estudiante) {
    if ('carrera' in nuevosDatos) {
      if (isBlank(nuevosDatos.carrera)) campos.carrera = 'Selecciona tu carrera.';
      else cambios.carrera = nuevosDatos.carrera.trim();
    }
    if ('ciclo' in nuevosDatos) {
      const ciclo = Number(nuevosDatos.ciclo);
      if (!Number.isInteger(ciclo) || ciclo < 1 || ciclo > 10) campos.ciclo = 'Selecciona tu ciclo.';
      else cambios.ciclo = ciclo;
    }
  }

  if (Object.keys(campos).length > 0) throw errorValidacion(campos);

  usuarios[index] = { ...actual, ...cambios };
  guardarUsuarios(usuarios);
  return sinContrasena(usuarios[index]);
};

/* ---------------------------- Cambio de contraseña ------------------------ */

export const cambiarContrasena = async (id, contrasenaActual, contrasenaNueva) => {
  await simularLatencia();

  const usuarios = obtenerUsuarios();
  const index = usuarios.findIndex((u) => String(u.id) === String(id));
  if (index === -1) throw crearError('Usuario no encontrado.', { code: 'NO_ENCONTRADO' });

  const campos = {};
  if (usuarios[index].contrasena !== contrasenaActual) {
    campos.contrasenaActual = 'La contraseña actual es incorrecta.';
  }
  if (!isPasswordValid(contrasenaNueva)) {
    campos.contrasenaNueva = PASSWORD_REQUIREMENTS_TEXT;
  } else if (contrasenaNueva === contrasenaActual) {
    campos.contrasenaNueva = 'La nueva contraseña debe ser distinta de la actual.';
  }
  if (Object.keys(campos).length > 0) throw errorValidacion(campos);

  usuarios[index] = { ...usuarios[index], contrasena: contrasenaNueva };
  guardarUsuarios(usuarios);
};

/* ------------------------- Recuperación de contraseña --------------------- */
/* Flujo de 3 pasos: (1) pedir enlace, (2) abrir enlace, (3) nueva contraseña.
   No hay correo real: el "enlace" es un token guardado localmente que
   solicitarRecuperacion devuelve para que la interfaz pueda simular el paso 2. */

const leerTokens = () => leerJSON(localStorage, RECUPERACION_KEY, {});
const escribirTokens = (mapa) => escribirJSON(localStorage, RECUPERACION_KEY, mapa);

/**
 * Paso 1. Responde igual exista o no el correo (no revela cuentas). Solo
 * genera token si el correo pertenece a una cuenta activa.
 * @returns {Promise<{correo: string, enviado: true, token: string|null, expiraEn: number|null}>}
 */
export const solicitarRecuperacion = async (correo) => {
  await simularLatencia();

  if (isBlank(correo)) throw errorValidacion({ correo: 'Ingresa tu correo institucional.' });
  if (!isValidEmail(correo)) throw errorValidacion({ correo: 'Ingresa un correo válido.' });

  const correoNormalizado = normalizarCorreo(correo);
  const usuario = buscarPorCorreo(correoNormalizado);
  const respuesta = { correo: correoNormalizado, enviado: true, token: null, expiraEn: null };

  if (!usuario || usuario.estado !== ESTADOS.activo) return respuesta;

  const ahora = Date.now();
  const vigentes = Object.fromEntries(
    Object.entries(leerTokens()).filter(
      ([, t]) => t.expiraEn > ahora && t.correo !== correoNormalizado // un solo enlace vigente por correo
    )
  );

  const token = generarToken();
  const expiraEn = ahora + RECUPERACION_TTL_MS;
  vigentes[token] = { correo: correoNormalizado, expiraEn };
  escribirJSONOFallar(localStorage, RECUPERACION_KEY, vigentes); // sin token guardado, el enlace no serviría

  return { ...respuesta, token, expiraEn };
};

const validarToken = (token) => {
  const registro = leerTokens()[token];
  if (!registro) {
    throw crearError('El enlace no es válido. Solicita uno nuevo.', { code: 'TOKEN_INVALIDO' });
  }
  if (registro.expiraEn <= Date.now()) {
    throw crearError('El enlace venció. Solicita uno nuevo.', { code: 'TOKEN_EXPIRADO' });
  }
  return registro;
};

/** Paso 2. Confirma que el enlace sirve y devuelve a qué correo pertenece. */
export const verificarTokenRecuperacion = async (token) => {
  await simularLatencia(150);
  const { correo, expiraEn } = validarToken(token);
  return { correo, expiraEn };
};

/** Paso 3. Fija la nueva contraseña y consume el enlace. */
export const restablecerContrasena = async (token, contrasenaNueva) => {
  await simularLatencia();

  const { correo } = validarToken(token);
  if (!isPasswordValid(contrasenaNueva)) {
    throw errorValidacion({ contrasenaNueva: PASSWORD_REQUIREMENTS_TEXT });
  }

  const usuarios = obtenerUsuarios();
  const index = usuarios.findIndex((u) => normalizarCorreo(u.correo) === correo);
  if (index === -1) throw crearError('Usuario no encontrado.', { code: 'NO_ENCONTRADO' });

  usuarios[index] = { ...usuarios[index], contrasena: contrasenaNueva };
  guardarUsuarios(usuarios);

  const tokens = leerTokens();
  delete tokens[token];
  escribirTokens(tokens);

  // Si estaba bloqueado por intentos fallidos, ya demostró ser el dueño del correo.
  const intentos = leerIntentos();
  delete intentos[correo];
  escribirIntentos(intentos);
};