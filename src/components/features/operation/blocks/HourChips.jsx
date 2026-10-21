// src/components/features/operation/blocks/HourChips.jsx

import styles from './HourChips.module.css';

const cx = (...classes) => classes.filter(Boolean).join(' ');

/**
 * Chips de horas del mockup 5.4 ("07:00 08:00 09:00…").
 * Con "Todo el día" se ven todos marcados y no se pueden tocar; con
 * "Rango horario" cada chip se marca o desmarca.
 *
 * Props:
 *  - bloques:   [{ id, horaInicio, horaFin }]
 *  - selected:  ids marcados
 *  - allDay:    true = todos incluidos (solo lectura)
 *  - onToggle:  (bloqueId) => void
 *  - errorMsg
 */
export default function HourChips({ bloques = [], selected = [], allDay = false, onToggle, errorMsg }) {
  return (
    <div className={styles.root}>
      <div className={styles.list} role="group" aria-label="Bloques horarios">
        {bloques.map((bloque) => {
          const active = allDay || selected.includes(bloque.id);
          return (
            <button
              key={bloque.id}
              type="button"
              className={cx(styles.chip, active && styles.active, allDay && styles.locked)}
              aria-pressed={active}
              disabled={allDay}
              onClick={() => onToggle(bloque.id)}
              title={`${bloque.horaInicio} – ${bloque.horaFin}`}
            >
              {bloque.horaInicio}
            </button>
          );
        })}
      </div>
      {errorMsg && (
        <p className={styles.error} role="alert">
          {errorMsg}
        </p>
      )}
    </div>
  );
}
