// src/components/routes/AppRouter.jsx

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RutaProtegida from './RutaProtegida';
import RutaPublica from './RutaPublica';
import VistaPendiente from './VistaPendiente';
import ForbiddenPage from '../../pages/ForbiddenPage/ForbiddenPage';
import NotFoundPage from '../../pages/NotFoundPage/NotFoundPage';
import Login from '../../pages/LoginPage/LoginPage';
import LandingPage from '../../pages/LandingPage/LandingPage';
import ProfilePage from '../../pages/ProfilePage/ProfilePage';
import RecoverPasswordPage from '../../pages/RecoverPasswordPage/RecoverPasswordPage';
import RegisterManagerPage from '../../pages/RegisterManagerPage/RegisterManagerPage';
import RegisterStudentPage from '../../pages/RegisterStudentPage/RegisterStudentPage';
import DailyTrayPage from '../../pages/DailyTrayPage/DailyTrayPage';
import NewBlockPage from '../../pages/NewBlockPage/NewBlockPage';
import ReservationSearchPage from '../../pages/ReservationSearchPage/ReservationSearchPage';
import { RUTAS_ENCARGADO } from './rutasEncargado';

// Marcador de una vista que pertenece a otra HU (el dashboard del estudiante).
// Solo existe para que la redirección por rol tenga destino.
const EstudianteDashboard = () => <VistaPendiente titulo="Panel del estudiante" />;

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
          <Route path="/registro/encargado" element={<RegisterManagerPage />} />
          <Route path="/recuperar" element={<RecoverPasswordPage />} />
        </Route>

        {/* Rutas privadas compartidas (cualquier usuario autenticado) */}
        <Route element={<RutaProtegida />}>
          <Route path="/perfil" element={<ProfilePage />} />
        </Route>

        {/* Rutas privadas exclusivas para estudiantes */}
        <Route element={<RutaProtegida rolesPermitidos={['estudiante']} />}>
          <Route path="/estudiante/dashboard" element={<EstudianteDashboard />} />
        </Route>

        {/* Rutas privadas exclusivas para encargados */}
        <Route element={<RutaProtegida rolesPermitidos={['encargado']} />}>
          {/* HU-5 · Operación diaria */}
          <Route path={RUTAS_ENCARGADO.bandeja} element={<DailyTrayPage />} />
          <Route path={RUTAS_ENCARGADO.bloqueos} element={<NewBlockPage />} />
          <Route path={RUTAS_ENCARGADO.busqueda} element={<ReservationSearchPage />} />
          {/* Ruta antigua: se mantiene para no romper enlaces guardados */}
          <Route
            path="/encargado/dashboard"
            element={<Navigate to={RUTAS_ENCARGADO.bandeja} replace />}
          />
        </Route>

        <Route path="/acceso-denegado" element={<ForbiddenPage />} />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
