// src/components/routes/PantallaCarga.jsx

import Spinner from '../ui/Spinner/Spinner';
import styles from './PantallaCarga.module.css';

/** Pantalla completa mientras se restaura la sesión guardada. */
export default function PantallaCarga({ mensaje = 'Cargando sesión…' }) {
  return (
    <div className={styles.root} role="status" aria-live="polite">
      <Spinner size="md" className={styles.spinner} />
      <p className={styles.text}>{mensaje}</p>
    </div>
  );
}
