// src/components/features/account/UsageCard.jsx

import Card from '../../ui/Card/Card';
import ProgressBar from '../../ui/ProgressBar/ProgressBar';
import styles from './UsageCard.module.css';

function absencesText(absences) {
  if (absences <= 0) return 'Sin inasistencias acumuladas.';
  return `${absences} ${absences === 1 ? 'inasistencia acumulada' : 'inasistencias acumuladas'}.`;
}

/**
 * "Uso de la semana": horas reservadas frente al tope semanal + inasistencias.
 * No calcula nada: recibe los números ya resueltos.
 *
 * Props:
 *  - used, limit: horas reservadas y tope semanal
 *  - rangeLabel:  '14/09 – 19/09'
 *  - absences:    inasistencias acumuladas
 */
export default function UsageCard({ used = 0, limit = 8, rangeLabel, absences = 0 }) {
  const summary = `${used} de ${limit} horas reservadas`;

  return (
    <Card as="section" aria-label="Uso de la semana">
      <p className={styles.eyebrow}>
        Uso de la semana{rangeLabel ? ` (${rangeLabel})` : ''}
      </p>
      <p className={styles.summary}>{summary}</p>
      <ProgressBar value={used} max={limit} label={summary} className={styles.bar} />
      <p className={styles.note}>{absencesText(absences)}</p>
    </Card>
  );
}
