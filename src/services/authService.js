// src/services/authService.js
/*import { usuarios as usuariosIniciales } from '../data/db.js';*/
import initialDb from '../data/db.js'; // ✅ Importa el objeto por defecto

// Y luego para acceder a los usuarios usas:
const usuariosIniciales = initialDb.usuarios;

const STORAGE_KEY = 'app_usuarios';
const NETWORK_LATENCY_MS = 500;

/**
 * Helper para simular latencia de red de 500ms mediante Promesas.
 */
const simularLatencia = (ms = NETWORK_LATENCY_MS) => 
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Inicialización lazy/seeding de datos.
 * Verifica si existe la clave en localStorage; si no, la puebla desde db.js.
 */
const inicializarAlmacenamiento = () => {
  try {
    const dataExistente = localStorage.getItem(STORAGE_KEY);
    if (!dataExistente) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(usuariosIniciales || []));
    }
  } catch (error) {
    console.error('Error al acceder a localStorage:', error);
  }
};

// Se ejecuta al importar el módulo
inicializarAlmacenamiento();

/**
 * Métodos auxiliares privados para manipular el estado en localStorage
 */
const obtenerUsuarios = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

const guardarUsuarios = (usuarios) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(usuarios));
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

  // Desestructuración para sanitizar la respuesta y omitir la contraseña
  const { contrasena: _, ...usuarioSinPassword } = usuario;
  return usuarioSinPassword;
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

  const { contrasena: _, ...usuarioCreadoSinPassword } = nuevoUsuario;
  return usuarioCreadoSinPassword;
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

  const { contrasena: _, ...perfilActualizado } = usuarioActualizado;
  return perfilActualizado;
};