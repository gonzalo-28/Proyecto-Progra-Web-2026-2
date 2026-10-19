// src/components/features/reservations/ReservationCard.jsx

import { Link } from 'react-router-dom';
import ReservationStatusTag from './ReservationStatusTag';
import styles from './ReservationCard.module.css';

/** 'YYYY-MM-DDTHH:mm…' → 'HH:mm' */
const hora = (marca) => (marca ? marca.slice(11, 16) : '');

/**
 * Segunda línea de la tarjeta. En las próximas muestra código y asistentes;
 * en las históricas, el desenlace (mockup 4.2, sección "Históricas").
 */
function detalle(reserva) {
    const base = reserva.codigo;
    switch (reserva.estado) {
        case 'atendida':
            return `${base} · llegada registrada ${hora(reserva.llegadaRegistradaEn)}`;
        case 'inasistencia': {
            const evento = reserva.historial?.find((h) => h.tipo === 'inasistencia_marcada');
            return `${base} · marcada${evento ? ` por ${evento.actor}` : ' como inasistencia'}`;
        }
        case 'cancelada': {
            const quien = reserva.cancelacion?.porRol === 'encargado' ? 'por el encargado' : 'por ti';
            const tardia = reserva.cancelacion?.tardia ? ' · sumó una inasistencia' : '';
            return `${base} · cancelada ${quien}${tardia}`;
        }
        default:
            return `${base} · ${reserva.asistentes} asistente${reserva.asistentes === 1 ? '' : 's'}`;
    }
}

/**
 * Tarjeta de una reserva en "Mis reservas".
 *
 * Props:
 *  - reserva:  reserva enriquecida que devuelve reservationService
 *  - onCancel: (reserva) => void. Si se pasa y la reserva se puede cancelar,
 *              aparece el botón "Cancelar".
 */
export default function ReservationCard({ reserva, onCancel }) {
    const { espacio } = reserva;
    const motivoCancelacionEncargado =
        reserva.estado === 'cancelada' && reserva.cancelacion?.porRol === 'encargado'
            ? reserva.cancelacion.motivo
            : null;

    return (
        <article className={styles.card}>
            <header className={styles.header}>
                <h3 className={styles.title}>{espacio?.nombre ?? 'Espacio eliminado'}</h3>
                <ReservationStatusTag estado={reserva.estadoVisible} />
            </header>

            <p className={styles.meta}>
                {reserva.fechaTexto} · {reserva.horaInicio} – {reserva.horaFin}
                {espacio?.ubicacion ? ` · ${espacio.ubicacion}` : ''}
            </p>
            <p className={styles.meta}>{detalle(reserva)}</p>

            {motivoCancelacionEncargado && (
                <p className={styles.note}>Motivo: {motivoCancelacionEncargado}</p>
            )}

            {!reserva.esHistorica && (
                <div className={styles.actions}>
                    <Link to={`/mis-reservas/${reserva.codigo}`} className={styles.link}>
                        Ver detalle
                    </Link>
                    {onCancel && reserva.puedeCancelar && (
                        <button type="button" className={styles.cancel} onClick={() => onCancel(reserva)}>
                            Cancelar
                        </button>
                    )}
                </div>
            )}
        </article>
    );
}