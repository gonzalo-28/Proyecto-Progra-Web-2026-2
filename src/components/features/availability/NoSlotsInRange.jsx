// src/components/features/availability/NoSlotsInRange.jsx

import { useAvailability } from '../../../context/AvailabilityContext';
import Button from '../../ui/Button/Button';
import SimilarSpacesList from './SimilarSpacesList';
import styles from './NoSlotsInRange.module.css';

/**
 * Estado vacío cuando la franja elegida no tiene ningún bloque libre en la
 * semana (mockup 3.6). Reemplaza al calendario.
 */
export default function NoSlotsInRange() {
  const { datos, franja, irASemana, ampliarATodoElDia } = useAvailability();
  const { espacio, semana } = datos;

  return (
    <div className={styles.root} role="status">
      <span className={styles.icon} aria-hidden="true">
        ▦
      </span>
      <h2 className={styles.title}>
        Sin bloques libres entre {franja.desde || 'la apertura'} y {franja.hasta || 'el cierre'}
      </h2>
      <p className={styles.text}>
        {espacio.nombre} no tiene bloques disponibles en la franja elegida.
        <br />
        Amplía el rango horario o revisa otro espacio del mismo tipo.
      </p>

      <div className={styles.actions}>
        <Button variant="outline" onClick={ampliarATodoElDia}>
          Ampliar a todo el día
        </Button>
        <Button onClick={() => irASemana(semana.siguiente)}>Ver la próxima semana</Button>
      </div>

      <SimilarSpacesList />
    </div>
  );
}
