/**
 * navbarConfig.js
 * Rutas, links por rol y opciones de campus del Navbar.
 * Todo lo que haya que ajustar a tu router se cambia SOLO aquí.
 */

export const ROUTES = {
  home: '/landingpage',
  login: '/login',
  register: '/registro',
  account: '/perfil',
};

/* Links del visitante (mockups: Landing, Login, Registros, Recuperar, 404) */
export const VISITOR_LINKS = [
  { to: '/espacios', label: 'Espacios' },
  { to: '/reglamento', label: 'Reglas de uso' },
  { to: '/ayuda', label: 'Ayuda' },
];

/* Links del usuario autenticado, según rol.
   estudiante: sale del mockup (Mi cuenta / Acceso denegado).
   encargado:  PROVISIONAL, no hay mockup de su navbar. */
export const LINKS_BY_ROLE = {
  estudiante: [
    { to: '/espacios', label: 'Buscar espacios' },
    { to: '/mis-reservas', label: 'Mis reservas' },
    { to: '/mis-incidencias', label: 'Mis incidencias' },
    { to: ROUTES.account, label: 'Mi cuenta' },
  ],
  encargado: [
    { to: '/bandeja', label: 'Bandeja del día' },
    { to: ROUTES.account, label: 'Mi cuenta' },
  ],
};

/* Rol desconocido: lo mínimo que todo usuario autenticado necesita. */
export const FALLBACK_USER_LINKS = [{ to: ROUTES.account, label: 'Mi cuenta' }];

export const CAMPUS_OPTIONS = [
  { value: 'monterrico', label: 'Campus Monterrico' },
];