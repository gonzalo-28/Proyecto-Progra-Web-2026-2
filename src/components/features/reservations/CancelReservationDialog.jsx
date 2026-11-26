// src/components/features/reservations/CancelReservationDialog.jsx

import { useState } from 'react';
import ConfirmDialog from '../../ui/ConfirmDialog/ConfirmDialog';
import TextField from '../../ui/TextField/TextField';
import Alert from '../../ui/Alert/Alert';
import {
    DIAS_BLOQUEO_POR_INASISTENCIAS,
    HORAS_CANCELACION_SIN_PENALIDAD,
    MOTIVO_MAX_CARACTERES,
    UMBRAL_INASISTENCIAS,
} from '../../../utils/reglas';
import styles from './CancelReservationDialog.module.css';

/** "faltan 14 horas" / "faltan 45 minutos" hasta el inicio del bloque. */
function tiempoRestante(reserva) {
    const inicio = new Date(`${reserva.fecha}T${reserva.horaInicio}`);
    const minutos = Math.max(Math.round((inicio - new Date()) / 60000), 0);
    if (minutos >= 120) return `faltan ${Math.floor(minutos / 60)} horas`;
    if (minutos >= 60) return 'falta 1 hora';
    return `faltan ${minutos} minuto${minutos === 1 ? '' : 's'}`;
}

/**
 * Modal "¿Cancelar la reserva RSV-…?" (mockup 4.5, abajo). Avisa si la
 * cancelación está dentro de la ventana sin penalidad o si sumará una
 * inasistencia, y permite dejar un motivo opcional.
 *
 * Props:
 *  - reserva:       la reserva a cancelar (null = cerrado)
 *  - inasistencias: inasistencias acumuladas del estudiante
 *  - onConfirm:     async (reserva, motivo) => void. Si lanza, se muestra el error.
 *  - onClose:       cierra sin cancelar
 */
export default function CancelReservationDialog({ reserva, inasistencias = 0, onConfirm, onClose }) {
    const [motivo, setMotivo] = useState('');
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState('');

    if (!reserva) return null;

    const penaliza = reserva.cancelacionGeneraInasistencia;

    const confirmar = async () => {
        setEnviando(true);
        setError('');
        try {
            await onConfirm(reserva, motivo);
        } catch (err) {
            setError(err.message || 'No se pudo cancelar la reserva.');
            setEnviando(false);
        }
    };

    return (
        <ConfirmDialog
            open
            title={
                <>
                    ¿Cancelar la reserva <span className={styles.nowrap}>{reserva.codigo}?</span>
                </>
            }
            confirmText="Sí, cancelar"
            cancelText="Mantener la reserva"
            tone="danger"
            isLoading={enviando}
            loadingText="Cancelando…"
            onConfirm={confirmar}
            onCancel={onClose}
        >
            <p className={styles.summary}>
                <strong>{reserva.espacio?.nombre}</strong> · {reserva.fechaTexto} · {reserva.horaInicio} –{' '}
                {reserva.horaFin}
            </p>

            <div className={penaliza ? styles.danger : styles.warning}>
                {penaliza ? (
                    <>
                        <strong>Cancelación tardía:</strong> {tiempoRestante(reserva)} para el inicio. Si
                        cancelas ahora se sumará una inasistencia a tu registro.
                    </>
                ) : (
                    <>
                        <strong>Ventana de cancelación:</strong> {tiempoRestante(reserva)} para el inicio, así
                        que la cancelación no genera inasistencia. Cancelar con menos de{' '}
                        {HORAS_CANCELACION_SIN_PENALIDAD} horas suma una inasistencia a tu registro.
                    </>
                )}
            </div>

            <p className={styles.text}>
                Actualmente tienes <strong>{inasistencias} inasistencia{inasistencias === 1 ? '' : 's'}</strong>{' '}
                acumulada{inasistencias === 1 ? '' : 's'}. Al llegar a {UMBRAL_INASISTENCIAS} se bloquean las
                reservas por {DIAS_BLOQUEO_POR_INASISTENCIAS} días.
            </p>

            <TextField
                label="Motivo (opcional)"
                placeholder="Ej. Se reprogramó la reunión del grupo"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                maxLength={MOTIVO_MAX_CARACTERES}
                disabled={enviando}
            />

            {error && <Alert variant="error">{error}</Alert>}
        </ConfirmDialog>
    );
}