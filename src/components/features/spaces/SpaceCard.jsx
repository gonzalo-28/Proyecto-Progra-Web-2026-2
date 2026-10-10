// src/components/features/spaces/SpaceCard.jsx

import { Link } from 'react-router-dom';
import Card from '../../ui/Card/Card';
import ImagePlaceholder from '../../ui/ImagePlaceholder/ImagePlaceholder';
import Badge from '../../ui/Badge/Badge';
import styles from './SpaceCard.module.css';

const cx = (...classes) => classes.filter(Boolean).join(' ');

/**
 * Regla de disponibilidad del badge:
 *   0 bloques → danger · 1 o 2 → warning · 3 o más → success
 */
function getAvailability(freeBlocks) {
  if (freeBlocks <= 0) {
    return { tone: 'danger', label: 'Sin bloques libres hoy' };
  }
  const noun = freeBlocks === 1 ? 'bloque libre' : 'bloques libres';
  return {
    tone: freeBlocks <= 2 ? 'warning' : 'success',
    label: `${freeBlocks} ${noun} hoy`,
  };
}

/**
 * Tarjeta de un espacio: imagen, nombre, ubicación · aforo y badge de bloques libres.
 *
 * Props:
 *  - name, location ("Pabellón E"), capacity (número), freeBlocks (número)
 *  - imageLabel: texto del ImagePlaceholder ("foto E-201")
 *  - to:         si se pasa, TODA la tarjeta es clicable hacia esa ruta
 *  - className
 */
export default function SpaceCard({
  name,
  location,
  capacity,
  freeBlocks,
  imageLabel,
  to,
  className,
}) {
  const availability = getAvailability(freeBlocks);

  return (
    <Card
      as="article"
      padding="none"
      className={cx(styles.card, to && styles.linked, className)}
    >
      <ImagePlaceholder label={imageLabel} ratio="7/2" />

      <div className={styles.body}>
        <h3 className={styles.name}>
          {to ? (
            <Link to={to} className={styles.nameLink}>
              {name}
            </Link>
          ) : (
            name
          )}
        </h3>

        <p className={styles.meta}>
          {location} · Aforo {capacity}
        </p>

        <Badge tone={availability.tone} className={styles.badge}>
          {availability.label}
        </Badge>
      </div>
    </Card>
  );
}
