// src/components/layout/PageShell/PageShell.jsx

import NavbarContainer from '../Navbar/NavbarContainer';
import Footer from '../Footer/Footer';
import { SCREEN_PRESETS } from './layoutPresets';
import styles from './PageShell.module.css';

const cx = (...classes) => classes.filter(Boolean).join(' ');

/**
 * Esqueleto común de todas las pantallas:
 *   Navbar arriba · <main> que crece · Footer pegado al fondo.
 *
 * Props:
 *  - screen:       clave de SCREEN_PRESETS ('landing', 'login', 'registerStudent',
 *                  'recover', 'registerManager', 'notFound', 'account', 'forbidden').
 *                  Define qué ve el Navbar y el Footer según el mockup de esa pantalla.
 *  - navbarProps:  sobrescribe puntualmente props del preset del Navbar.
 *  - footerProps:  sobrescribe puntualmente props del preset del Footer.
 *  - className:    clase extra para el contenedor raíz.
 *  - mainClassName: clase extra para <main> (los layouts hijos la usan para
 *                  centrar contenido, fijar anchos, etc.).
 *
 * Desacoplamiento: PageShell NO importa useAuth. Quien lo hace es
 * NavbarContainer, que decide entre vista de visitante y de usuario.
 */
export default function PageShell({
  screen = 'default',
  navbarProps,
  footerProps,
  className,
  mainClassName,
  children,
}) {
  const preset = SCREEN_PRESETS[screen] ?? SCREEN_PRESETS.default;

  return (
    <div className={cx(styles.root, className)}>
      <NavbarContainer {...preset.navbar} {...navbarProps} />
      <main id="contenido" className={cx(styles.main, mainClassName)}>
        {children}
      </main>
      <Footer {...preset.footer} {...footerProps} />
    </div>
  );
}