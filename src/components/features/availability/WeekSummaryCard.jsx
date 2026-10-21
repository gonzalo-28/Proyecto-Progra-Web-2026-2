// src/components/features/availability/WeekSummaryCard.jsx

import { useAvailability } from '../../../context/AvailabilityContext';
import Card from '../../ui/Card/Card';
import styles from './WeekSummaryCard.module.css';

/**
 * "Resumen de la semana": bloques libres, ocupados y mis reservas (mockup 3.4).
 * Con una franja aplicada, los números son solo de esa franja.
 */
export default function WeekSummaryCard() {
  const { datos, franja, esVisitante } = useAvailability();
  const { resumen } = datos;

  const filas = [
    { label: 'Bloques libres', valor: resumen.libre },
    { label: 'Bloques ocupados', valor: resumen.ocupado + resumen.propia },
    !esVisitante && { label: 'Mis reservas', valor: resumen.propia, destacado: true },
  ].filter(Boolean);

  return (
    <Card as="section" padding="md" aria-labelledby="resumen-semana">
      <h2 id="resumen-semana" className={styles.eyebrow}>
        {franja ? 'Resumen en la franja elegida' : 'Resumen de la semana'}
      </h2>
      <dl className={styles.list}>
        {filas.map((fila) => (
          <div key={fila.label} className={styles.row}>
            <dt>{fila.label}</dt>
            <dd className={fila.destacado ? styles.highlight : undefined}>{fila.valor}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}
