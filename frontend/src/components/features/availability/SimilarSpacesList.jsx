// src/components/features/availability/SimilarSpacesList.jsx

import { Link } from 'react-router-dom';
import { useAvailability } from '../../../context/AvailabilityContext';
import { rutaDisponibilidad } from '../../routes/rutasEspacios';
import Skeleton from '../../ui/Skeleton/Skeleton';
import styles from './SimilarSpacesList.module.css';

/**
 * "Espacios similares con disponibilidad" (mockup 3.6). Cada enlace abre el
 * calendario de ese espacio con la MISMA semana y franja.
 */
export default function SimilarSpacesList() {
  const { datos, franja, espaciosSimilares } = useAvailability();
  const { semana } = datos;

  if (espaciosSimilares.cargando) {
    return (
      <div className={styles.root} role="status" aria-label="Buscando espacios similares">
        <Skeleton height="20px" width="70%" />
        <Skeleton height="20px" width="55%" />
      </div>
    );
  }

  if (!espaciosSimilares.lista.length) return null;

  return (
    <section className={styles.root} aria-labelledby="similares-titulo">
      <h2 id="similares-titulo" className={styles.eyebrow}>
        Espacios similares con disponibilidad
      </h2>
      <ul className={styles.list}>
        {espaciosSimilares.lista.map((similar) => (
          <li key={similar.id} className={styles.item}>
            <span>
              {similar.nombre} · Aforo {similar.capacidad}
            </span>
            <Link
              className={styles.link}
              to={rutaDisponibilidad(similar.id, {
                semana: semana.desde,
                desde: franja?.desde,
                hasta: franja?.hasta,
              })}
            >
              {similar.bloquesLibres} {similar.bloquesLibres === 1 ? 'bloque libre' : 'bloques libres'} →
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
