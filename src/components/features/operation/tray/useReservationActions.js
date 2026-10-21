// src/components/features/operation/tray/useReservationActions.js

import { useDailyTray } from '../../../../context/DailyTrayContext';
import { getToleranceStatus } from '../../../../utils/tolerance';
import { getTrayStatus } from '../../../../utils/trayStatus';

/**
 * Reglas de qué se puede hacer con una reserva de la bandeja AHORA.
 * La usan la fila (RowActions) y el detalle expandido (DetailActions), así la
 * lógica vive en un solo lugar y cada componente solo decide cómo mostrarla.
 *
 * @param {Object} reserva  vista de la reserva (operationService)
 */
export default function useReservationActions(reserva) {
  const { now, isToday, procesandoId, registrarLlegada, solicitarInasistencia, solicitarCancelacion } =
    useDailyTray();

  const tolerance = getToleranceStatus(reserva, now);
  const isConfirmed = reserva.estado === 'confirmada';
  const isOperableToday = isConfirmed && isToday;

  return {
    tolerance,
    displayStatus: getTrayStatus(reserva, now),
    isConfirmed,
    isOperableToday,
    isFutureDay: isConfirmed && !isToday && tolerance.phase === 'upcoming',
    busy: procesandoId === reserva.id,
    anyBusy: procesandoId !== null,

    // Registrar llegada: solo hoy y mientras el bloque no termine.
    showArrival: isOperableToday && !tolerance.hasEnded,
    canArrive: isOperableToday && tolerance.canRegisterArrival,
    arrivalLabel: tolerance.isLateArrival ? 'Registrar llegada tardía' : 'Registrar llegada',

    // Inasistencia: hoy (aunque aún no venza, se muestra deshabilitada) o jornadas pasadas.
    showAbsence: isConfirmed && tolerance.phase !== 'upcoming',
    canMarkAbsence: isConfirmed && tolerance.canMarkAbsence,

    // Cancelar (encargado): mientras el bloque no termine, hoy o días futuros.
    // En la fila solo aparece antes del inicio (mockup 5.1); en el detalle, siempre.
    canCancel: isConfirmed && !tolerance.hasEnded,
    showCancelInRow: isConfirmed && tolerance.phase === 'upcoming',

    onArrive: () => registrarLlegada(reserva),
    onCancel: () => solicitarCancelacion(reserva),
    onMarkAbsence: () => solicitarInasistencia(reserva),
  };
}
