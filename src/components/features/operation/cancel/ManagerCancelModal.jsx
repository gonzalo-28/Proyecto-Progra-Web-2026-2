// src/components/features/operation/cancel/ManagerCancelModal.jsx

import { useId, useState } from 'react';
import Modal from '../../../ui/Modal/Modal';
import Button from '../../../ui/Button/Button';
import Select from '../../../ui/Select/Select';
import TextArea from '../../../ui/TextArea/TextArea';
import Alert from '../../../ui/Alert/Alert';
import { formatDate } from '../../../../utils/dates';
import {
  DETALLE_MAX_CARACTERES,
  MOTIVOS_CANCELACION,
  validarCancelacion,
} from '../../../../utils/reglasOperacion';
import styles from './ManagerCancelModal.module.css';

/**
 * Formulario del modal. Vive en un componente aparte con `key={reserva.id}`
 * (ver abajo) para que cada reserva abra el formulario vacío.
 */
function CancelForm({ reserva, onClose, onConfirm }) {
  const formId = useId();
  const [motivo, setMotivo] = useState('');
  const [detalle, setDetalle] = useState('');
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorGeneral(null);

    const encontrados = validarCancelacion({ motivo, detalle });
    setErrores(encontrados);
    if (Object.keys(encontrados).length > 0) return;

    setEnviando(true);
    try {
      await onConfirm({ motivo, detalle: detalle.trim() });
      // Si sale bien, el padre cierra el modal: este componente se desmonta.
    } catch (err) {
      if (err?.campos) setErrores(err.campos);
      else setErrorGeneral(err?.message || 'No se pudo cancelar la reserva.');
      setEnviando(false);
    }
  };

  // Al editar un campo se borra su error (el del detalle depende también del motivo).
  const cambiarMotivo = (event) => {
    setMotivo(event.target.value);
    setErrores((prev) => ({ ...prev, motivo: undefined, detalle: undefined }));
  };
  const cambiarDetalle = (event) => {
    setDetalle(event.target.value);
    setErrores((prev) => ({ ...prev, detalle: undefined }));
  };

  const cerrar = enviando ? undefined : onClose;

  return (
    <Modal
      open
      title={`Cancelar la reserva ${reserva.codigo}`}
      onClose={cerrar}
      closeOnOverlay={!enviando}
      size="md"
      footer={
        <div className={styles.footer}>
          <Button variant="ghost" onClick={onClose} disabled={enviando}>
            Volver
          </Button>
          <Button
            type="submit"
            form={formId}
            variant="danger"
            isLoading={enviando}
            loadingText="Cancelando…"
          >
            Cancelar la reserva
          </Button>
        </div>
      }
    >
      <form id={formId} className={styles.form} onSubmit={handleSubmit} noValidate>
        <p className={styles.summary}>
          {reserva.espacio.nombre} · {formatDate(reserva.fecha)} · {reserva.horaInicio} –{' '}
          {reserva.horaFin} · {reserva.estudiante.nombreCompleto}
        </p>

        {errorGeneral && <Alert variant="error">{errorGeneral}</Alert>}

        <Select
          label="Motivo (obligatorio)"
          placeholder="Selecciona un motivo"
          options={MOTIVOS_CANCELACION}
          value={motivo}
          onChange={cambiarMotivo}
          errorMsg={errores.motivo}
          disabled={enviando}
        />

        <TextArea
          label={motivo === 'otro' ? 'Detalle (obligatorio)' : 'Detalle'}
          value={detalle}
          onChange={cambiarDetalle}
          placeholder="Ej.: Corte de energía en el Pabellón E de 17:00 a 20:00 por trabajos en el tablero eléctrico."
          maxLength={DETALLE_MAX_CARACTERES}
          hint={`${detalle.length}/${DETALLE_MAX_CARACTERES} caracteres`}
          errorMsg={errores.detalle}
          disabled={enviando}
        />

        <div className={styles.notice} role="note">
          <strong>El motivo será visible para {reserva.estudiante.nombreCompleto}</strong> en el
          detalle de su reserva. Esta cancelación no genera inasistencia.
        </div>
      </form>
    </Modal>
  );
}

/**
 * Modal "Cancelar la reserva" del encargado (mockup 5.6).
 * Es reutilizable: lo usan la bandeja del día y, después, la búsqueda (5.5).
 *
 * Props:
 *  - reserva:   vista de la reserva a cancelar, o null (modal cerrado)
 *  - onClose:   () => void
 *  - onConfirm: ({ motivo, detalle }) => Promise
 *               Si rechaza con un Error que trae `campos`, se marcan los campos;
 *               si trae solo `message`, se muestra arriba del formulario.
 */
export default function ManagerCancelModal({ reserva, onClose, onConfirm }) {
  if (!reserva) return null;
  return <CancelForm key={reserva.id} reserva={reserva} onClose={onClose} onConfirm={onConfirm} />;
}
