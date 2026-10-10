// src/components/routes/AppRouter.jsx

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RutaProtegida from './RutaProtegida';
import RutaPublica from './RutaPublica';
import PageShell from '../layout/PageShell/PageShell';
import AccesoDenegado from '../../pages/AccesoDenegado';
import Login from '../../pages/LoginPage/LoginPage';
import LandingPage from '../../pages/LandingPage/LandingPage';

// Placeholders de vistas que aún no existen.
const Registro = () => <div className="p-8 text-lg font-medium">Vista de Registro</div>;
const Recuperar = () => <div className="p-8 text-lg font-medium">Vista de Recuperar Contraseña</div>;

// Las vistas privadas van dentro de PageShell: así tienen navbar con el menú
// de usuario y "Cerrar sesión" (si no, quedas atrapado en el dashboard).
const Perfil = () => (
  <PageShell screen="account">
    <div className="p-8 text-lg font-medium">Vista de Perfil de Usuario</div>
  </PageShell>
);
const EstudianteDashboard = () => (
  <PageShell screen="account">
    <div className="p-8 text-lg font-medium">Dashboard del Estudiante</div>
  </PageShell>
);
const EncargadoDashboard = () => (
  <PageShell screen="account">
    <div className="p-8 text-lg font-medium">Dashboard del Encargado</div>
  </PageShell>
);

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing: abierta a todos. El navbar se adapta si hay sesión. */}
        <Route path="/" element={<Navigate to="/landingpage" replace />} />
        <Route path="/landingpage" element={<LandingPage />} />

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

        {/* Fallback temporal: a la landing hasta que exista la página 404 */}
        <Route path="*" element={<Navigate to="/landingpage" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;