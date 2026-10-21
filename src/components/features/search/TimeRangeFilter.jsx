// src/components/features/search/TimeRangeFilter.jsx

import TextField from '../../ui/TextField/TextField';
import FilterGroup from './FilterGroup';
import styles from './TimeRangeFilter.module.css';

/**
 * "Franja horaria": desde – hasta (mockup 3.1). Vacío = todo el día.
 *
 * Props: desde, hasta ('HH:MM' o ''), onChange({ desde, hasta }), errorMsg
 */
export default function TimeRangeFilter({ desde, hasta, onChange, errorMsg }) {
  return (
    <FilterGroup title="Franja horaria">
      <div className={styles.row}>
        <TextField
          type="time"
          aria-label="Desde"
          value={desde}
          step={3600}
          onChange={(event) => onChange({ desde: event.target.value, hasta })}
        />
        <TextField
          type="time"
          aria-label="Hasta"
          value={hasta}
          step={3600}
          onChange={(event) => onChange({ desde, hasta: event.target.value })}
          errorMsg={errorMsg}
        />
      </div>
    </FilterGroup>
  );
}
