// src/components/features/search/SearchResults.jsx

import { useSpaceSearch } from '../../../context/SpaceSearchContext';
import { rutaDisponibilidad, rutaFichaPublica } from '../../routes/rutasEspacios';
import Alert from '../../ui/Alert/Alert';
import Button from '../../ui/Button/Button';
import Pagination from '../../ui/Pagination/Pagination';
import NoResults from './NoResults';
import ResultsSkeleton from './ResultsSkeleton';
import SpaceResultCard from './SpaceResultCard';
import styles from './SearchResults.module.css';

/**
 * Zona de resultados: error, cargando (3.3), vacío (3.2) o las tarjetas con
 * paginación (3.1). "Reservar" abre el calendario del espacio en la semana
 * del día buscado y con la misma franja horaria; el nombre abre la ficha
 * pública de la HU-2.
 */
export default function SearchResults() {
  const { filtros, cargando, error, total, resultados, pagina, totalPaginas, irAPagina, reintentar } =
    useSpaceSearch();

  if (error) {
    return (
      <Alert variant="error">
        {error.message || 'No pudimos completar la búsqueda.'}{' '}
        <Button variant="ghost" size="sm" onClick={reintentar}>
          Reintentar
        </Button>
      </Alert>
    );
  }

  if (cargando) return <ResultsSkeleton />;
  if (total === 0) return <NoResults />;

  return (
    <div className={styles.root}>
      <ul className={styles.grid}>
        {resultados.map((espacio) => (
          <li key={espacio.id}>
            <SpaceResultCard
              espacio={espacio}
              to={rutaDisponibilidad(espacio.id, {
                semana: filtros.dia,
                desde: filtros.desde,
                hasta: filtros.hasta,
              })}
              fichaTo={rutaFichaPublica(espacio.id)}
            />
          </li>
        ))}
      </ul>

      <Pagination
        page={pagina}
        totalPages={totalPaginas}
        onChange={irAPagina}
        label="Páginas de resultados"
      />
    </div>
  );
}
