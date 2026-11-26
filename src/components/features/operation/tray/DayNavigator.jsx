// src/components/features/operation/tray/DayNavigator.jsx

import Button from '../../../ui/Button/Button';
import { addDays } from '../../../../utils/dates';
import styles from './DayNavigator.module.css';

/**
 * Navegación entre jornadas: ‹ Hoy › (mockups 5.1 y 5.2).
 *
 * Props:
 *  - date:     día mostrado, 'YYYY-MM-DD'
 *  - today:    hoy, 'YYYY-MM-DD'
 *  - onChange(iso): se llama con el nuevo día
 */
export default function DayNavigator({ date, today, onChange }) {
  return (
    <div className={styles.root} role="group" aria-label="Cambiar de día">
      <Button
        variant="outline"
        size="md"
        className={styles.arrow}
        onClick={() => onChange(addDays(date, -1))}
        aria-label="Día anterior"
      >
        ‹
      </Button>
      <Button
        variant="outline"
        size="md"
        onClick={() => onChange(today)}
        aria-pressed={date === today}
      >
        Hoy
      </Button>
      <Button
        variant="outline"
        size="md"
        className={styles.arrow}
        onClick={() => onChange(addDays(date, 1))}
        aria-label="Día siguiente"
      >
        ›
      </Button>
    </div>
  );
}
