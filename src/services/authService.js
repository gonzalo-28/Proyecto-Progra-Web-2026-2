// src/services/authService.js
import { getStoredData, saveStoredData } from './storageService';

const NETWORK_LATENCY_MS = 500;

/** Simula latencia de red mediante Promesas. */
const simularLatencia = (ms = NETWORK_LATENCY_MS) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/* Los usuarios viven en la base única 'app_db' (storageService), no en una clave aparte. */
const obtenerUsuarios = () => getStoredData().usuarios ?? [];

const guardarUsuarios = (usuarios) => {
  saveStoredData({ ...getStoredData(), usuarios });
};

/** Devuelve una copia del usuario sin la contraseña. */
const sinContrasena = (usuario) => {
  const copia = { ...usuario };
  delete copia.contrasena;
  return copia;
};

/**
 * Autentica un usuario contra el almacenamiento local.
 * @param {string} correo - Correo del usuario.
 * @param {string} contrasena - Contraseña enviada.
 * @returns {Promise<Object>} Objeto del usuario autenticado (sin contraseña).
 */
export const login = async (correo, contrasena) => {
  await simularLatencia();

  const usuarios = obtenerUsuarios();
  const usuario = usuarios.find(
    (u) => u.correo.toLowerCase() === correo.trim().toLowerCase() && u.contrasena === contrasena
  );

  if (!usuario) {
    throw new Error('Credenciales incorrectas');
  }

  return sinContrasena(usuario);
};

/**
 * Registra un nuevo usuario asignándole un ID único y persistiéndolo.
 * @param {Object} datosUsuario - Datos del usuario a registrar.
 * @returns {Promise<Object>} Objeto del usuario creado (sin contraseña).
 */
export const registro = async (datosUsuario) => {
  await simularLatencia();

  const usuarios = obtenerUsuarios();
  const correoNormalizado = datosUsuario.correo.trim().toLowerCase();

  const yaExiste = usuarios.some(
    (u) => u.correo.toLowerCase() === correoNormalizado
  );

  if (yaExiste) {
    throw new Error('El correo electrónico ya se encuentra registrado');
  }

  const nuevoUsuario = {
    ...datosUsuario,
    id: Date.now(),
    correo: correoNormalizado
  };

  usuarios.push(nuevoUsuario);
  guardarUsuarios(usuarios);

  return sinContrasena(nuevoUsuario);
};

/**
 * Actualiza la información de un usuario registrado por su ID.
 * @param {number|string} id - Identificador único del usuario.
 * @param {Object} nuevosDatos - Propiedades a actualizar.
 * @returns {Promise<Object>} Objeto del usuario actualizado (sin contraseña).
 */
export const actualizarPerfil = async (id, nuevosDatos) => {
  await simularLatencia();

  const usuarios = obtenerUsuarios();
  const index = usuarios.findIndex((u) => String(u.id) === String(id));

  if (index === -1) {
    throw new Error('Usuario no encontrado');
  }

  // Prevenir alteración accidental del ID
  const usuarioActualizado = {
    ...usuarios[index],
    ...nuevosDatos,
    id: usuarios[index].id
  };

  usuarios[index] = usuarioActualizado;
  guardarUsuarios(usuarios);

  return sinContrasena(usuarioActualizado);
};