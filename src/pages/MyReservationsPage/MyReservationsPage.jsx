// src/pages/MyReservationsPage/MyReservationsPage.jsx

import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    cancelarReserva,
    obtenerMisReservas,
    obtenerUsoSemanal,
} from '../../services/reservationService';
import ContentLayout from '../../components/layout/ContentLayout/ContentLayout';
import ButtonLink from '../../components/ui/Button/ButtonLink';
import Alert from '../../components/ui/Alert/Alert';
import Spinner from '../../components/ui/Spinner/Spinner';
import ReservationCard from '../../components/features/reservations/ReservationCard';
import ReservationFilters from '../../components/features/reservations/ReservationFilters';
import { FILTROS_INICIALES } from '../../components/features/reservations/filtrosReservas';
import ReservationsEmptyState from '../../components/features/reservations/ReservationsEmptyState';
import CancelReservationDialog from '../../components/features/reservations/CancelReservationDialog';
import styles from './MyReservationsPage.module.css';

/** 'YYYY-MM-DD' → 'DD/MM' */
const diaMes = (iso) => (iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}` : '');

/**
 * "Mis reservas" (mockups 4.2 y 4.3). Es la única pieza de esta vista que
 * habla con useAuth y con reservationService; las tarjetas, filtros y modales
 * reciben todo por props.
 */
export default function MyReservationsPage() {
    const { usuario } = useAuth();
    const location = useLocation();

    const [filtros, setFiltros] = useState(FILTROS_INICIALES);
    const [version, setVersion] = useState(0); // se incrementa para recargar tras cancelar
    const [resultado, setResultado] = useState({ clave: null, datos: null, uso: null, error: '' });
    const [aCancelar, setACancelar] = useState(null);
    // Mensaje de éxito: viene de otra pantalla (ej. al crear una reserva) o tras cancelar.
    const [aviso, setAviso] = useState(location.state?.aviso ?? '');

    // Rango inválido: se avisa junto al campo y no se aplica el rango.
    const errorRango =
        filtros.desde && filtros.hasta && filtros.desde > filtros.hasta
            ? '"Hasta" debe ser igual o posterior a "Desde".'
            : '';
    const filtrosAplicados = errorRango ? { ...filtros, desde: '', hasta: '' } : filtros;

    // Todo lo que define la consulta, en una sola clave. Si la clave del
    // resultado no coincide con la actual, la consulta está en curso.
    const clave = JSON.stringify({ usuarioId: usuario.id, filtros: filtrosAplicados, version });
    const cargando = resultado.clave !== clave;

    useEffect(() => {
        let activo = true; // descarta respuestas viejas si el usuario cambia filtros rápido
        const { usuarioId, filtros: f } = JSON.parse(clave);

        Promise.all([obtenerMisReservas(usuarioId, f), obtenerUsoSemanal(usuarioId)])
            .then(([datos, uso]) => {
                if (activo) setResultado({ clave, datos, uso, error: '' });
            })
            .catch((err) => {
                if (activo) {
                    setResultado({ clave, datos: null, uso: null, error: err.message || 'No se pudieron cargar tus reservas.' });
                }
            });

        return () => {
            activo = false;
        };
    }, [clave]);

    const limpiarFiltros = () => setFiltros(FILTROS_INICIALES);

    const confirmarCancelacion = async (reserva, motivo) => {
        const cancelada = await cancelarReserva(reserva.id, usuario.id, motivo); // si falla, el modal muestra el error
        setACancelar(null);
        setAviso(
            `Cancelaste la reserva ${cancelada.codigo}.` +
            (cancelada.cancelacion?.tardia ? ' Se registró una inasistencia por cancelación tardía.' : '')
        );
        setVersion((v) => v + 1);
    };

    const { datos, uso, error } = resultado;
    // sinNada: el estudiante no tiene NINGUNA reserva (mockup 4.3), con o sin filtros.
    const sinNada = Boolean(datos) && datos.totalUsuario === 0;

    return (
        <ContentLayout screen="account">
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Mis reservas</h1>
                    {/* Mockup 4.3: sin reservas no se muestran el resumen ni el botón */}
                    {uso && !sinNada && (
                        <p className={styles.subtitle}>
                            {uso.usadas} de {uso.tope} horas usadas del {diaMes(uso.desde)} al {diaMes(uso.hasta)} ·{' '}
                            {uso.inasistencias} inasistencia{uso.inasistencias === 1 ? '' : 's'} acumulada
                            {uso.inasistencias === 1 ? '' : 's'}
                        </p>
                    )}
                </div>
                {!sinNada && <ButtonLink to="/espacios">Buscar un espacio</ButtonLink>}
            </header>

            {aviso && (
                <Alert variant="success" onClose={() => setAviso('')} className={styles.aviso}>
                    {aviso}
                </Alert>
            )}

            {uso?.bloqueadoHasta && (
                <Alert variant="error" className={styles.aviso}>
                    Tus reservas están bloqueadas hasta el {diaMes(uso.bloqueadoHasta)} por acumular{' '}
                    {uso.inasistencias} inasistencias.
                </Alert>
            )}

            <ReservationFilters
                filtros={filtros}
                onChange={setFiltros}
                mostrarFechas={!sinNada}
                errorRango={errorRango}
                onClear={limpiarFiltros}
            />

            <div className={styles.content} aria-busy={cargando}>
                {error && <Alert variant="error">{error}</Alert>}

                {!datos && cargando && (
                    <div className={styles.loading}>
                        <Spinner /> Cargando tus reservas…
                    </div>
                )}

                {datos && sinNada && <ReservationsEmptyState variant="sinReservas" />}

                {datos && !sinNada && datos.total === 0 && (
                    <ReservationsEmptyState variant="sinResultados" onClear={limpiarFiltros} />
                )}

                {datos && datos.proximas.length > 0 && (
                    <section className={styles.section} aria-labelledby="titulo-proximas">
                        <h2 id="titulo-proximas" className={styles.sectionTitle}>
                            Próximas
                        </h2>
                        <div className={styles.grid}>
                            {datos.proximas.map((reserva) => (
                                <ReservationCard key={reserva.id} reserva={reserva} onCancel={setACancelar} />
                            ))}
                        </div>
                    </section>
                )}

                {datos && datos.historicas.length > 0 && (
                    <section className={styles.section} aria-labelledby="titulo-historicas">
                        <h2 id="titulo-historicas" className={styles.sectionTitle}>
                            Históricas
                        </h2>
                        <div className={styles.grid}>
                            {datos.historicas.map((reserva) => (
                                <ReservationCard key={reserva.id} reserva={reserva} />
                            ))}
                        </div>
                    </section>
                )}
            </div>

            {aCancelar && (
                <CancelReservationDialog
                    key={aCancelar.id}
                    reserva={aCancelar}
                    inasistencias={uso?.inasistencias ?? 0}
                    onConfirm={confirmarCancelacion}
                    onClose={() => setACancelar(null)}
                />
            )}
        </ContentLayout>
    );
}