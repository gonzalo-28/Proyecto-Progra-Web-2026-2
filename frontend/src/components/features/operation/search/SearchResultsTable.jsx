// src/components/features/operation/search/SearchResultsTable.jsx

import ReservationStatusTag from '../../reservations/ReservationStatusTag';
import TextLink from '../../../ui/TextLink/TextLink';
import { rutaReservaEnBandeja } from '../../../routes/rutasEncargado';
import { formatShortDate } from '../../../../utils/dates';
import { getTrayStatus } from '../../../../utils/trayStatus';
import styles from './SearchResultsTable.module.css';

/**
 * Tabla de resultados de la búsqueda (mockup 5.5):
 * CÓDIGO · USUARIO · ESPACIO · FECHA Y BLOQUE · ESTADO · Detalle.
 * "Detalle" abre la bandeja de ese día con la reserva desplegada, donde están
 * todas sus acciones (llegada, inasistencia, cancelación).
 *
 * Props:
 *  - resultados: vistas de reserva (operationService.buscarReservas)
 *  - now:        Date, para mostrar "En curso"
 */
export default function SearchResultsTable({ resultados, now }) {
  return (
    <div className={styles.root}>
      <div className={styles.scroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">Código</th>
              <th scope="col">Usuario</th>
              <th scope="col">Espacio</th>
              <th scope="col">Fecha y bloque</th>
              <th scope="col">Estado</th>
              <th scope="col">
                <span className={styles.srOnly}>Detalle</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {resultados.map((reserva) => (
              <tr key={reserva.id}>
                <td className={styles.code}>{reserva.codigo}</td>
                <td>
                  {reserva.estudiante.nombreCompleto}
                  <span className={styles.sub}>{reserva.estudiante.correo}</span>
                </td>
                <td>{reserva.espacio.nombre}</td>
                <td className={styles.nowrap}>
                  {formatShortDate(reserva.fecha)} · {reserva.horaInicio}
                </td>
                <td>
                  <ReservationStatusTag estado={getTrayStatus(reserva, now)} />
                </td>
                <td className={styles.link}>
                  <TextLink
                    to={rutaReservaEnBandeja(reserva.fecha, reserva.id)}
                    aria-label={`Ver detalle de ${reserva.codigo}`}
                  >
                    Detalle
                  </TextLink>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
