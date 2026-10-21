// src/components/features/availability/SelectionBar.jsx

import { useAvailability } from '../../../context/AvailabilityContext';
import { fechaConDia } from '../../../utils/fechasReserva';
import Button from '../../ui/Button/Button';
import ButtonLink from '../../ui/Button/ButtonLink';
import TextLink from '../../ui/TextLink/TextLink';
import ReservationModal from '../reservations/ReservationModal';
import styles from './SelectionBar.module.css';

/**
 * Barra bajo el calendario con el bloque elegido y "Reservar este bloque"
 * (mockup 3.4). Reservar NO es de la HU-3: abre el ReservationModal de la
 * HU-4, que valida tope, solapamiento y aforo y crea la reserva.
 */
export default function SelectionBar() {
  const {
    datos,
    seleccion,
    quitarSeleccion,
    usoSemanal,
    esVisitante,
    puedeReservar,
    puedeElegir,
    modalAbierto,
    abrirReserva,
    cerrarReserva,
    alReservar,
  } = useAvailability();

  if (!puedeElegir) return null; // el encargado solo consulta

  if (!seleccion) {
    return <p className={styles.hint}>Elige un bloque libre del calendario para reservarlo.</p>;
  }

  const { espacio, bloques } = datos;
  const bloque = bloques.find((b) => b.id === seleccion.bloqueId);
  const detalle = [
    espacio.nombre,
    `Aforo ${espacio.capacidad}`,
    usoSemanal && `Te quedan ${usoSemanal.restantes} de ${usoSemanal.tope} horas esta semana`,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <section className={styles.root} aria-label="Bloque seleccionado">
      <div className={styles.text}>
        <p className={styles.title}>
          {fechaConDia(seleccion.fecha)} · {bloque?.etiqueta}
        </p>
        <p className={styles.detail}>{detalle}</p>
      </div>

      <div className={styles.actions}>
        <TextLink onClick={quitarSeleccion}>Quitar selección</TextLink>
        {puedeReservar && <Button onClick={abrirReserva}>Reservar este bloque</Button>}
        {esVisitante && <ButtonLink to="/login">Inicia sesión para reservar</ButtonLink>}
      </div>

      {modalAbierto && (
        <ReservationModal
          key={`${espacio.id}-${seleccion.fecha}-${seleccion.bloqueId}`}
          espacioId={espacio.id}
          fecha={seleccion.fecha}
          bloqueId={seleccion.bloqueId}
          onClose={cerrarReserva}
          onSuccess={alReservar}
        />
      )}
    </section>
  );
}
