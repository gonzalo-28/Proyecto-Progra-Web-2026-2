// src/context/AuthProvider.jsx
//
// Estado de sesión para toda la app. No guarda datos ni reglas: delega todo en
// authService. `cargando` es SOLO la restauración inicial de la sesión; las
// operaciones (login, registro…) no lo tocan, porque RutaPublica/RutaProtegida
// muestran un spinner de pantalla completa mientras `cargando` es true y
// desmontarían el formulario (perdiendo el botón "Verificando…" y los errores).
// Cada formulario maneja su propio estado de envío.

import { useState, useEffect, useCallback, useMemo } from 'react';
import * as authService from '../services/authService';
import { AuthContext } from './AuthContext';

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const limpiarError = useCallback(() => setError(null), []);

  // Restaura la sesión guardada al abrir la app.
  useEffect(() => {
    let activo = true;
    authService
      .obtenerSesionActual()
      .then((sesion) => {
        if (activo) setUsuario(sesion);
      })
      .catch((err) => console.error('Error al restaurar la sesión:', err))
      .finally(() => {
        if (activo) setCargando(false);
      });
    return () => {
      activo = false;
    };
  }, []);

  /** Ejecuta una operación del servicio, guarda el mensaje de error y lo relanza. */
  const ejecutar = useCallback(async (operacion) => {
    setError(null);
    try {
      return await operacion();
    } catch (err) {
      setError(err.message || 'Ocurrió un error inesperado.');
      throw err; // el formulario decide cómo mostrar errores por campo
    }
  }, []);

  const login = useCallback(
    (correo, contrasena, recordar = false) =>
      ejecutar(async () => {
        const user = await authService.login(correo, contrasena, recordar);
        setUsuario(user);
        return user;
      }),
    [ejecutar]
  );

  const logout = useCallback(async () => {
    setError(null);
    await authService.logout();
    setUsuario(null);
  }, []);

  /** Crea la cuenta pero NO inicia sesión: el flujo sigue en "Ir a iniciar sesión". */
  const registro = useCallback(
    (datos) => ejecutar(() => authService.registro(datos)),
    [ejecutar]
  );

  const actualizarPerfil = useCallback(
    (nuevosDatos) =>
      ejecutar(async () => {
        const actualizado = await authService.actualizarPerfil(usuario.id, nuevosDatos);
        setUsuario(actualizado);
        return actualizado;
      }),
    [ejecutar, usuario]
  );

  const cambiarContrasena = useCallback(
    (contrasenaActual, contrasenaNueva) =>
      ejecutar(() => authService.cambiarContrasena(usuario.id, contrasenaActual, contrasenaNueva)),
    [ejecutar, usuario]
  );

  const solicitarRecuperacion = useCallback(
    (correo) => ejecutar(() => authService.solicitarRecuperacion(correo)),
    [ejecutar]
  );

  const verificarTokenRecuperacion = useCallback(
    (token) => ejecutar(() => authService.verificarTokenRecuperacion(token)),
    [ejecutar]
  );

  const restablecerContrasena = useCallback(
    (token, contrasenaNueva) =>
      ejecutar(() => authService.restablecerContrasena(token, contrasenaNueva)),
    [ejecutar]
  );

  const value = useMemo(
    () => ({
      usuario,
      cargando,
      error,
      login,
      logout,
      registro,
      actualizarPerfil,
      cambiarContrasena,
      solicitarRecuperacion,
      verificarTokenRecuperacion,
      restablecerContrasena,
      limpiarError,
    }),
    [
      usuario,
      cargando,
      error,
      login,
      logout,
      registro,
      actualizarPerfil,
      cambiarContrasena,
      solicitarRecuperacion,
      verificarTokenRecuperacion,
      restablecerContrasena,
      limpiarError,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;