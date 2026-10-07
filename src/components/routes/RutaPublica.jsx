// src/components/routes/RutaPublica.jsx

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Helper para resolver el dashboard por defecto de acuerdo con el rol del usuario
 */
export const obtenerRutaInicioPorRol = (rol) => {
  switch (rol) {
    case 'estudiante':
      return '/estudiante/dashboard';
    case 'encargado':
      return '/encargado/dashboard';
    default:
      return '/perfil';
  }
};

export const RutaPublica = ({ children }) => {
  const { usuario, cargando } = useAuth();

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600 font-medium text-sm">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si ya tiene sesión activa, redirigir a su dashboard correspondiente
  if (usuario) {
    const rutaDestino = obtenerRutaInicioPorRol(usuario.rol);
    return <Navigate to={rutaDestino} replace />;
  }

  return children ? children : <Outlet />;
};

export default RutaPublica;