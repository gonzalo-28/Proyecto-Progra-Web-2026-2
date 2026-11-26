// src/components/features/search/CapacityFilter.jsx

import { useId } from 'react';
import FilterGroup from './FilterGroup';
import styles from './CapacityFilter.module.css';

/**
 * "Aforo mínimo" con deslizador (mockup 3.1). 0 = sin mínimo.
 *
 * Props: value (número), max, onChange(numero)
 */
export default function CapacityFilter({ value, max, onChange }) {
  const id = useId();
  const texto = value > 0 ? `${value} ${value === 1 ? 'persona' : 'personas'} o más` : 'Sin mínimo';

  return (
    <FilterGroup title="Aforo mínimo">
      <input
        id={id}
        type="range"
        min={0}
        max={max}
        step={1}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className={styles.range}
        aria-valuetext={texto}
        aria-label="Aforo mínimo"
      />
      <output htmlFor={id} className={styles.value}>
        {texto}
      </output>
    </FilterGroup>
  );
}
