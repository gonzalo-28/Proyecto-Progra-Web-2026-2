import { useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../../../context/AuthContext'; // AJUSTAR a la ruta real de tu hook
import Navbar from './Navbar';
import {
  CAMPUS_OPTIONS,
  FALLBACK_USER_LINKS,
  LINKS_BY_ROLE,
  ROUTES,
  VISITOR_LINKS,
} from './navbarConfig';

const CAMPUS_STORAGE_KEY = 'reservaul.campus';

/** El campus elegido sobrevive al cambio de página (cada página monta su propio Navbar). */
function readStoredCampus() {
  const fallback = CAMPUS_OPTIONS[0].value;
  try {
    const stored = window.localStorage.getItem(CAMPUS_STORAGE_KEY);
    return CAMPUS_OPTIONS.some((option) => option.value === stored)
      ? stored
      : fallback;
  } catch {
    return fallback; // localStorage bloqueado: seguimos sin persistir
  }
}

/**
 * ÚNICO lugar donde el Navbar toca la sesión: traduce el usuario de
 * useAuth() a la forma { fullName, role, avatarUrl } que espera Navbar.
 * Si tu AuthContext usa otros nombres de campo, se ajusta SOLO aquí.
 */
function toNavbarUser(user) {
  if (!user) return null;

  const firstName = String(user.nombres ?? user.nombre ?? '').split(' ')[0];
  const lastName = String(user.apellidos ?? user.apellido ?? '').split(' ')[0];
  const fullName =
    user.fullName ||
    user.nombreCompleto ||
    user.name ||
    [firstName, lastName].filter(Boolean).join(' ') ||
    user.email ||
    'Usuario';

  return {
    fullName,
    role: String(user.role ?? user.rol ?? '').toLowerCase(),
    avatarUrl: user.avatarUrl ?? user.foto,
  };
}

/**
 * Navbar INTELIGENTE. Recibe de PageShell (vía layoutPresets):
 *  - showCampusSelector: boolean
 *  - actions: ['login' | 'register'] para visitante
 * y resuelve sesión (useAuth) y ruta actual (useLocation).
 */
export default function NavbarContainer({
  showCampusSelector = false,
  actions = [],
}) {
  const { usuario, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [campus, setCampus] = useState(readStoredCampus);

  const handleCampusChange = useCallback((value) => {
    setCampus(value);
    try {
      window.localStorage.setItem(CAMPUS_STORAGE_KEY, value);
    } catch {
      /* sin persistencia, no pasa nada */
    }
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
    } finally {
      navigate(ROUTES.login, { replace: true });
    }
  }, [logout, navigate]);

  const navbarUser = toNavbarUser(usuario);

  const links = navbarUser
    ? LINKS_BY_ROLE[navbarUser.role] ?? FALLBACK_USER_LINKS
    : VISITOR_LINKS;

  // Nunca ofrecer ir a la página en la que ya estás.
  const visibleActions = actions.filter(
    (action) =>
      !(action === 'login' && pathname.startsWith(ROUTES.login)) &&
      !(action === 'register' && pathname.startsWith(ROUTES.register))
  );

  return (
    <Navbar
      links={links}
      showCampusSelector={showCampusSelector}
      campus={campus}
      campusOptions={CAMPUS_OPTIONS}
      onCampusChange={handleCampusChange}
      actions={visibleActions}
      user={navbarUser}
      accountPath={ROUTES.account}
      onLogout={handleLogout}
    />
  );
}