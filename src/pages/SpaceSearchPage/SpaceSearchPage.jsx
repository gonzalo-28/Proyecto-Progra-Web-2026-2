// src/pages/SpaceSearchPage/SpaceSearchPage.jsx
//
// HU-3 · Búsqueda de espacios con filtros, orden y filtros activos
// (mockups 3.1, 3.2 y 3.3). Ruta pública: el visitante también busca; para
// reservar, el calendario le pedirá iniciar sesión.
//
// La página solo COMPONE. Los datos y las acciones viven en
// SpaceSearchProvider y cada pieza los lee con useSpaceSearch().

import ContentLayout from '../../components/layout/ContentLayout/ContentLayout';
import Card from '../../components/ui/Card/Card';
import Skeleton from '../../components/ui/Skeleton/Skeleton';
import ActiveFilters from '../../components/features/search/ActiveFilters';
import ResultsHeader from '../../components/features/search/ResultsHeader';
import SearchFiltersPanel from '../../components/features/search/SearchFiltersPanel';
import SearchResults from '../../components/features/search/SearchResults';
import { SpaceSearchProvider } from '../../context/SpaceSearchProvider';
import { useSpaceSearch } from '../../context/SpaceSearchContext';
import styles from './SpaceSearchPage.module.css';

export default function SpaceSearchPage() {
  return (
    <ContentLayout screen="search" className={styles.page}>
      <SpaceSearchProvider>
        <SearchContent />
      </SpaceSearchProvider>
    </ContentLayout>
  );
}

function SearchContent() {
  const { opciones, claveFiltros } = useSpaceSearch();

  return (
    <div className={styles.layout}>
      {opciones ? (
        // key: si los filtros aplicados cambian (chip ✕, "Limpiar todo", Atrás),
        // el panel vuelve a nacer con ellos como borrador.
        <SearchFiltersPanel key={claveFiltros} />
      ) : (
        <Card padding="md" className={styles.panelLoading} aria-hidden="true">
          <Skeleton width="40%" height="22px" />
          <Skeleton height="40px" />
          <Skeleton height="120px" />
          <Skeleton height="40px" />
        </Card>
      )}

      <section className={styles.results} aria-label="Resultados de la búsqueda">
        <ResultsHeader />
        <ActiveFilters />
        <SearchResults />
      </section>
    </div>
  );
}
