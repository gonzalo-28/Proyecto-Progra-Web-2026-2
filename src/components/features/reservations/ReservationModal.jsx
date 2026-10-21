// src/components/features/reservations/ReservationModal.jsx

import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { crearReserva, prevalidarReserva } from '../../../services/reservationService';
import { fechaConDia } from '../../../utils/fechasReserva';
import { MOTIVO_MAX_CARACTERES, MOTIVO_MIN_CARACTERES } from '../../../utils/reglas';
import Modal from '../../ui/Modal/Modal';
import Button from '../../ui/Button/Button';
import TextField from '../../ui/TextField/TextField';
import Alert from '../../ui/Alert/Alert';
import Spinner from '../../ui/Spinner/Spinner';
import GuestChipsInput from './GuestChipsInput';
import styles from './ReservationModal.module.css';

/**
 * Modal "Reservar bloque" (mockup 4.5). Se abre al hacer clic en un bloque
 * libre del calendario (HU-3) o desde la página de prueba.
 *
 * Al abrirse llama a prevalidarReserva: si hay tope excedido, solapamiento,
 * bloque ocupado, etc., muestra el aviso y deshabilita "Confirmar reserva"
 * antes de que el estudiante escriba nada.
 *
 * Uso (desde el calendario de la HU-3):
 *   <ReservationModal
 *     espacioId="esp_001" fecha="2026-10-26" bloqueId="bloque_003"
 *     onClose={() => setBloque(null)}
 *     onSuccess={(reserva) => navigate(`/mis-reservas/${reserva.codigo}/confirmacion`)}
 *   />
 *
 * Props:
 *  - espacioId, fecha ('YYYY-MM-DD'), bloqueId: el bloque elegido
 *  - onClose:   cierra sin reservar
 *  - onSuccess: (reservaCreada) => void
 */
export default function ReservationModal({ espacioId, fecha, bloqueId, onClose, onSuccess }) {
    const { usuario } = useAuth();

    /* ------------------------- Pre-chequeo al abrir ------------------------ */
    const clave = JSON.stringify({ usuarioId: usuario.id, espacioId, fecha, bloqueId });
    const [pre, setPre] = useState({ clave: null, datos: null });
    const cargando = pre.clave !== clave;

    useEffect(() => {
        let activo = true;
        prevalidarReserva(JSON.parse(clave)).then((datos) => {
            if (activo) setPre({ clave, datos });
        });
        return () => {
            activo = false;
        };
    }, [clave]);

    /* ------------------------------ Formulario ----------------------------- */
    const [motivo, setMotivo] = useState('');
    const [asistentes, setAsistentes] = useState('1');
    const [invitados, setInvitados] = useState([]);
    const [errores, setErrores] = useState({});
    const [errorGeneral, setErrorGeneral] = useState('');
    const [enviando, setEnviando] = useState(false);

    const datos = pre.datos;
    const capacidad = datos?.espacio?.capacidad ?? 1;
    const maxInvitados = Math.max(capacidad - 1, 0);

    // Al agregar invitados, los asistentes nunca pueden ser menos que invitados + 1.
    const cambiarInvitados = (lista) => {
        setInvitados(lista);
        setAsistentes((a) => String(Math.max(Number(a) || 1, lista.length + 1)));
        setErrores((e) => ({ ...e, invitados: undefined, asistentes: undefined }));
    };

    /** Validación en el navegador (el servicio vuelve a validar todo). */
    const validar = () => {
        const e = {};
        const m = motivo.trim();
        if (!m) e.motivo = 'Indica el motivo de la reserva.';
        else if (m.length < MOTIVO_MIN_CARACTERES) e.motivo = `Mínimo ${MOTIVO_MIN_CARACTERES} caracteres.`;

        const n = Number(asistentes);
        if (!Number.isInteger(n) || n < 1) e.asistentes = 'Indica un número válido.';
        else if (n > capacidad) e.asistentes = `El aforo es de ${capacidad}.`;
        else if (invitados.length > n - 1) e.asistentes = `Con ${invitados.length} invitado(s) son al menos ${invitados.length + 1}.`;
        return e;
    };

    const confirmar = async (event) => {
        event.preventDefault();
        const e = validar();
        setErrores(e);
        setErrorGeneral('');
        if (Object.keys(e).length) return;

        setEnviando(true);
        try {
            const nueva = await crearReserva({
                usuarioId: usuario.id,
                espacioId,
                bloqueId,
                fecha,
                motivo,
                asistentes: Number(asistentes),
                invitados,
            });
            setEnviando(false); // por si quien lo usa no cierra el modal al terminar
            onSuccess?.(nueva);
        } catch (err) {
            setErrores(err.campos ?? {}); // errores por campo que devuelve el servicio
            setErrorGeneral(err.campos ? '' : err.message); // errores de regla (tope, solapamiento…)
            setEnviando(false);
        }
    };

    /* ------------------------------- Vista --------------------------------- */
    const error = datos?.error; // impedimento detectado al abrir
    const titulo =
        error?.code === 'TOPE_EXCEDIDO'
            ? 'Reservar bloque · tope excedido'
            : error?.code === 'SOLAPAMIENTO'
                ? 'Reservar bloque · solapamiento'
                : 'Reservar bloque';
    const bloqueado = !datos || !datos.ok;

    return (
        <Modal
            open
            title={titulo}
            onClose={enviando ? undefined : onClose}
            closeOnOverlay={!enviando}
            footer={
                <>
                    <Button variant="ghost" onClick={onClose} disabled={enviando}>
                        {error ? 'Elegir otro bloque' : 'Cancelar'}
                    </Button>
                    <Button
                        type="submit"
                        form="form-reserva"
                        isLoading={enviando}
                        loadingText="Reservando…"
                        disabled={bloqueado}
                    >
                        Confirmar reserva
                    </Button>
                </>
            }
        >
            {cargando || !datos ? (
                <div className={styles.loading}>
                    <Spinner /> Revisando el bloque…
                </div>
            ) : (
                <>
                    {/* Aviso del pre-chequeo (mockup 4.5, derecha) */}
                    {error && (
                        <div className={error.code === 'SOLAPAMIENTO' ? styles.warning : styles.danger} role="alert">
                            <strong>{TITULO_ERROR[error.code] ?? 'No se puede reservar.'}</strong> {error.message}
                        </div>
                    )}

                    {/* Resumen del bloque */}
                    <div className={styles.summary}>
                        <div>
                            <p className={styles.space}>{datos.espacio?.nombre}</p>
                            <p className={styles.meta}>
                                Aforo {capacidad} · {datos.espacio?.ubicacion}
                            </p>
                        </div>
                        <div className={styles.when}>
                            <p className={styles.hour}>
                                {datos.bloque?.horaInicio} – {datos.bloque?.horaFin}
                            </p>
                            <p className={styles.meta}>{fechaConDia(fecha)}</p>
                        </div>
                    </div>

                    {/* Formulario: solo si se puede reservar */}
                    {datos.ok && (
                        <form id="form-reserva" className={styles.form} onSubmit={confirmar} noValidate>
                            <TextField
                                label="Motivo de la reserva"
                                value={motivo}
                                onChange={(e) => {
                                    setMotivo(e.target.value);
                                    setErrores((x) => ({ ...x, motivo: undefined }));
                                }}
                                placeholder="Ej. Avance del proyecto final de Programación Web"
                                maxLength={MOTIVO_MAX_CARACTERES}
                                errorMsg={errores.motivo}
                                disabled={enviando}
                            />

                            <div className={styles.row}>
                                <TextField
                                    label="Asistentes"
                                    type="number"
                                    min={invitados.length + 1}
                                    max={capacidad}
                                    value={asistentes}
                                    onChange={(e) => {
                                        setAsistentes(e.target.value);
                                        setErrores((x) => ({ ...x, asistentes: undefined }));
                                    }}
                                    errorMsg={errores.asistentes}
                                    disabled={enviando}
                                    className={styles.attendees}
                                />
                                <GuestChipsInput
                                    label="Invitados"
                                    value={invitados}
                                    onChange={cambiarInvitados}
                                    max={maxInvitados}
                                    errorMsg={errores.invitados}
                                    disabled={enviando}
                                />
                            </div>
                        </form>
                    )}

                    {/* Tope semanal restante */}
                    <div className={styles.quota}>
                        <span>Tope semanal restante</span>
                        <strong className={datos.uso.restantes > 0 ? styles.quotaOk : styles.quotaNone}>
                            {datos.uso.restantes} de {datos.uso.tope} horas
                        </strong>
                    </div>

                    {errorGeneral && <Alert variant="error">{errorGeneral}</Alert>}
                </>
            )}
        </Modal>
    );
}

/** Primera parte en negrita del aviso, como en el mockup. */
const TITULO_ERROR = {
    TOPE_EXCEDIDO: 'Tope de horas excedido.',
    SOLAPAMIENTO: 'Solapamiento detectado.',
    BLOQUE_OCUPADO: 'Bloque no disponible.',
    BLOQUE_PASADO: 'Bloque no disponible.',
    USUARIO_BLOQUEADO: 'Reservas bloqueadas.',
    ESPACIO_NO_DISPONIBLE: 'Espacio no disponible.',
    SIN_PERMISO: 'Sin permiso.',
};