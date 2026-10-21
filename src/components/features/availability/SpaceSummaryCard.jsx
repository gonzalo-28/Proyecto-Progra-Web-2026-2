// src/components/features/availability/SpaceSummaryCard.jsx

import { useAvailability } from '../../../context/AvailabilityContext';
import Card from '../../ui/Card/Card';
import Badge from '../../ui/Badge/Badge';
import ImagePlaceholder from '../../ui/ImagePlaceHolder/ImagePlaceholder';
import styles from './SpaceSummaryCard.module.css';

const ESTADO_ESPACIO = {
  disponible: { tone: 'success', label: 'Disponible' },
  mantenimiento: { tone: 'warning', label: 'En mantenimiento' },
  baja: { tone: 'danger', label: 'De baja' },
};

/** "Computadoras (30) · Proyector · Pizarra acrílica (2)" */
const textoEquipamiento = (equipamiento) =>
  equipamiento
    .map((item) => (item.cantidad > 1 ? `${item.nombre} (${item.cantidad})` : item.nombre))
    .join(' · ');

/**
 * Ficha resumida del espacio en la columna derecha (mockup 3.4): foto,
 * estado, nombre, ubicación, aforo y equipamiento.
 *
 * "Ver ficha completa →" (mockup 2.6) es de la HU-2. Cuando exista su ruta,
 * se agrega aquí un TextLink hacia ella.
 */
export default function SpaceSummaryCard() {
  const { datos } = useAvailability();
  const { espacio } = datos;
  const estado = ESTADO_ESPACIO[espacio.estado] ?? { tone: 'warning', label: espacio.estado };
  const ubicacion = [espacio.ubicacion, `Aforo ${espacio.capacidad}`].filter(Boolean).join(' · ');

  return (
    <Card as="section" padding="none" className={styles.root} aria-labelledby="ficha-espacio">
      <ImagePlaceholder label={`foto ${espacio.codigo || espacio.nombre}`} ratio="16/7" />
      <div className={styles.body}>
        <Badge tone={estado.tone} className={styles.badge}>
          {estado.label}
        </Badge>
        <h2 id="ficha-espacio" className={styles.name}>
          {espacio.nombre}
        </h2>
        <p className={styles.meta}>{ubicacion}</p>
        <p className={styles.meta}>
          {espacio.equipamiento.length ? textoEquipamiento(espacio.equipamiento) : 'Sin equipamiento registrado'}
        </p>
      </div>
    </Card>
  );
}
