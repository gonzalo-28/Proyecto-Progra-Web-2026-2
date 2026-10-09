// src/components/layout/Navbar/Brand.jsx

import { Link } from 'react-router-dom';
import { ROUTES } from './navbarConfig';
import styles from './Navbar.module.css';

/** Logo: "Reserva" en tinta y "UL" en verde. Lleva al inicio. */
export default function Brand({ to = ROUTES.home }) {
  return (
    <Link to={to} className={styles.brand} aria-label="ReservaUL, ir al inicio">
      Reserva<span className={styles.brandAccent}>UL</span>
    </Link>
  );
}
