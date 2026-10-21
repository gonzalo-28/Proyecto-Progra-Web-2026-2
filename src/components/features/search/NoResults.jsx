// src/components/features/search/NoResults.jsx

import { useSpaceSearch } from '../../../context/SpaceSearchContext';
import { mensajeSinResultados } from '../../../utils/filtrosBusqueda';
import Button from '../../ui/Button/Button';
import styles from './NoResults.module.css';

/**
 * "Ningún espacio cumple estos filtros" (mockup 3.2). El texto se arma con
 * los filtros reales y ofrece la salida más probable: quitar el aforo.
 */
export default function NoResults() {
  const { filtros, opciones, quitarFiltro, limpiarTodo } = useSpaceSearch();
  const { texto, sugerencia } = mensajeSinResultados(filtros, opciones);

  return (
    <div className={styles.root} role="status">
      <span className={styles.icon} aria-hidden="true">
        ⌕
      </span>
      <h2 className={styles.title}>Ningún espacio cumple estos filtros</h2>
      <p className={styles.text}>
        {texto}
        <br />
        {sugerencia}
      </p>

      <div className={styles.actions}>
        {filtros.aforoMin > 0 && (
          <Button variant="outline" onClick={() => quitarFiltro({ aforoMin: 0 })}>
            Quitar el aforo
          </Button>
        )}
        <Button onClick={limpiarTodo}>Limpiar filtros</Button>
      </div>
    </div>
  );
}
