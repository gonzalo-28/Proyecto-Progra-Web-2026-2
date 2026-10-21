// src/components/features/availability/AvailabilitySkeleton.jsx

import Card from '../../ui/Card/Card';
import Skeleton from '../../ui/Skeleton/Skeleton';
import styles from './AvailabilitySkeleton.module.css';

const FILAS = 6;
const COLUMNAS = 6;

/** Primera carga de la página: el esqueleto tiene la forma real del calendario. */
export default function AvailabilitySkeleton() {
  return (
    <div className={styles.root} role="status" aria-label="Cargando disponibilidad">
      <div className={styles.header}>
        <Skeleton width="45%" height="32px" />
        <Skeleton width="25%" height="16px" />
      </div>
      <div className={styles.layout}>
        <Card padding="lg" className={styles.grid}>
          {Array.from({ length: FILAS * COLUMNAS }, (_, i) => (
            <Skeleton key={i} height="32px" />
          ))}
        </Card>
        <Card padding="md" className={styles.aside}>
          <Skeleton height="120px" radius="md" />
          <Skeleton width="70%" height="20px" />
          <Skeleton width="50%" />
        </Card>
      </div>
    </div>
  );
}
