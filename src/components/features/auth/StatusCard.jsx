// src/components/features/auth/StatusCard.jsx

import { useId } from 'react';
import StatusIcon from '../../ui/StatusIcon/StatusIcon';
import styles from './StatusCard.module.css';

/**
 * Resultado de un flujo dentro de la card: icono + título + texto + acción.
 * "Cuenta creada" (success), aprobación pendiente del encargado y
 * "verificando" (pending), y enlace de recuperación inválido (danger).
 *
 * Props:
 *  - variant: 'success' | 'pending' | 'danger'
 *  - title, message (nodo o texto), action (nodo con el botón)
 */
export default function StatusCard({ variant = 'success', title, message, action }) {
  const titleId = useId();

  return (
    <section className={styles.root} aria-labelledby={titleId} aria-live="polite">
      <StatusIcon variant={variant} size="sm" />
      <h1 id={titleId} className={styles.title}>
        {title}
      </h1>
      {message && <p className={styles.message}>{message}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </section>
  );
}
