import { useState } from 'react';
import Button from '../../ui/Button/Button';
import Modal from '../../ui/Modal/Modal';
import TextArea from '../../ui/TextArea/TextArea';
import TextField from '../../ui/TextField/TextField';
import { useAuth } from '../../../context/AuthContext';
import { addDays, toISODate } from '../../../utils/dates';
import { getActiveSpaceReservationCount, updateCatalogSpaceStatus } from '../../../services/spaceCatalogService';
import styles from './SpaceStatusModal.module.css';

const STATUS_OPTIONS = [
  { value: 'mantenimiento', label: 'Mantenimiento' },
  { value: 'baja', label: 'De baja' },
  { value: 'disponible', label: 'Disponible' },
];

const getStatusLabel = (status) => STATUS_OPTIONS.find((option) => option.value === status)?.label ?? 'Disponible';

export default function SpaceStatusModal({ space, onClose, onSaved }) {
  const { usuario } = useAuth();
  const [status, setStatus] = useState(space.estado);
  const [reason, setReason] = useState(space.motivoEstado ?? '');
  const [restorationDate, setRestorationDate] = useState(space.fechaRestablecimiento ?? '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const isDestructive = status !== 'disponible';
  const reservationsToCancel = status === 'mantenimiento'
    ? getActiveSpaceReservationCount(space.id, restorationDate || null)
    : status === 'baja' ? getActiveSpaceReservationCount(space.id) : 0;

  const save = () => {
    if (isDestructive && reason.trim().length < 5) {
      setError('Describe el motivo con al menos 5 caracteres.');
      return;
    }
    if (status === 'mantenimiento' && (!restorationDate || restorationDate <= toISODate())) {
      setError('Indica una fecha estimada posterior a hoy.');
      return;
    }
    setSaving(true);
    try {
      const updated = updateCatalogSpaceStatus(space.id, status, reason.trim(), {
        fechaRestablecimiento: restorationDate,
        encargadoId: usuario?.id,
      });
      onSaved?.(updated);
    } catch (saveError) {
      setError(saveError.message || 'No se pudo guardar el cambio. Inténtalo nuevamente.');
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      title={`Cambiar estado de ${space.codigo}`}
      onClose={onClose}
      size="md"
      className={styles.modal}
      closeOnOverlay={!saving}
      footer={(
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button
            variant={isDestructive ? 'danger' : 'primary'}
            onClick={save}
            disabled={saving || (isDestructive && reason.trim().length < 5) || (status === 'mantenimiento' && (!restorationDate || restorationDate <= toISODate()))}
          >
            {status === 'baja' ? 'Dar de baja' : status === 'mantenimiento' ? 'Cambiar a mantenimiento' : 'Cambiar estado'}
          </Button>
        </>
      )}
    >
      <div className={styles.form}>
        <fieldset className={styles.statusField}>
          <legend>Nuevo estado</legend>
          <div className={styles.statusOptions}>
            {STATUS_OPTIONS.map((option) => (
              <label key={option.value} className={`${styles.statusOption} ${status === option.value ? styles.selected : ''}`}>
                <input
                  type="radio"
                  name="space-status"
                  value={option.value}
                  checked={status === option.value}
                  onChange={() => { setStatus(option.value); setError(''); }}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {isDestructive && (
          <>
            <TextArea
              label="Motivo (obligatorio)"
              value={reason}
              onChange={(event) => { setReason(event.target.value); setError(''); }}
              rows={3}
              maxLength={300}
              required
              errorMsg={error && reason.trim().length < 5 ? error : ''}
              className={styles.reason}
            />
            <p className={styles.helper}>El motivo se mostrará en el historial de las reservas afectadas.</p>
          </>
        )}

        {status === 'mantenimiento' && (
          <TextField
            label="Fecha estimada de restablecimiento (obligatoria)"
            type="date"
            min={addDays(toISODate(), 1)}
            value={restorationDate}
            onChange={(event) => { setRestorationDate(event.target.value); setError(''); }}
            errorMsg={error && (!restorationDate || restorationDate <= toISODate()) ? error : ''}
            required
          />
        )}

        {status === 'baja' && (
          <div className={styles.warning} role="status">
            <p><strong>Baja lógica:</strong> {reservationsToCancel > 0
              ? `se cancelarán ${reservationsToCancel} ${reservationsToCancel === 1 ? 'reserva confirmada vigente' : 'reservas confirmadas vigentes'} sin penalidad y con el motivo visible para los estudiantes. `
              : 'no hay reservas confirmadas vigentes que cancelar. '}
              El espacio dejará de aceptar reservas y su ficha e historial se conservarán.</p>
          </div>
        )}
        {status === 'mantenimiento' && (
          <div className={styles.warning} role="status">
            <p>{reservationsToCancel > 0
              ? `Se cancelarán ${reservationsToCancel} ${reservationsToCancel === 1 ? 'reserva confirmada vigente' : 'reservas confirmadas vigentes'} anteriores a la fecha indicada, sin penalidad y con el motivo visible para los estudiantes. `
              : 'No hay reservas confirmadas vigentes anteriores a la fecha indicada. '}
              El espacio dejará de aceptar reservas nuevas hasta que el encargado lo marque disponible.</p>
          </div>
        )}
        {!isDestructive && <p className={styles.availableMessage}>El espacio volverá a estar disponible para reservas.</p>}
        <span className={styles.srOnly}>Estado actual: {getStatusLabel(space.estado)}</span>
      </div>
    </Modal>
  );
}
