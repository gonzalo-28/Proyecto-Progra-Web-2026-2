// src/components/layout/Footer/Footer.jsx

import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

const UNIVERSITY = 'Universidad de Lima';
const CAMPUS = 'Campus Monterrico';
const ADDRESS = 'Av. Javier Prado Este 4600';

/**
 * Barra oscura de pie de página.
 *
 * Props:
 *  - section:     texto intermedio opcional ("Panel de encargado" en la HU-5)
 *  - showAddress: agrega " · Av. Javier Prado Este 4600" (solo la landing)
 *  - links: [{ label, to? , href? }]  `to` = ruta interna, `href` = externo/mailto
 *
 * Los links de cada pantalla vienen de layoutPresets.js (fieles al mockup).
 */
export default function Footer({ section, showAddress = false, links = [] }) {
  const text = [UNIVERSITY, section, CAMPUS, showAddress && ADDRESS]
    .filter(Boolean)
    .join(' · ');

  return (
    <footer className={styles.root}>
      <div className={styles.inner}>
        <p className={styles.text}>{text}</p>

        {links.length > 0 && (
          <nav aria-label="Enlaces del pie de página">
            <ul className={styles.links}>
              {links.map((item) => (
                <li key={item.label}>
                  {item.to ? (
                    <Link to={item.to} className={styles.link}>
                      {item.label}
                    </Link>
                  ) : (
                    <a href={item.href} className={styles.link}>
                      {item.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </footer>
  );
}
