// src/components/layout/StatusLayout/StatusLayout.jsx

import PageShell from '../PageShell/PageShell';
import styles from './StatusLayout.module.css';

/**
 * PageShell + contenido centrado en vertical y horizontal.
 * Lo usan las pantallas de estado: 403 y 404 (con poco contenido, el footer
 * igual queda pegado al fondo porque <main> crece).
 *
 * Props: screen, navbarProps, footerProps (van a PageShell), children
 */
export default function StatusLayout({ screen, navbarProps, footerProps, children }) {
  return (
    <PageShell screen={screen} navbarProps={navbarProps} footerProps={footerProps}>
      <div className={styles.center}>{children}</div>
    </PageShell>
  );
}
