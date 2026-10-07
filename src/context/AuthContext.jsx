// src/context/AuthContext.jsx

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';

const SESSION_KEY = 'app_session_user';

// 1. Crear el Contexto
const AuthContext = createContext(null);

// 2. Componente Proveedor (AuthProvider)
export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Helper para resetear errores antes de cada operación
  const limpiarError = () => setError(null);

  // 3. Verificación inicial de la sesión al montar el componente
  useEffect(() => {
    const verificarSesion = async () => {
      try {
        // Verifica si authService ofrece un método explícito o lee localStorage
        const sesionGuardada = authService.obtenerSesionActual 
          ? await authService.obtenerSesionActual()
          : JSON.parse(localStorage.getItem(SESSION_KEY));

        if (sesionGuardada) {
          setUsuario(sesionGuardada);
        }
      } catch (err) {
        console.error('Error al restaurar la sesión:', err);
        localStorage.removeItem(SESSION_KEY);
      } finally {
        setCargando(false);
      }
    };

    verificarSesion();
  }, []);

  // 4. Funciones asíncronas para el manejo del estado
  const login = useCallback(async (correo, contrasena) => {
    limpiarError();
    setCargando(true);
    try {
      const user = await authService.login(correo, contrasena);
      setUsuario(user);
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      return user;
    } catch (err) {
      const mensaje = err.response?.data?.message || err.message || 'Error al iniciar sesión';
      setError(mensaje);
      throw err;
    } finally {
      setCargando(false);
    }
  }, []);

  const logout = useCallback(async () => {
    limpiarError();
    setCargando(true);
    try {
      if (typeof authService.logout === 'function') {
        await authService.logout();
      }
    } catch (err) {
      console.warn('Error en logout del servidor:', err);
    } finally {
      localStorage.removeItem(SESSION_KEY);
      setUsuario(null);
      setCargando(false);
    }
  }, []);

  const registro = useCallback(async (datosUsuario) => {
    limpiarError();
    setCargando(true);
    try {
      // Registrar e iniciar sesión automáticamente con los datos devueltos
      const newUser = await authService.registro(datosUsuario);
      setUsuario(newUser);
      localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
      return newUser;
    } catch (err) {
      const mensaje = err.response?.data?.message || err.message || 'Error al registrar el usuario';
      setError(mensaje);
      throw err;
    } finally {
      setCargando(false);
    }
  }, []);

  const actualizarPerfil = useCallback(async (nuevosDatos) => {
    limpiarError();
    setCargando(true);
    try {
      const usuarioActualizado = await authService.actualizarPerfil(nuevosDatos);
      setUsuario(usuarioActualizado);
      localStorage.setItem(SESSION_KEY, JSON.stringify(usuarioActualizado));
      return usuarioActualizado;
    } catch (err) {
      const mensaje = err.response?.data?.message || err.message || 'Error al actualizar perfil';
      setError(mensaje);
      throw err;
    } finally {
      setCargando(false);
    }
  }, []);

  const value = {
    usuario,
    cargando,
    error,
    login,
    logout,
    registro,
    actualizarPerfil,
    limpiarError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// 5. Custom Hook para consumir el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};