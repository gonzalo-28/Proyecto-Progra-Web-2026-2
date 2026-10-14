// src/components/routes/RutaProtegida.jsx

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PantallaCarga from './PantallaCarga';

export const RutaProtegida = ({ rolesPermitidos, children }) => {
  const { usuario, cargando } = useAuth();
  const location = useLocation();

  // 1. Mientras se verifica la sesión persistida, prevenimos redirecciones falsas
  if (cargando) return <PantallaCarga mensaje="Cargando sesión…" />;

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
