// src/components/layout/PageShell/LayoutPresets.js

/**
 * layoutPresets.js
 *
 * Aquí vive, en UN solo lugar, qué muestra el Navbar y el Footer en cada
 * pantalla, copiado literalmente de los mockups de la cátedra.
 * Si el mockup cambia, se edita este archivo y nada más.
 *
 * Contrato con los componentes (Subfase 3.2):
 *
 *   NavbarContainer recibe:
 *     - showCampusSelector: boolean
 *         true SOLO donde el mockup muestra el selector de campus.
 *     - actions: Array<'login' | 'register'>
 *         botones "Ingresar" / "Crear cuenta" que se ven a un visitante.
 *         Si hay sesión iniciada, NavbarContainer los ignora y muestra
 *         badge de rol + UserMenu (con useAuth).
 *
 *   Footer recibe:
 *     - showAddress: boolean   (" · Av. Javier Prado Este 4600")
 *     - links: Array<{ label, to? , href? }>
 */

/* AJUSTAR las rutas a las reales de react-router cuando existan. */
const LINKS = {
  reglamento: { label: 'Reglamento de uso', to: '/reglamento' },
  ayuda: { label: 'Mesa de ayuda', to: '/ayuda' },
  contacto: {
    label: 'reservas@ulima.edu.pe',
    href: 'mailto:reservas@ulima.edu.pe',
  },
};

/* ---- Footer: tres variantes que aparecen en los mockups ---- */
const FOOTER_LANDING = {
  showAddress: true, // solo la landing muestra la dirección
  links: [LINKS.reglamento, LINKS.ayuda, LINKS.contacto],
};

const FOOTER_APP = {
  showAddress: false, // Mi cuenta y Acceso denegado
  links: [LINKS.reglamento, LINKS.ayuda, LINKS.contacto],
};

const FOOTER_MINIMAL = {
  showAddress: false, // Login, Recuperar, Registros y 404: sin "Mesa de ayuda"
  links: [LINKS.reglamento, LINKS.contacto],
};

/* ---- Una entrada por pantalla del mockup ---- */
export const SCREEN_PRESETS = {
  // Landing pública: campus + Ingresar + Crear cuenta
  landing: {
    navbar: { showCampusSelector: true, actions: ['login', 'register'] },
    footer: FOOTER_LANDING,
  },

  // Inicio de sesión: campus + Crear cuenta
  login: {
    navbar: { showCampusSelector: true, actions: ['register'] },
    footer: FOOTER_MINIMAL,
  },

  // Registro de estudiante: campus + Ingresar
  registerStudent: {
    navbar: { showCampusSelector: true, actions: ['login'] },
    footer: FOOTER_MINIMAL,
  },

  // Recuperar contraseña: sin campus, Ingresar + Crear cuenta
  recover: {
    navbar: { showCampusSelector: false, actions: ['login', 'register'] },
    footer: FOOTER_MINIMAL,
  },

  // Registro de encargado: sin campus, solo Ingresar
  registerManager: {
    navbar: { showCampusSelector: false, actions: ['login'] },
    footer: FOOTER_MINIMAL,
  },

  // 404 (cualquier rol): sin campus, solo Ingresar si es visitante
  notFound: {
    navbar: { showCampusSelector: false, actions: ['login'] },
    footer: FOOTER_MINIMAL,
  },

  // Mi cuenta (estudiante autenticado): campus + usuario
  account: {
    navbar: { showCampusSelector: true, actions: [] },
    footer: FOOTER_APP,
  },

  // Acceso denegado (estudiante autenticado): sin campus + usuario
  forbidden: {
    navbar: { showCampusSelector: false, actions: [] },
    footer: FOOTER_APP,
  },

  // Fallback para pantallas que aún no tienen mockup
  default: {
    navbar: { showCampusSelector: false, actions: ['login'] },
    footer: FOOTER_MINIMAL,
  },
};
