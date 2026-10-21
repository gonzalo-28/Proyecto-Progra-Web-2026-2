// src/components/features/availability/WeekNavigator.jsx

import Button from '../../ui/Button/Button';
import styles from './WeekNavigator.module.css';

/**
 * Botones ‹ Hoy › para moverse entre semanas (mockups 3.4–3.6).
 * Presentacional: no sabe de fechas, solo avisa.
 *
 * Props:
 *  - onPrevious, onToday, onNext
 *  - isCurrentWeek: deshabilita "‹" y "Hoy" (no se reserva en semanas pasadas)
 *  - disabled:      mientras carga
 */
export default function WeekNavigator({ onPrevious, onToday, onNext, isCurrentWeek, disabled }) {
  return (
    <nav className={styles.root} aria-label="Cambiar de semana">
      <Button
        variant="outline"
        size="sm"
        onClick={onPrevious}
        disabled={disabled || isCurrentWeek}
        aria-label="Semana anterior"
      >
        ‹
      </Button>
      <Button variant="outline" size="sm" onClick={onToday} disabled={disabled || isCurrentWeek}>
        Hoy
      </Button>
      <Button variant="outline" size="sm" onClick={onNext} disabled={disabled} aria-label="Semana siguiente">
        ›
      </Button>
    </nav>
  );
}
