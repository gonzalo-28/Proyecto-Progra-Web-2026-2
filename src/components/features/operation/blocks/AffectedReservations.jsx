// src/components/features/operation/blocks/AffectedReservations.jsx

import Card from '../../../ui/Card/Card';
import { formatShortDate } from '../../../../utils/dates';
import styles from './AffectedReservations.module.css';

/**
 * "N reservas se cancelarán" (mockup 5.4): lista de reservas confirmadas que
 * el bloqueo cancelaría, con el aviso de que no generan inasistencia.
 *
 * Props:
 *  - afectadas: vistas de reserva (preview.afectadas)
 */
export default function AffectedReservations({ afectadas = [] }) {
  const total = afectadas.length;
  const title =
    total === 0
      ? 'Ninguna reserva se cancelará'
      : `${total} ${total === 1 ? 'reserva se cancelará' : 'reservas se cancelarán'}`;

  return (
    <Card as="section" padding="lg">
      <h2 className={styles.title}>{title}</h2>

      {total > 0 ? (
        <>
          <ul className={styles.list}>
            {afectadas.map((reserva) => (
              <li key={reserva.id} className={styles.item}>
                <span>
                  {reserva.codigo} · {reserva.estudiante.nombreCompleto}
                </span>
                <span className={styles.when}>
                  {formatShortDate(reserva.fecha)} {reserva.horaInicio}
                </span>
              </li>
            ))}
          </ul>
          <p className={styles.notice}>
            Cada estudiante afectado verá el motivo del bloqueo en el detalle de su reserva. Estas
            cancelaciones no generan inasistencias.
          </p>
        </>
      ) : (
        <p className={styles.empty}>No hay reservas confirmadas en esos días y bloques.</p>
      )}
    </Card>
  );
}
