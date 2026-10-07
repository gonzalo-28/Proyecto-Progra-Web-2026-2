// src/components/routes/RutaProtegida.jsx

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const RutaProtegida = ({ rolesPermitidos, children }) => {
  const { usuario, cargando } = useAuth();
  const location = useLocation();

  // 1. Mientras se verifica la sesión persistida, prevenimos redirecciones falsas
  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600 font-medium text-sm">Cargando sesión...</p>
        </div>
      </div>
    );
  }

  // 2. Si no hay usuario autenticado, redirige a /login guardando la ruta intentada
  if (!usuario) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Validación de permisos basada en roles
  if (rolesPermitidos && rolesPermitidos.length > 0 && !rolesPermitidos.includes(usuario.rol)) {
    return <Navigate to="/acceso-denegado" replace />;
  }

  // 4. Si pasa todas las validaciones, renderiza el contenido protegido
  return children ? children : <Outlet />;
};

export default RutaProtegida;