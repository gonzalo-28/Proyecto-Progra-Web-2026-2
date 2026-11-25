// src/components/features/search/ResultsSkeleton.jsx

import Card from '../../ui/Card/Card';
import Skeleton from '../../ui/Skeleton/Skeleton';
import styles from './ResultsSkeleton.module.css';

const TARJETAS = 4;

/** Esqueletos con la forma de las tarjetas mientras se busca (mockup 3.3). */
export default function ResultsSkeleton() {
  return (
    <div className={styles.grid} role="status" aria-label="Buscando espacios disponibles">
      {Array.from({ length: TARJETAS }, (_, i) => (
        <Card key={i} padding="none" className={styles.card}>
          <Skeleton height="100%" radius="sm" className={styles.photo} />
          <div className={styles.body}>
            <Skeleton width="75%" height="20px" />
            <Skeleton width="55%" />
            <Skeleton width="45%" />
            <Skeleton width="40%" height="28px" className={styles.badge} />
          </div>
        </Card>
      ))}
    </div>
  );
}
