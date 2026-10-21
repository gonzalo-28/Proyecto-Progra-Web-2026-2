// src/components/features/search/TypeFilter.jsx

import Checkbox from '../../ui/Checkbox/Checkbox';
import FilterGroup from './FilterGroup';

/**
 * "Tipo de espacio": una casilla por tipo, se pueden marcar varios (mockup 3.1).
 *
 * Props:
 *  - options:  [{ value, label }]
 *  - value:    ids marcados
 *  - onChange(nuevosIds)
 */
export default function TypeFilter({ options, value, onChange }) {
  const alternar = (tipo) =>
    onChange(value.includes(tipo) ? value.filter((t) => t !== tipo) : [...value, tipo]);

  return (
    <FilterGroup title="Tipo de espacio">
      {options.map((option) => (
        <Checkbox
          key={option.value}
          label={option.label}
          checked={value.includes(option.value)}
          onChange={() => alternar(option.value)}
        />
      ))}
    </FilterGroup>
  );
}
