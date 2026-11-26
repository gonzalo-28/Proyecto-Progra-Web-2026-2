// src/components/features/search/SearchFiltersPanel.jsx

import { useState } from 'react';
import { useSpaceSearch } from '../../../context/SpaceSearchContext';
import { AFORO_MAXIMO, FILTROS_LIMPIOS } from '../../../utils/filtrosBusqueda';
import { toISODate } from '../../../utils/dates';
import Card from '../../ui/Card/Card';
import Select from '../../ui/Select/Select';
import DateField from '../../ui/DateField/DateField';
import Button from '../../ui/Button/Button';
import TextLink from '../../ui/TextLink/TextLink';
import FilterGroup from './FilterGroup';
import TypeFilter from './TypeFilter';
import CapacityFilter from './CapacityFilter';
import EquipmentFilter from './EquipmentFilter';
import TimeRangeFilter from './TimeRangeFilter';
import styles from './SearchFiltersPanel.module.css';

const TODAS_LAS_SEDES = { value: '', label: 'Todas las sedes' };

/**
 * Panel "Filtros" (mockup 3.1). El estudiante arma un BORRADOR y recién al
 * pulsar "Aplicar filtros" se escribe en la URL y se busca.
 *
 * El borrador nace de los filtros aplicados. La página monta el panel con
 * key={claveFiltros}: si un chip quita un filtro, el panel se reinicia solo.
 */
export default function SearchFiltersPanel() {
  const { opciones, filtros, aplicarFiltros } = useSpaceSearch();
  const [borrador, setBorrador] = useState(filtros);
  const cambiar = (cambios) => setBorrador((actual) => ({ ...actual, ...cambios }));

  const franjaInvalida = Boolean(borrador.desde && borrador.hasta && borrador.desde >= borrador.hasta);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!franjaInvalida) aplicarFiltros(borrador);
  };

  return (
    <Card as="aside" padding="md" className={styles.root} aria-labelledby="filtros-titulo">
      <form className={styles.form} onSubmit={handleSubmit} aria-label="Filtros de búsqueda">
        <h2 id="filtros-titulo" className={styles.title}>
          Filtros
        </h2>

        <FilterGroup title="Sede">
          <Select
            aria-label="Sede"
            options={[TODAS_LAS_SEDES, ...opciones.sedes]}
            value={borrador.sede}
            onChange={(event) => cambiar({ sede: event.target.value })}
          />
        </FilterGroup>

        <TypeFilter options={opciones.tipos} value={borrador.tipos} onChange={(tipos) => cambiar({ tipos })} />

        <CapacityFilter
          value={borrador.aforoMin}
          max={AFORO_MAXIMO}
          onChange={(aforoMin) => cambiar({ aforoMin })}
        />

        <EquipmentFilter
          options={opciones.equipamiento}
          value={borrador.equipamiento}
          onChange={(equipamiento) => cambiar({ equipamiento })}
        />

        <FilterGroup title="Día">
          <DateField
            aria-label="Día"
            value={borrador.dia}
            min={toISODate()}
            onChange={(event) => cambiar({ dia: event.target.value })}
            required
          />
        </FilterGroup>

        <TimeRangeFilter
          desde={borrador.desde}
          hasta={borrador.hasta}
          onChange={cambiar}
          errorMsg={franjaInvalida ? 'La hora final debe ser posterior a la inicial.' : undefined}
        />

        <div className={styles.actions}>
          <Button type="submit" fullWidth disabled={franjaInvalida}>
            Aplicar filtros
          </Button>
          <TextLink onClick={() => setBorrador((actual) => ({ ...actual, ...FILTROS_LIMPIOS }))}>
            Limpiar todo
          </TextLink>
        </div>
      </form>
    </Card>
  );
}
