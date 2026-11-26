// src/components/features/operation/tray/OperationLog.jsx

import Card from '../../../ui/Card/Card';
import Button from '../../../ui/Button/Button';
import StatusTag from '../../../ui/StatusTag/StatusTag';
import { useDailyTray } from '../../../../context/DailyTrayContext';
import { formatDate } from '../../../../utils/dates';
import { exportarHistorial, exportarReservasDelDia } from './exportOperacion';
import styles from './OperationLog.module.css';

/* Color de la etiqueta de cada acción (StatusTag de la HU-4). */
const TONO = {
  llegada_registrada: 'success',
  inasistencia_marcada: 'danger',
  cancelada: 'warning',
  bloqueo: 'neutral',
};

/**
 * "Historial de la operación" del día (HU-5): lista cronológica de llegadas,
 * inasistencias, cancelaciones y bloqueos, con botones para exportarla como
 * CSV (y también el listado de reservas del día). Lee todo del contexto.
 */
export default function OperationLog() {
  const { date, bandeja } = useDailyTray();
  const historial = bandeja?.historial ?? [];
  const grupos = bandeja?.grupos ?? [];
  const total = bandeja?.contadores.total ?? 0;

  return (
    <Card as="section" padding="none" className={styles.root} aria-labelledby="historial-titulo">
      <header className={styles.header}>
        <div>
          <h2 id="historial-titulo" className={styles.title}>
            Historial de la operación
          </h2>
          <p className={styles.subtitle}>
            {formatDate(date)} ·{' '}
            {historial.length === 0
              ? 'sin movimientos'
              : `${historial.length} ${historial.length === 1 ? 'movimiento' : 'movimientos'}`}
          </p>
        </div>
        <div className={styles.actions}>
          <Button
            size="sm"
            variant="outline"
            disabled={historial.length === 0}
            onClick={() => exportarHistorial(date, historial)}
          >
            Exportar historial (CSV)
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={total === 0}
            onClick={() => exportarReservasDelDia(date, grupos)}
          >
            Exportar reservas del día (CSV)
          </Button>
        </div>
      </header>

      {historial.length === 0 ? (
        <p className={styles.empty}>
          Aún no hay llegadas, inasistencias, cancelaciones ni bloqueos registrados en esta jornada.
        </p>
      ) : (
        <div className={styles.scroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Hora</th>
                <th scope="col">Acción</th>
                <th scope="col">Reserva</th>
                <th scope="col">Espacio · bloque</th>
                <th scope="col">Responsable</th>
                <th scope="col">Detalle</th>
              </tr>
            </thead>
            <tbody>
              {historial.map((evento) => (
                <tr key={evento.id}>
                  <td className={styles.time}>{evento.hora}</td>
                  <td>
                    <StatusTag tone={TONO[evento.tipo] ?? 'neutral'}>{evento.accion}</StatusTag>
                  </td>
                  <td>
                    {evento.codigo ? (
                      <>
                        <span className={styles.code}>{evento.codigo}</span>
                        <span className={styles.sub}>{evento.estudiante}</span>
                      </>
                    ) : (
                      <span className={styles.sub}>—</span>
                    )}
                  </td>
                  <td>
                    {evento.espacio}
                    <span className={styles.sub}>
                      {evento.fechaReserva} · {evento.bloque}
                    </span>
                  </td>
                  <td>{evento.responsable}</td>
                  <td className={styles.detail}>{evento.detalle}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
