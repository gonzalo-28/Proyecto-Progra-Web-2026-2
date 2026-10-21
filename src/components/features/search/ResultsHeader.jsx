// src/components/features/search/ResultsHeader.jsx

import { useSpaceSearch } from '../../../context/SpaceSearchContext';
import { textoResultados } from '../../../utils/filtrosBusqueda';
import Select from '../../ui/Select/Select';
import styles from './ResultsHeader.module.css';

/** "Espacios disponibles" + cantidad de resultados + "Ordenar" (mockup 3.1). */
export default function ResultsHeader() {
  const { opciones, filtros, total, cargando, cambiarOrden } = useSpaceSearch();
  const ordenes = (opciones?.ordenes ?? []).map((orden) => ({
    value: orden.value,
    label: `Ordenar: ${orden.label.toLowerCase()}`,
  }));

  return (
    <header className={styles.root}>
      <div>
        <h1 className={styles.title}>Espacios disponibles</h1>
        <p className={styles.subtitle} aria-live="polite">
          {cargando ? 'Buscando espacios disponibles…' : textoResultados(total, filtros)}
        </p>
      </div>

      {ordenes.length > 0 && (
        <Select
          aria-label="Ordenar resultados"
          options={ordenes}
          value={filtros.orden}
          onChange={(event) => cambiarOrden(event.target.value)}
          className={styles.sort}
        />
      )}
    </header>
  );
}
