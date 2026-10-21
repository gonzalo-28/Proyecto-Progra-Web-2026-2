// src/pages/SpaceCatalogPage/SpaceCatalogPage.jsx

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button/Button';
import ButtonLink from '../../components/ui/Button/ButtonLink';
import Card from '../../components/ui/Card/Card';
import Select from '../../components/ui/Select/Select';
import TextField from '../../components/ui/TextField/Textfield';
import ContentLayout from '../../components/layout/ContentLayout/ContentLayout';
import { getCatalogSpaces, getSpaceCatalogOptions } from '../../services/spaceCatalogService';
import styles from './SpaceCatalogPage.module.css';

function FilterChip({ children, onRemove, label }) {
  return (
    <button type="button" className={styles.filterChip} onClick={onRemove} aria-label={`Quitar filtro: ${label}`}>
      {children}<span aria-hidden="true"> ×</span>
    </button>
  );
}

export default function SpaceCatalogPage() {
  const navigate = useNavigate();
  const spaces = useMemo(() => getCatalogSpaces(), []);
  const options = useMemo(() => getSpaceCatalogOptions(), []);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [state, setState] = useState('');
  const [pavilion, setPavilion] = useState('');

  const typeFilterOptions = [
    { value: '', label: 'Tipo: Todos' },
    ...options.types.map((option) => ({ ...option, label: `Tipo: ${option.label}` })),
  ];
  const stateFilterOptions = [
    { value: '', label: 'Estado: Todos' },
    { value: 'disponible', label: 'Estado: Disponible' },
    { value: 'mantenimiento', label: 'Estado: Mantenimiento' },
    { value: 'baja', label: 'Estado: De baja' },
  ];
  const pavilionFilterOptions = [
    { value: '', label: 'Pabellón: Todos' },
    ...options.pavilions.map((option) => ({ ...option, label: `Pabellón: ${option.label}` })),
  ];

  const filteredSpaces = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('es');
    return spaces.filter((space) => {
      const matchesQuery = !query || `${space.codigo} ${space.nombre}`.toLocaleLowerCase('es').includes(query);
      return matchesQuery && (!type || space.tipo === type) && (!state || space.estado === state) && (!pavilion || space.pabellon === pavilion);
    });
  }, [spaces, search, type, state, pavilion]);

  const clearFilters = () => {
    setSearch('');
    setType('');
    setState('');
    setPavilion('');
  };

  const hasFilters = Boolean(search.trim() || type || state || pavilion);
  const selectedTypeLabel = options.types.find((option) => option.value === type)?.label;
  const selectedStateLabel = stateFilterOptions.find((option) => option.value === state)?.label.replace('Estado: ', '');
  const emptyMessage = type && state && pavilion
    ? `No hay espacios de tipo «${selectedTypeLabel}» en estado «${selectedStateLabel}» en ${pavilion === 'Biblioteca' ? 'la ' : ''}${pavilion}.`
    : 'No hay espacios que coincidan con los criterios seleccionados.';

  return (
    <ContentLayout screen="spaceCatalog" className={styles.layout} spacing="none">
      <section className={styles.page} aria-labelledby="catalog-title">
        <header className={styles.header}>
          <div>
            <h1 id="catalog-title" className={styles.title}>Espacios</h1>
            <p className={styles.subtitle}>{spaces.length} espacios en Campus Monterrico</p>
          </div>
          <ButtonLink to="/encargado/espacios/nuevo">＋ Nuevo espacio</ButtonLink>
        </header>

        <Card className={styles.filterPanel} padding="md">
          <div className={styles.filters}>
            <TextField
              aria-label="Buscar por código o nombre"
              placeholder="Buscar por código o nombre…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <Select aria-label="Filtrar por tipo" value={type} onChange={(event) => setType(event.target.value)} options={typeFilterOptions} />
            <Select aria-label="Filtrar por estado" value={state} onChange={(event) => setState(event.target.value)} options={stateFilterOptions} />
            <Select aria-label="Filtrar por pabellón" value={pavilion} onChange={(event) => setPavilion(event.target.value)} options={pavilionFilterOptions} />
          </div>

        </Card>

        {hasFilters && filteredSpaces.length > 0 && (
          <div className={styles.activeFilters}>
            <span className={styles.activeLabel}>Filtros activos:</span>
            <div className={styles.chips}>
              {search.trim() && <FilterChip label="búsqueda" onRemove={() => setSearch('')}>Búsqueda: {search.trim()}</FilterChip>}
              {type && <FilterChip label="tipo" onRemove={() => setType('')}>Tipo: {options.types.find((option) => option.value === type)?.label}</FilterChip>}
              {state && <FilterChip label="estado" onRemove={() => setState('')}>Estado: {state === 'baja' ? 'De baja' : state === 'mantenimiento' ? 'Mantenimiento' : 'Disponible'}</FilterChip>}
              {pavilion && <FilterChip label="pabellón" onRemove={() => setPavilion('')}>Pabellón: {pavilion}</FilterChip>}
            </div>
            <button type="button" className={styles.clearButton} onClick={clearFilters}>Limpiar todo</button>
          </div>
        )}

        {filteredSpaces.length > 0 ? (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Código</th>
                  <th scope="col">Nombre</th>
                  <th scope="col">Pabellón</th>
                  <th scope="col">Tipo</th>
                  <th scope="col">Aforo</th>
                  <th scope="col">Estado</th>
                  <th scope="col">Reservas vigentes</th>
                  <th scope="col"><span className={styles.srOnly}>Acciones</span></th>
                </tr>
              </thead>
              <tbody>
                {filteredSpaces.map((space) => (
                  <tr key={space.id}>
                    <td className={styles.code}>{space.codigo}</td>
                    <td className={styles.name}>{space.nombre}</td>
                    <td>{space.pabellon}</td>
                    <td>{space.tipoLabel}</td>
                    <td>{space.capacidad}</td>
                    <td><span className={`${styles.status} ${styles[space.estado]}`}>{space.estadoLabel}</span></td>
                    <td>{space.reservasVigentes}</td>
                  <td><button type="button" className={styles.editButton} onClick={() => navigate(`/encargado/espacios/${space.id}/equipamiento`)}>Editar</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Card className={styles.emptyState} padding="lg">
            <span className={styles.emptyIcon} aria-hidden="true">▤</span>
            <h2>Sin resultados para estos filtros</h2>
            <p>{emptyMessage}</p>
            <div className={styles.emptyActions}>
              <Button variant="outline" onClick={clearFilters}>Limpiar todo</Button>
              <ButtonLink to="/encargado/espacios/nuevo">＋ Nuevo espacio</ButtonLink>
            </div>
          </Card>
        )}
      </section>
    </ContentLayout>
  );
}
