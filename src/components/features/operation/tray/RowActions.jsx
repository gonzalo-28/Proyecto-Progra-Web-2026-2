// src/components/features/operation/tray/RowActions.jsx

import Button from '../../../ui/Button/Button';
import useReservationActions from './useReservationActions';
import styles from './RowActions.module.css';

/** Texto de la columna ACCIONES cuando la reserva ya no es operable. */
function outcomeText(reserva) {
  switch (reserva.estado) {
    case 'atendida':
      return reserva.llegada ? `Llegada ${reserva.llegada}` : 'Atendida';
    case 'inasistencia':
      return reserva.inasistenciaMarcada
        ? `Marcada a las ${reserva.inasistenciaMarcada}`
        : 'Inasistencia registrada';
    case 'cancelada':
      return `Cancelada por el ${reserva.cancelacion?.porRol ?? 'estudiante'}`;
    default:
      return null;
  }
}

/**
 * Columna ACCIONES de una fila de la bandeja (mockup 5.1).
 * Toma las acciones del contexto con useReservationActions: no recibe callbacks.
 *
 * Props:
 *  - reserva: vista de la reserva
 */
export default function RowActions({ reserva }) {
  const actions = useReservationActions(reserva);

  if (!actions.isConfirmed) {
    return <span className={styles.note}>{outcomeText(reserva)}</span>;
  }

  const { tolerance } = actions;

  const cancelButton = actions.showCancelInRow && (
    <Button size="sm" variant="dangerOutline" disabled={actions.anyBusy} onClick={actions.onCancel}>
      Cancelar
    </Button>
  );

  if (actions.isFutureDay) {
    return <div className={styles.root}>{cancelButton}</div>;
  }

  return (
    <div className={styles.root}>
      {actions.showArrival && (
        <Button
          size="sm"
          // Dentro de la tolerancia es la acción principal (verde sólido).
          variant={tolerance.phase === 'grace' ? 'primary' : 'outline'}
          disabled={!actions.canArrive || actions.anyBusy}
          isLoading={actions.busy}
          onClick={actions.onArrive}
          title={
            actions.canArrive ? undefined : `Disponible desde 15 min antes de las ${tolerance.startLabel}`
          }
        >
          {tolerance.isLateArrival ? 'Llegada tardía' : 'Registrar llegada'}
        </Button>
      )}

      {actions.showAbsence && (
        <Button
          size="sm"
          variant={actions.canMarkAbsence ? 'danger' : 'outline'}
          disabled={!actions.canMarkAbsence || actions.anyBusy}
          onClick={actions.onMarkAbsence}
          title={actions.canMarkAbsence ? undefined : `Disponible a las ${tolerance.deadlineLabel}`}
        >
          Inasistencia
        </Button>
      )}

      {cancelButton}
    </div>
  );
}
