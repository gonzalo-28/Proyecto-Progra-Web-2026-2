// src/components/layout/Navbar/NavLinks.jsx

import { NavLink } from 'react-router-dom';
import styles from './Navbar.module.css';

const cx = (...classes) => classes.filter(Boolean).join(' ');

/** Lista de links principales. El link de la ruta actual se marca en verde y negrita. */
export default function NavLinks({ links = [] }) {
  if (links.length === 0) return null;

  return (
    <nav aria-label="Principal" className={styles.nav}>
      <ul className={styles.list}>
        {links.map((link) => (
          <li key={`${link.to}-${link.label}`}>
            <NavLink
              to={link.to}
              className={({ isActive }) =>
                cx(styles.link, isActive && styles.active)
              }
            >
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
