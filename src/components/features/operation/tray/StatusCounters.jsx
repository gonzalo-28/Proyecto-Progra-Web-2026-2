// src/components/features/operation/tray/StatusCounters.jsx

import styles from './StatusCounters.module.css';

const cx = (...classes) => classes.filter(Boolean).join(' ');

/* Orden, texto y color de cada tarjeta, tal como el mockup 5.1. */
const COUNTERS = [
  { key: 'total', label: 'Total del día', tone: 'neutral' },
  { key: 'confirmadas', label: 'Confirmadas', tone: 'info' },
  { key: 'atendidas', label: 'Atendidas', tone: 'success' },
  { key: 'inasistencias', label: 'Inasistencias', tone: 'danger' },
  { key: 'canceladas', label: 'Canceladas', tone: 'warning' },
];

/**
 * Fila de contadores de la bandeja del día.
 * No cuenta nada: recibe los números ya calculados (los calcula el servicio).
 *
 * Props:
 *  - counts: { total, confirmadas, atendidas, inasistencias, canceladas }
 */
export default function StatusCounters({ counts = {} }) {
  return (
    <dl className={styles.root} aria-label="Resumen de reservas del día">
      {COUNTERS.map(({ key, label, tone }) => (
        <div key={key} className={styles.card}>
          <dt className={cx(styles.label, styles[tone])}>{label}</dt>
          <dd className={cx(styles.value, styles[tone])}>{counts[key] ?? 0}</dd>
        </div>
      ))}
    </dl>
  );
}
