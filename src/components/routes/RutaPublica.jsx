// src/components/routes/RutaPublica.jsx

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { obtenerRutaInicioPorRol } from './rutasPorRol';
import PantallaCarga from './PantallaCarga';

export const RutaPublica = ({ children }) => {
  const { usuario, cargando } = useAuth();

  if (cargando) return <PantallaCarga mensaje="Cargando…" />;

  // Si ya tiene sesión activa, redirigir a su dashboard correspondiente
  if (usuario) {
    return <Navigate to={obtenerRutaInicioPorRol(usuario.rol)} replace />;
  }

  return children ? children : <Outlet />;
};

export default RutaPublica;
