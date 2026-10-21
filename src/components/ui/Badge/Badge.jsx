// src/components/ui/Badge/Badge.jsx

import styles from './Badge.module.css';

const cx = (...classes) => classes.filter(Boolean).join(' ');

/**
 * Etiqueta pequeña.
 *
 * Props:
 *  - tone: 'success' | 'warning' | 'danger' | 'info' | 'role'
 *          success/warning/danger → disponibilidad de bloques ("6 bloques libres hoy")
 *          info                   → estado "Confirmada" de una reserva (HU-5)
 *          role                   → rol del usuario en el navbar (ESTUDIANTE)
 *  - children, className
 */
export default function Badge({ tone = 'success', className, children }) {
  return (
    <span className={cx(styles.root, styles[tone], className)}>{children}</span>
  );
}
