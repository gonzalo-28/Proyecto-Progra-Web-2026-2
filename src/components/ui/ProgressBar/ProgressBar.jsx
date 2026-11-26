// src/components/ui/ProgressBar/ProgressBar.jsx

import styles from './ProgressBar.module.css';

const cx = (...classes) => classes.filter(Boolean).join(' ');

/**
 * Barra de progreso ("5 de 8 horas" en Mi cuenta).
 *
 * Props:
 *  - value, max: valores absolutos (se limitan a 0..max)
 *  - label:      texto accesible ("5 de 8 horas reservadas")
 *  - className
 */
export default function ProgressBar({ value = 0, max = 100, label, className }) {
  const safeMax = max > 0 ? max : 1;
  const clamped = Math.min(Math.max(value, 0), safeMax);
  const percent = (clamped / safeMax) * 100;

  return (
    <div
      className={cx(styles.track, className)}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={safeMax}
      aria-valuenow={clamped}
      aria-label={label}
    >
      <div className={styles.fill} style={{ width: `${percent}%` }} />
    </div>
  );
}
