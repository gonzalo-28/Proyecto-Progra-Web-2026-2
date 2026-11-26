// src/components/features/search/EquipmentFilter.jsx

import Chip from '../../ui/Chip/Chip';
import FilterGroup from './FilterGroup';
import styles from './EquipmentFilter.module.css';

/**
 * "Equipamiento": chips seleccionables (mockup 3.1). El espacio debe tener
 * TODOS los ítems marcados. Las opciones salen del equipamiento real (HU-2).
 *
 * Props: options [{ value, label }], value (nombres marcados), onChange(nuevos)
 */
export default function EquipmentFilter({ options, value, onChange }) {
  if (!options.length) return null;

  const alternar = (nombre) =>
    onChange(value.includes(nombre) ? value.filter((n) => n !== nombre) : [...value, nombre]);

  return (
    <FilterGroup title="Equipamiento">
      <div className={styles.chips}>
        {options.map((option) => (
          <Chip
            key={option.value}
            selected={value.includes(option.value)}
            onClick={() => alternar(option.value)}
          >
            {option.label}
          </Chip>
        ))}
      </div>
    </FilterGroup>
  );
}
