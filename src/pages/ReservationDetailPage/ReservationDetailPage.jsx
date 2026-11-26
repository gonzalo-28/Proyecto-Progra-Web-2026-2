// src/pages/ReservationDetailPage/ReservationDetailPage.jsx

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { cancelarReserva, obtenerReservaPorCodigo, obtenerUsoSemanal } from '../../services/reservationService';
import { formatearMomento } from '../../utils/fechasReserva';
import { descargarIcs } from '../../utils/calendario';
import ContentLayout from '../../components/layout/ContentLayout/ContentLayout';
import Card from '../../components/ui/Card/Card';
import Button from '../../components/ui/Button/Button';
import ButtonLink from '../../components/ui/Button/ButtonLink';
import Alert from '../../components/ui/Alert/Alert';
import Spinner from '../../components/ui/Spinner/Spinner';
import ReservationStatusTag from '../../components/features/reservations/ReservationStatusTag';
import ReservationTimeline from '../../components/features/reservations/ReservationTimeline';
import CancelReservationDialog from '../../components/features/reservations/CancelReservationDialog';
import styles from './ReservationDetailPage.module.css';

/**
 * Detalle de la reserva con trazabilidad (mockup 4.4). Ruta: /mis-reservas/:codigo
 * Igual que "Mis reservas", es la única pieza de la vista que habla con useAuth
 * y con reservationService.
 */
export default function ReservationDetailPage() {
    const { codigo } = useParams(); // el ":codigo" de la URL
    const { usuario } = useAuth();

    const [version, setVersion] = useState(0); // se incrementa para recargar tras cancelar
    const [resultado, setResultado] = useState({ clave: null, reserva: null, uso: null, error: null });
    const [cancelando, setCancelando] = useState(false); // ¿modal de cancelación abierto?
    const [aviso, setAviso] = useState('');

    const clave = JSON.stringify({ codigo, usuarioId: usuario.id, version });
    const cargando = resultado.clave !== clave;

    useEffect(() => {
        let activo = true;
        const { codigo: c, usuarioId } = JSON.parse(clave);

        Promise.all([obtenerReservaPorCodigo(c, usuarioId), obtenerUsoSemanal(usuarioId)])
            .then(([reserva, uso]) => {
                if (activo) setResultado({ clave, reserva, uso, error: null });
            })
            .catch((err) => {
                if (activo) setResultado({ clave, reserva: null, uso: null, error: err });
            });

        return () => {
            activo = false;
        };
    }, [clave]);

    const confirmarCancelacion = async (reserva, motivo) => {
        const cancelada = await cancelarReserva(reserva.id, usuario.id, motivo); // si falla, el modal muestra el error
        setCancelando(false);
        setAviso(
            'La reserva fue cancelada.' +
            (cancelada.cancelacion?.tardia ? ' Se registró una inasistencia por cancelación tardía.' : '')
        );
        setVersion((v) => v + 1);
    };

    const { reserva, uso, error } = resultado;

    /* ---------------------------- Cargando / error --------------------------- */

    if (!reserva && cargando) {
        return (
            <ContentLayout screen="account">
                <div className={styles.loading}>
                    <Spinner /> Cargando la reserva…
                </div>
            </ContentLayout>
        );
    }

    if (error) {
        return (
            <ContentLayout screen="account">
                <Breadcrumb codigo={codigo} />
                <Alert variant="error" className={styles.aviso}>
                    {error.message}
                </Alert>
                <ButtonLink to="/mis-reservas" variant="outline">
                    Volver a Mis reservas
                </ButtonLink>
            </ContentLayout>
        );
    }

    /* --------------------------------- Detalle ------------------------------- */

    const registrada = formatearMomento(reserva.creadaEn);
    const limite = formatearMomento(reserva.cancelacionSinPenalidadHasta);
    const maxInvitados = Math.max((reserva.espacio?.capacidad ?? 1) - 1, 0);

    return (
        <ContentLayout screen="account">
            <Breadcrumb codigo={reserva.codigo} />

            <header className={styles.header}>
                <div>
                    <div className={styles.titleRow}>
                        <h1 className={styles.title}>{reserva.codigo}</h1>
                        <ReservationStatusTag estado={reserva.estadoVisible} />
                    </div>
                    <p className={styles.subtitle}>
                        Registrada el {registrada.fecha} a las {registrada.hora}
                    </p>
                </div>

                <div className={styles.actions}>
                    {!reserva.esHistorica && (
                        <Button variant="outline" onClick={() => descargarIcs(reserva)}>
                            Agregar a mi calendario
                        </Button>
                    )}
                    {reserva.puedeCancelar && (
                        <Button variant="outline" className={styles.cancelButton} onClick={() => setCancelando(true)}>
                            Cancelar reserva
                        </Button>
                    )}
                </div>
            </header>

            {aviso && (
                <Alert variant="success" onClose={() => setAviso('')} className={styles.aviso}>
                    {aviso}
                </Alert>
            )}

            <div className={styles.grid} aria-busy={cargando}>
                <div className={styles.column}>
                    <Card as="section" title="Datos de la reserva" padding="lg">
                        <dl className={styles.fields}>
                            <Campo label="Espacio" valor={reserva.espacio?.nombre ?? 'Espacio eliminado'} />
                            <Campo label="Ubicación" valor={reserva.espacio?.ubicacion ?? '—'} />
                            <Campo label="Fecha" valor={reserva.fechaTexto} />
                            <Campo label="Bloque" valor={`${reserva.horaInicio} – ${reserva.horaFin}`} />
                            <Campo label="Motivo" valor={reserva.motivo} ancho />
                        </dl>
                    </Card>

                    <Card
                        as="section"
                        title={`Invitados · ${reserva.invitados.length} de ${maxInvitados}`}
                        padding="lg"
                    >
                        {reserva.invitados.length === 0 ? (
                            <p className={styles.empty}>Esta reserva no tiene invitados.</p>
                        ) : (
                            <ul className={styles.guests}>
                                {reserva.invitados.map((invitado) => (
                                    <li key={invitado.correo} className={styles.guest}>
                                        <span>{invitado.nombre}</span>
                                        <span className={styles.email}>{invitado.correo}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Card>
                </div>

                <Card as="aside" title="Trazabilidad" padding="lg">
                    <ReservationTimeline reserva={reserva} />

                    {reserva.puedeCancelar && (
                        <p className={styles.note}>
                            {reserva.cancelacionGeneraInasistencia
                                ? 'Faltan menos de 2 horas para el inicio: si cancelas ahora se sumará una inasistencia.'
                                : `Puedes cancelar hasta las ${limite.hora} del ${limite.fecha} sin acumular inasistencias.`}
                        </p>
                    )}
                </Card>
            </div>

            {cancelando && (
                <CancelReservationDialog
                    reserva={reserva}
                    inasistencias={uso?.inasistencias ?? 0}
                    onConfirm={confirmarCancelacion}
                    onClose={() => setCancelando(false)}
                />
            )}
        </ContentLayout>
    );
}

/** "Mis reservas / RSV-2026-0473" */
function Breadcrumb({ codigo }) {
    return (
        <nav className={styles.breadcrumb} aria-label="Ruta">
            <Link to="/mis-reservas">Mis reservas</Link>
            <span aria-hidden="true"> / </span>
            <span aria-current="page">{codigo}</span>
        </nav>
    );
}

/** Un dato con su etiqueta en mayúscula pequeña ("ESPACIO" / "Laboratorio…"). */
function Campo({ label, valor, ancho = false }) {
    return (
        <div className={ancho ? styles.fieldWide : undefined}>
            <dt className={styles.label}>{label}</dt>
            <dd className={styles.value}>{valor}</dd>
        </div>
    );
}