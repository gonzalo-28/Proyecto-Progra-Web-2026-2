// src/components/features/operation/tray/DetailActions.jsx

import Button from '../../../ui/Button/Button';
import ToleranceBox from './ToleranceBox';
import useReservationActions from './useReservationActions';
import styles from './DetailActions.module.css';

/**
 * Columna derecha del detalle expandido (mockup 5.3): recuadro de tolerancia
 * y botones de ancho completo. Misma lógica que RowActions (useReservationActions).
 *
 * Props:
 *  - reserva: vista de la reserva
 */
export default function DetailActions({ reserva }) {
  const actions = useReservationActions(reserva);

  if (!actions.isConfirmed) return null;

  const cancelButton = actions.canCancel && (
    <Button fullWidth variant="dangerOutline" disabled={actions.anyBusy} onClick={actions.onCancel}>
      Cancelar la reserva
    </Button>
  );

  if (actions.isFutureDay) {
    return (
      <div className={styles.root}>
        <p className={styles.hint}>
          Reserva programada. La llegada se registra el mismo día, desde 15 min antes del inicio.
        </p>
        {cancelButton}
      </div>
    );
  }

  const { tolerance } = actions;

  return (
    <div className={styles.root}>
      {actions.isOperableToday ? (
        <ToleranceBox tolerance={tolerance} />
      ) : (
        <p className={styles.hint}>
          La jornada ya pasó y la llegada no se registró. Solo puedes marcar la inasistencia.
        </p>
      )}

      {actions.showArrival && (
        <Button
          fullWidth
          variant={tolerance.phase === 'grace' ? 'primary' : 'outline'}
          disabled={!actions.canArrive || actions.anyBusy}
          isLoading={actions.busy}
          loadingText="Registrando…"
          onClick={actions.onArrive}
        >
          {actions.arrivalLabel}
        </Button>
      )}

      {actions.showAbsence && (
        <Button
          fullWidth
          variant={actions.canMarkAbsence ? 'danger' : 'outline'}
          disabled={!actions.canMarkAbsence || actions.anyBusy}
          onClick={actions.onMarkAbsence}
        >
          Marcar inasistencia
        </Button>
      )}

      {cancelButton}
    </div>
  );
}
