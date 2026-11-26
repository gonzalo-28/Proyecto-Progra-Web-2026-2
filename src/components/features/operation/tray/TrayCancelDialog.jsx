// src/components/features/operation/tray/TrayCancelDialog.jsx

import ManagerCancelModal from '../cancel/ManagerCancelModal';
import { useDailyTray } from '../../../../context/DailyTrayContext';

/**
 * Conecta el modal de cancelación (reutilizable) con el estado de la bandeja.
 * Se abre desde el botón "Cancelar" de una fila o del detalle.
 */
export default function TrayCancelDialog() {
  const { pendienteCancelacion, cerrarCancelacion, confirmarCancelacion } = useDailyTray();

  return (
    <ManagerCancelModal
      reserva={pendienteCancelacion}
      onClose={cerrarCancelacion}
      onConfirm={confirmarCancelacion}
    />
  );
}
