// src/components/features/search/SpaceResultCard.jsx

import { Link } from 'react-router-dom';
import Card from '../../ui/Card/Card';
import ImagePlaceholder from '../../ui/ImagePlaceholder/ImagePlaceholder';
import styles from './SpaceResultCard.module.css';

/**
 * Tarjeta de un resultado (mockup 3.1): foto, nombre, código · pabellón ·
 * aforo, equipamiento, "Próximo libre HH:MM" y "Reservar".
 * Presentacional: recibe el resultado y a dónde lleva.
 *
 * Props:
 *  - espacio: resultado de buscarEspacios (vistaEspacio + proximoLibre)
 *  - to:      ruta del calendario del espacio con el día y la franja buscados
 *  - fichaTo: ruta de la ficha pública del espacio (HU-2)
 */
export default function SpaceResultCard({ espacio, to, fichaTo }) {
  const meta = [espacio.codigo, espacio.pabellon, `Aforo ${espacio.capacidad}`].filter(Boolean).join(' · ');
  const equipos = espacio.equipamiento.map((item) => item.nombre).join(' · ');
  // La última palabra suele ser el código ("A-410"): no se corta en el guion.
  const corte = espacio.nombre.lastIndexOf(' ');
  const inicioNombre = corte > 0 ? espacio.nombre.slice(0, corte + 1) : '';
  const finNombre = espacio.nombre.slice(corte + 1);

  return (
    <Card as="article" padding="none" className={styles.root}>
      <ImagePlaceholder label={`foto ${espacio.codigo || espacio.nombre}`} className={styles.photo} />

      <div className={styles.body}>
        <h2 className={styles.name}>
          <Link to={fichaTo} className={styles.nameLink} title="Ver ficha del espacio">
            {inicioNombre}
            <span className={styles.noWrap}>{finNombre}</span>
          </Link>
        </h2>
        <p className={styles.meta}>{meta}</p>
        {equipos && <p className={styles.meta}>{equipos}</p>}

        <div className={styles.footer}>
          <span className={styles.next}>Próximo libre {espacio.proximoLibre.horaInicio}</span>
          <Link to={to} className={styles.action} aria-label={`Reservar ${espacio.nombre}`}>
            Reservar
          </Link>
        </div>
      </div>
    </Card>
  );
}
