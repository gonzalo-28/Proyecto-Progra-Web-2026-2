// src/components/features/operation/tray/AbsenceConfirmDialog.jsx

import ConfirmDialog from '../../../ui/ConfirmDialog/ConfirmDialog';
import { useDailyTray } from '../../../../context/DailyTrayContext';
import { DIAS_BLOQUEO_POR_INASISTENCIAS, UMBRAL_INASISTENCIAS } from '../../../../utils/reglas';
import styles from './AbsenceConfirmDialog.module.css';

/**
 * Confirmación antes de marcar una inasistencia (acción destructiva: suma
 * una inasistencia al estudiante). Se abre desde cualquier fila o detalle.
 * Si con esta inasistencia el estudiante llega al umbral (reglas.js), lo avisa.
 */
export default function AbsenceConfirmDialog() {
  const { pendienteInasistencia, procesandoId, confirmarInasistencia, cancelarInasistencia } =
    useDailyTray();
  const reserva = pendienteInasistencia;
  const total = reserva ? reserva.estudiante.inasistencias + 1 : 0;
  const llegaAlUmbral = total >= UMBRAL_INASISTENCIAS;

  return (
    <ConfirmDialog
      open={Boolean(reserva)}
      title="¿Marcar inasistencia?"
      tone="danger"
      confirmText="Marcar inasistencia"
      cancelText="Volver"
      loadingText="Marcando…"
      isLoading={Boolean(reserva) && procesandoId === reserva.id}
      onConfirm={confirmarInasistencia}
      onCancel={cancelarInasistencia}
    >
      {reserva && (
        <div className={styles.body}>
          <p>
            Se registrará una inasistencia a <strong>{reserva.estudiante.nombreCompleto}</strong> por
            la reserva {reserva.codigo} ({reserva.horaInicio}–{reserva.horaFin},{' '}
            {reserva.espacio.nombre}) y el bloque quedará libre.
          </p>
          <p className={llegaAlUmbral ? styles.warning : styles.note}>
            Pasará a tener {total} {total === 1 ? 'inasistencia acumulada' : 'inasistencias acumuladas'}.
            {llegaAlUmbral &&
              ` Al llegar a ${UMBRAL_INASISTENCIAS}, sus reservas quedan bloqueadas por ${DIAS_BLOQUEO_POR_INASISTENCIAS} días.`}
          </p>
        </div>
      )}
    </ConfirmDialog>
  );
}
