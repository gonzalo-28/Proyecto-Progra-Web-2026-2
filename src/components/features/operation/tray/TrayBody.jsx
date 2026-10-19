// src/components/features/operation/tray/TrayBody.jsx

import Alert from '../../../ui/Alert/Alert';
import Button from '../../../ui/Button/Button';
import Spinner from '../../../ui/Spinner/Spinner';
import StatusCounters from './StatusCounters';
import SpaceGroup from './SpaceGroup';
import EmptyDay from './EmptyDay';
import AbsenceConfirmDialog from './AbsenceConfirmDialog';
import { useDailyTray } from '../../../../context/DailyTrayContext';
import styles from './TrayBody.module.css';

/**
 * Contenido de la bandeja según su estado: cargando, error, vacía o con
 * reservas (contadores + un grupo por espacio). Lee todo del contexto.
 *
 * Props:
 *  - onGoToDate: (iso) => void   para el estado vacío ("Ver el lunes…")
 */
export default function TrayBody({ onGoToDate }) {
  const { date, isToday, cargando, error, bandeja, reintentar, aviso, cerrarAviso, horaSimulada } =
    useDailyTray();

  if (cargando) {
    return (
      <div className={styles.loading} role="status" aria-live="polite">
        <Spinner />
        <span>Cargando la bandeja…</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="error">
        <div className={styles.errorContent}>
          <span>{error}</span>
          <Button size="sm" variant="outline" onClick={reintentar}>
            Reintentar
          </Button>
        </div>
      </Alert>
    );
  }

  if (!bandeja || bandeja.contadores.total === 0) {
    return <EmptyDay date={date} isToday={isToday} onGoToDate={onGoToDate} />;
  }

  return (
    <div className={styles.root}>
      {horaSimulada && (
        <Alert variant="info">
          Modo desarrollo: hora simulada <strong>{horaSimulada}</strong>. Quita <code>?hora=</code>{' '}
          de la URL para usar la hora real.
        </Alert>
      )}

      {aviso && (
        <Alert variant={aviso.variant} onClose={cerrarAviso}>
          {aviso.variant === 'success' ? '✓ ' : ''}
          {aviso.text}
        </Alert>
      )}

      <StatusCounters counts={bandeja.contadores} />

      {bandeja.grupos.map((grupo) => (
        <SpaceGroup key={grupo.espacio.id} espacio={grupo.espacio} reservas={grupo.reservas} />
      ))}

      <AbsenceConfirmDialog />
    </div>
  );
}
