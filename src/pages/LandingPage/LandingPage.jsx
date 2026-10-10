// src/pages/LandingPage/LandingPage.jsx

import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import ContentLayout from '../../components/layout/ContentLayout/ContentLayout';
import ImagePlaceholder from '../../components/ui/ImagePlaceholder/ImagePlaceholder';
import SpaceSearchForm from '../../components/features/spaces/SpaceSearchForm';
import SpaceCard from '../../components/features/spaces/SpaceCard';
import InfoStrip from '../../components/features/spaces/InfoStrip';
import {
  getFeaturedSpaces,
  getSedeOptions,
  getSpaceTypeOptions,
} from '../../services/spaceService';
import { toISODate } from '../../utils/dates';

import styles from './LandingPage.module.css';

/* AJUSTAR a la ruta real del catálogo en tu AppRouter. */
const CATALOG_PATH = '/espacios';

const USAGE_RULES = [
  {
    title: 'Tope de 8 horas semanales',
    text: 'Cada estudiante reserva hasta 8 bloques por semana entre todos los espacios.',
  },
  {
    title: 'Tolerancia de 15 minutos',
    text: 'Pasada la tolerancia, el encargado puede marcar la inasistencia y liberar el bloque.',
  },
  {
    title: 'Cancelación con 2 horas',
    text: 'Cancela hasta 2 horas antes del inicio para no acumular inasistencias.',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();

  // Los datos salen de db.js a través de spaceService.
  const sedeOptions = useMemo(() => getSedeOptions(), []);
  const typeOptions = useMemo(() => getSpaceTypeOptions(), []);
  const featuredSpaces = useMemo(() => getFeaturedSpaces(toISODate()), []);

  // Lleva los filtros al catálogo como parámetros de la URL.
  const handleSearch = ({ sede, type, date }) => {
    const params = new URLSearchParams({ sede, tipo: type, dia: date });
    navigate({ pathname: CATALOG_PATH, search: `?${params.toString()}` });
  };

  return (
    <ContentLayout screen="landing" spacing="none">
      {/* ---- Hero ---- */}
      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.heroText}>
          <h1 id="hero-title" className={styles.title}>
            Reserva salas, laboratorios y cabinas del campus por bloques de una
            hora
          </h1>
          <p className={styles.subtitle}>
            Consulta la disponibilidad de la semana, elige tu bloque y confirma
            en menos de un minuto.
          </p>

          <SpaceSearchForm
            sedeOptions={sedeOptions}
            typeOptions={typeOptions}
            onSearch={handleSearch}
          />
        </div>

        <div className={styles.heroMedia}>
          <ImagePlaceholder label="fotografía · sala de estudio" rounded />
        </div>
      </section>

      {/* ---- Espacios destacados ---- */}
      <section className={styles.featured} aria-labelledby="featured-title">
        <div className={styles.featuredHeader}>
          <h2 id="featured-title" className={styles.sectionTitle}>
            Espacios destacados hoy
          </h2>
          <Link to={CATALOG_PATH} className={styles.catalogLink}>
            Ver todo el catálogo →
          </Link>
        </div>

        <ul className={styles.grid}>
          {featuredSpaces.map((space) => (
            <li key={space.id}>
              <SpaceCard
                name={space.name}
                location={space.location}
                capacity={space.capacity}
                freeBlocks={space.freeBlocks}
                imageLabel={`foto · ${space.name}`}
                to={`${CATALOG_PATH}/${space.id}`}
              />
            </li>
          ))}
        </ul>
      </section>

      {/* ---- Reglas clave ---- */}
      <InfoStrip items={USAGE_RULES} className={styles.strip} />
    </ContentLayout>
  );
}