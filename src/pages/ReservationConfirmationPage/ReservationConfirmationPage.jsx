// src/pages/ReservationConfirmationPage/ReservationConfirmationPage.jsx

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { obtenerReservaPorCodigo } from '../../services/reservationService';
import ContentLayout from '../../components/layout/ContentLayout/ContentLayout';
import ButtonLink from '../../components/ui/Button/ButtonLink';
import Alert from '../../components/ui/Alert/Alert';
import Spinner from '../../components/ui/Spinner/Spinner';
import ReservationStatusTag from '../../components/features/reservations/ReservationStatusTag';
import styles from './ReservationConfirmationPage.module.css';

/**
 * Confirmación de la reserva (mockup 4.1). Ruta: /mis-reservas/:codigo/confirmacion
 * Se llega aquí justo después de crear la reserva en el modal. Lee la reserva
 * por su código (así también funciona si el usuario recarga la página).
 */
export default function ReservationConfirmationPage() {
    const { codigo } = useParams();
    const { usuario } = useAuth();
    const [resultado, setResultado] = useState({ clave: null, reserva: null, error: null });

    const clave = JSON.stringify({ codigo, usuarioId: usuario.id });

    useEffect(() => {
        let activo = true;
        const { codigo: c, usuarioId } = JSON.parse(clave);
        obtenerReservaPorCodigo(c, usuarioId)
            .then((reserva) => activo && setResultado({ clave, reserva, error: null }))
            .catch((error) => activo && setResultado({ clave, reserva: null, error }));
        return () => {
            activo = false;
        };
    }, [clave]);

    const { reserva, error } = resultado;

    if (resultado.clave !== clave) {
        return (
            <ContentLayout screen="account">
                <div className={styles.loading}>
                    <Spinner /> Cargando…
                </div>
            </ContentLayout>
        );
    }

    if (error) {
        return (
            <ContentLayout screen="account">
                <div className={styles.wrap}>
                    <Alert variant="error">{error.message}</Alert>
                    <ButtonLink to="/mis-reservas" variant="outline">
                        Ir a Mis reservas
                    </ButtonLink>
                </div>
            </ContentLayout>
        );
    }

    const nInvitados = reserva.invitados.length;

    return (
        <ContentLayout screen="account">
            <div className={styles.wrap}>
                <Alert variant="success" className={styles.banner}>
                    ✓ Reserva registrada correctamente.
                </Alert>

                <section className={styles.card}>
                    <span className={styles.check} aria-hidden="true">
                        ✓
                    </span>
                    <h1 className={styles.title}>Tu bloque quedó reservado</h1>

                    <div className={styles.code}>
                        <span className={styles.codeLabel}>Código de reserva</span>
                        <span className={styles.codeValue}>{reserva.codigo}</span>
                    </div>

                    <dl className={styles.rows}>
                        <Fila label="Espacio" valor={reserva.espacio?.nombre} />
                        <Fila label="Fecha" valor={reserva.fechaTexto} />
                        <Fila label="Bloque" valor={`${reserva.horaInicio} – ${reserva.horaFin}`} />
                        <Fila
                            label="Asistentes"
                            valor={`${reserva.asistentes}${nInvitados ? ` (${nInvitados} invitado${nInvitados === 1 ? '' : 's'})` : ''}`}
                        />
                        <Fila label="Estado" valor={<ReservationStatusTag estado={reserva.estadoVisible} />} />
                    </dl>

                    <div className={styles.actions}>
                        <ButtonLink to="/mis-reservas" variant="outline">
                            Ir a Mis reservas
                        </ButtonLink>
                        <ButtonLink to={`/mis-reservas/${reserva.codigo}`}>Ver detalle</ButtonLink>
                    </div>
                </section>
            </div>
        </ContentLayout>
    );
}

function Fila({ label, valor }) {
    return (
        <div className={styles.row}>
            <dt>{label}</dt>
            <dd>{valor}</dd>
        </div>
    );
}