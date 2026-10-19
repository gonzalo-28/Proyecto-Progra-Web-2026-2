// src/components/features/operation/tray/ReservationRow.jsx

import { useDailyTray } from '../../../../context/DailyTrayContext';
import { getTrayStatus } from '../../../../utils/trayStatus';
import ReservationStatusTag from '../../reservations/ReservationStatusTag';
import RowActions from './RowActions';
import ReservationDetail from './ReservationDetail';
import styles from './SpaceGroup.module.css';

const cx = (...classes) => classes.filter(Boolean).join(' ');

/** Columnas de la tabla (ver SpaceGroup): la fila expandida ocupa todas. */
const TRAY_COLUMNS = 7;

/**
 * Una reserva de la bandeja (mockup 5.1) y, si está expandida, su detalle
 * (mockup 5.3) en una segunda fila que ocupa todo el ancho.
 *
 * Props:
 *  - reserva: vista de la reserva
 */
export default function ReservationRow({ reserva }) {
  const { now, expandedId, toggleExpanded } = useDailyTray();
  const isExpanded = expandedId === reserva.id;
  const detailId = `detalle-${reserva.id}`;

  return (
    <>
      <tr className={cx(styles.row, isExpanded && styles.rowExpanded)}>
        <td className={styles.block}>
          {reserva.horaInicio}–{reserva.horaFin}
        </td>
        <td className={styles.student}>{reserva.estudiante.nombreCompleto}</td>
        <td className={styles.muted}>{reserva.motivo}</td>
        <td>{reserva.asistentes}</td>
        <td>
          <ReservationStatusTag estado={getTrayStatus(reserva, now)} />
        </td>
        <td>
          <RowActions reserva={reserva} />
        </td>
        <td className={styles.toggleCell}>
          <button
            type="button"
            className={styles.toggle}
            onClick={() => toggleExpanded(reserva.id)}
            aria-expanded={isExpanded}
            aria-controls={detailId}
            aria-label={`${isExpanded ? 'Ocultar' : 'Ver'} detalle de ${reserva.codigo}`}
          >
            {isExpanded ? '▴' : '▾'}
          </button>
        </td>
      </tr>

      {isExpanded && (
        <tr id={detailId} className={styles.detailRow}>
          <td colSpan={TRAY_COLUMNS}>
            <ReservationDetail reserva={reserva} />
          </td>
        </tr>
      )}
    </>
  );
}
