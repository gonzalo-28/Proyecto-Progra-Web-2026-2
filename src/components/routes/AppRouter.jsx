// src/components/routes/AppRouter.jsx

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RutaProtegida from './RutaProtegida';
import RutaPublica from './RutaPublica';
import VistaPendiente from './VistaPendiente';
import ForbiddenPage from '../../pages/ForbiddenPage/ForbiddenPage';
import NotFoundPage from '../../pages/NotFoundPage/NotFoundPage';
import Login from '../../pages/LoginPage/LoginPage';
import LandingPage from '../../pages/LandingPage/LandingPage';
import RegisterStudentPage from '../../pages/RegisterStudentPage/RegisterStudentPage';

// Marcadores de vistas que aún no existen (se reemplazan en las fases C–E).
const Recuperar = () => <VistaPendiente titulo="Recuperar contraseña" screen="recover" />;
const Perfil = () => <VistaPendiente titulo="Mi cuenta" screen="account" />;
// Dashboards: pertenecen a otras HU; solo existen para que la redirección por rol tenga destino.
const EstudianteDashboard = () => <VistaPendiente titulo="Panel del estudiante" />;
const EncargadoDashboard = () => <VistaPendiente titulo="Panel del encargado" />;

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing: abierta a todos. El navbar se adapta si hay sesión. */}
        <Route path="/" element={<Navigate to="/landingpage" replace />} />
        <Route path="/landingpage" element={<LandingPage />} />

        {/* Rutas públicas (solo accesibles sin sesión activa) */}
        <Route element={<RutaPublica />}>
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<RegisterStudentPage />} />
          <Route path="/recuperar" element={<Recuperar />} />
        </Route>

        {/* Rutas privadas compartidas (cualquier usuario autenticado) */}
        <Route element={<RutaProtegida />}>
          <Route path="/perfil" element={<Perfil />} />
        </Route>

        {/* Rutas privadas exclusivas para estudiantes */}
        <Route element={<RutaProtegida rolesPermitidos={['estudiante']} />}>
          <Route path="/estudiante/dashboard" element={<EstudianteDashboard />} />
        </Route>

        {/* Rutas privadas exclusivas para encargados */}
        <Route element={<RutaProtegida rolesPermitidos={['encargado']} />}>
          <Route path="/encargado/dashboard" element={<EncargadoDashboard />} />
        </Route>

        <Route path="/acceso-denegado" element={<ForbiddenPage />} />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
