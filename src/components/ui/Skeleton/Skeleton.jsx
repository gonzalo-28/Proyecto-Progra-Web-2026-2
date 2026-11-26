// src/components/ui/Skeleton/Skeleton.jsx

import styles from './Skeleton.module.css';

const cx = (...classes) => classes.filter(Boolean).join(' ');

/**
 * Bloque gris animado que ocupa el lugar del contenido mientras carga
 * (mockup 3.3, "Buscando espacios disponibles…"). Es decorativo: el texto de
 * carga para lectores de pantalla lo pone quien lo usa (role="status").
 *
 * Props:
 *  - width, height: medidas CSS ('100%', '120px', '2rem'…). Por defecto 100% × 1em.
 *  - radius:  'sm' | 'md' | 'lg' | 'pill'
 *  - className
 */
export default function Skeleton({ width = '100%', height = '1em', radius = 'sm', className }) {
  return (
    <span
      className={cx(styles.root, styles[radius], className)}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}