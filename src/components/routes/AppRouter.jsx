// src/components/routes/AppRouter.jsx

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RutaProtegida from './RutaProtegida';
import RutaPublica from './RutaPublica';
import AccesoDenegado from '../../pages/AccesoDenegado';
import Login from '../../pages/LoginPage/LoginPage'; 

// Importaciones / Placeholders de componentes de vista
const Registro = () => <div className="p-8 text-lg font-medium">Vista de Registro</div>;
const Recuperar = () => <div className="p-8 text-lg font-medium">Vista de Recuperar Contraseña</div>;
const Perfil = () => <div className="p-8 text-lg font-medium">Vista de Perfil de Usuario</div>;
const EstudianteDashboard = () => <div className="p-8 text-lg font-medium">Dashboard del Estudiante</div>;
const EncargadoDashboard = () => <div className="p-8 text-lg font-medium">Dashboard del Encargado</div>;

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas Públicas (Solo accesibles sin sesión activa) */}
        <Route element={<RutaPublica />}>
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/recuperar" element={<Recuperar />} />
        </Route>

        {/* Rutas Privadas Compartidas (Cualquier usuario autenticado) */}
        <Route element={<RutaProtegida />}>
          <Route path="/perfil" element={<Perfil />} />
        </Route>

        {/* Rutas Privadas Exclusivas para Estudiantes */}
        <Route element={<RutaProtegida rolesPermitidos={['estudiante']} />}>
          <Route path="/estudiante/dashboard" element={<EstudianteDashboard />} />
        </Route>

        {/* Rutas Privadas Exclusivas para Encargados */}
        <Route element={<RutaProtegida rolesPermitidos={['encargado']} />}>
          <Route path="/encargado/dashboard" element={<EncargadoDashboard />} />
        </Route>

        {/* Vista de Acceso Denegado */}
        <Route path="/acceso-denegado" element={<AccesoDenegado />} />

        {/* Fallback 404 / Desconocido */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;