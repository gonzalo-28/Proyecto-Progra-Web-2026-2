// src/components/features/reservations/ReservationTimeline.jsx

import { formatearMomento, sumarMinutos } from '../../../utils/fechasReserva';
import { TOLERANCIA_LLEGADA_MIN } from '../../../utils/reglas';
import styles from './ReservationTimeline.module.css';

/** Título visible de cada tipo de evento del historial (contrato de datos). */
const TITULOS = {
    creada: 'Reserva creada',
    invitados_notificados: 'Invitados notificados',
    confirmada: 'Estado: confirmada',
    llegada_registrada: 'Llegada registrada',
    inasistencia_marcada: 'Inasistencia registrada',
    cancelada: 'Reserva cancelada',
};

/**
 * Línea de tiempo "Trazabilidad" (mockup 4.4). Muestra los eventos del
 * historial de la reserva y, si sigue confirmada, el paso pendiente
 * "Registro de llegada" con un punto vacío.
 *
 * Props:
 *  - reserva: reserva enriquecida (usa historial, estado, horaInicio, cancelacion)
 */
export default function ReservationTimeline({ reserva }) {
    const eventos = [...(reserva.historial ?? [])].sort((a, b) =>
        String(a.fecha).localeCompare(String(b.fecha))
    );
    const pendienteLlegada = reserva.estado === 'confirmada';

    return (
        <ol className={styles.list}>
            {eventos.map((evento, i) => {
                const { fecha, hora } = formatearMomento(evento.fecha);
                const motivo =
                    evento.tipo === 'cancelada' && reserva.cancelacion?.motivo ? reserva.cancelacion.motivo : null;
                return (
                    <li key={`${evento.tipo}-${i}`} className={styles.item}>
                        <span
                            className={`${styles.dot} ${evento.tipo === 'cancelada' || evento.tipo === 'inasistencia_marcada' ? styles.dotDanger : ''}`}
                            aria-hidden="true"
                        />
                        <div>
                            <p className={styles.title}>{TITULOS[evento.tipo] ?? evento.tipo}</p>
                            <p className={styles.meta}>
                                {fecha} {hora} · {evento.actor}
                            </p>
                            {motivo && <p className={styles.meta}>Motivo: {motivo}</p>}
                        </div>
                    </li>
                );
            })}

            {pendienteLlegada && (
                <li className={`${styles.item} ${styles.pending}`}>
                    <span className={`${styles.dot} ${styles.dotEmpty}`} aria-hidden="true" />
                    <div>
                        <p className={styles.title}>Registro de llegada</p>
                        <p className={styles.meta}>
                            Pendiente · tolerancia hasta {sumarMinutos(reserva.horaInicio, TOLERANCIA_LLEGADA_MIN)}
                        </p>
                    </div>
                </li>
            )}
        </ol>
    );
}