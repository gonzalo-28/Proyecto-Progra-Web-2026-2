// src/components/features/search/ActiveFilters.jsx

import { useSpaceSearch } from '../../../context/SpaceSearchContext';
import Chip from '../../ui/Chip/Chip';
import TextLink from '../../ui/TextLink/TextLink';
import styles from './ActiveFilters.module.css';

/**
 * "Filtros activos: Sala de estudio grupal ✕ · Aforo ≥ 6 ✕ … Limpiar todo"
 * (mockup 3.1). Cada ✕ quita solo ese filtro; no se muestra si no hay ninguno.
 */
export default function ActiveFilters() {
  const { chips, quitarFiltro, limpiarTodo } = useSpaceSearch();
  if (!chips.length) return null;

  return (
    <div className={styles.root}>
      <span className={styles.label}>Filtros activos:</span>
      <ul className={styles.list}>
        {chips.map((chip) => (
          <li key={chip.clave}>
            <Chip onRemove={() => quitarFiltro(chip.quitar)}>{chip.etiqueta}</Chip>
          </li>
        ))}
      </ul>
      <TextLink onClick={limpiarTodo}>Limpiar todo</TextLink>
    </div>
  );
}
