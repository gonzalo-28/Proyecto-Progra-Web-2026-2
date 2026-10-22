// src/components/routes/AppRouter.jsx

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RutaProtegida from './RutaProtegida';
import RutaPublica from './RutaPublica';
import ForbiddenPage from '../../pages/ForbiddenPage/ForbiddenPage';
import NotFoundPage from '../../pages/NotFoundPage/NotFoundPage';
import Login from '../../pages/LoginPage/LoginPage';
import LandingPage from '../../pages/LandingPage/LandingPage';
import ProfilePage from '../../pages/ProfilePage/ProfilePage';
import RecoverPasswordPage from '../../pages/RecoverPasswordPage/RecoverPasswordPage';
import RegisterManagerPage from '../../pages/RegisterManagerPage/RegisterManagerPage';
import RegisterStudentPage from '../../pages/RegisterStudentPage/RegisterStudentPage';
import MyReservationsPage from '../../pages/MyReservationsPage/MyReservationsPage';
import DailyTrayPage from '../../pages/DailyTrayPage/DailyTrayPage';
import NewBlockPage from '../../pages/NewBlockPage/NewBlockPage';
import ReservationSearchPage from '../../pages/ReservationSearchPage/ReservationSearchPage';
import { RUTAS_ENCARGADO } from './rutasEncargado';
import ReservationDetailPage from '../../pages/ReservationDetailPage/ReservationDetailPage';
import ReservationConfirmationPage from '../../pages/ReservationConfirmationPage/ReservationConfirmationPage';
import SpaceAvailabilityPage from '../../pages/SpaceAvailabilityPage/SpaceAvailabilityPage';
import SpaceSearchPage from '../../pages/SpaceSearchPage/SpaceSearchPage';
import { RUTAS_ESPACIOS } from './rutasEspacios';

// Marcador de una vista que pertenece a otra HU (el dashboard del estudiante).
// Solo existe para que la redirección por rol tenga destino.
import SpaceCatalogPage from '../../pages/SpaceCatalogPage/SpaceCatalogPage';
import SpaceFormPage from '../../pages/SpaceFormPage/SpaceFormPage';
import SpaceEquipmentPage from '../../pages/SpaceEquipmentPage/SpaceEquipmentPage';
import SpaceSchedulePage from '../../pages/SpaceSchedulePage/SpaceSchedulePage';
import SpaceGeneralDataPage from '../../pages/SpaceGeneralDataPage/SpaceGeneralDataPage';
import PublicSpaceDetailPage from '../../pages/PublicSpaceDetailPage/PublicSpaceDetailPage';
import IncidenciasPage from '../../pages/IncidenciasPage/IncidenciasPage';

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing: abierta a todos. El navbar se adapta si hay sesión. */}
        <Route path="/" element={<Navigate to="/landingpage" replace />} />
        <Route path="/landingpage" element={<LandingPage />} />
        {/* HU-3: buscador y calendario públicos; HU-2: ficha pública separada. */}
        <Route path={RUTAS_ESPACIOS.busqueda} element={<SpaceSearchPage />} />
        <Route path={RUTAS_ESPACIOS.disponibilidad} element={<SpaceAvailabilityPage />} />
        <Route path={RUTAS_ESPACIOS.ficha} element={<PublicSpaceDetailPage />} />

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
          <Route path="/mis-reservas" element={<MyReservationsPage />} />   {/* ← nueva */}
          <Route path="/mis-reservas/:codigo" element={<ReservationDetailPage />} />
          <Route path="/mis-reservas/:codigo/confirmacion" element={<ReservationConfirmationPage />} />  {/* ← NUEVA */}
          <Route path="/mis-incidencias" element={<IncidenciasPage />} />
        </Route>

        {/* Rutas privadas exclusivas para encargados */}
        <Route element={<RutaProtegida rolesPermitidos={['encargado']} />}>
          {/* HU-2 · Catálogo y administración básica de espacios */}
          <Route path="/encargado/espacios" element={<SpaceCatalogPage />} />
          <Route path="/encargado/espacios/nuevo" element={<SpaceFormPage />} />
          <Route path="/encargado/espacios/:spaceId/equipamiento" element={<SpaceEquipmentPage />} />
          <Route path="/encargado/espacios/:spaceId/horario" element={<SpaceSchedulePage />} />
          <Route path="/encargado/espacios/:spaceId/datos-generales" element={<SpaceGeneralDataPage />} />

          {/* HU-5 · Operación diaria */}
          <Route path={RUTAS_ENCARGADO.bandeja} element={<DailyTrayPage />} />
          <Route path={RUTAS_ENCARGADO.bloqueos} element={<NewBlockPage />} />
          <Route path={RUTAS_ENCARGADO.busqueda} element={<ReservationSearchPage />} />
          <Route path={RUTAS_ENCARGADO.incidencias} element={<IncidenciasPage />} />
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
