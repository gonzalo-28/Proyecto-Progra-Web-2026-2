// src/components/features/operation/tray/ToleranceBox.jsx

import { TOLERANCE_MINUTES } from '../../../../utils/tolerance';
import styles from './ToleranceBox.module.css';

const cx = (...classes) => classes.filter(Boolean).join(' ');

/** 16 → '16 min' · 75 → '1 h 15 min' */
function formatMinutes(minutes) {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} h ${rest} min` : `${hours} h`;
}

/**
 * Recuadro de tolerancia del detalle (mockup 5.3).
 *  - antes del inicio:   gris  · "Empieza a las 10:00"
 *  - dentro de los 15':  ámbar · "Faltan 7 min" · "Podrás marcar la inasistencia a las 10:15."
 *  - vencida:            rojo  · "+16 min"
 *
 * Props:
 *  - tolerance: resultado de getToleranceStatus
 */
export default function ToleranceBox({ tolerance }) {
  const { phase } = tolerance;

  const content = {
    upcoming: {
      tone: 'neutral',
      label: 'Inicio del bloque',
      value: `En ${formatMinutes(tolerance.minutesToStart)}`,
      note: `Empieza a las ${tolerance.startLabel}. La tolerancia es de ${TOLERANCE_MINUTES} min.`,
    },
    grace: {
      tone: 'warning',
      label: 'Tolerancia',
      value: `Faltan ${formatMinutes(tolerance.minutesLeft)}`,
      note: `Podrás marcar la inasistencia a las ${tolerance.deadlineLabel}.`,
    },
    expired: {
      tone: 'danger',
      label: 'Tolerancia vencida',
      value: `+${formatMinutes(tolerance.minutesLate)}`,
      note: tolerance.hasEnded ? 'El bloque ya terminó.' : null,
    },
  }[phase];

  return (
    <div className={cx(styles.root, styles[content.tone])} role="status">
      <p className={styles.label}>{content.label}</p>
      <p className={styles.value}>{content.value}</p>
      {content.note && <p className={styles.note}>{content.note}</p>}
    </div>
  );
}
