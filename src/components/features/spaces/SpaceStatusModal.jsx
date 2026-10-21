import { useState } from 'react';
import Button from '../../ui/Button/Button';
import Modal from '../../ui/Modal/Modal';
import TextArea from '../../ui/TextArea/TextArea';
import { updateCatalogSpaceStatus } from '../../../services/spaceCatalogService';
import styles from './SpaceStatusModal.module.css';

const STATUS_OPTIONS = [
  { value: 'mantenimiento', label: 'Mantenimiento' },
  { value: 'baja', label: 'De baja' },
  { value: 'disponible', label: 'Disponible' },
];

const DEFAULT_REASON = 'Cambio de 24 computadoras y recableado eléctrico del laboratorio.';

const getStatusLabel = (status) => STATUS_OPTIONS.find((option) => option.value === status)?.label ?? 'Disponible';

export default function SpaceStatusModal({ space, onClose, onSaved }) {
  const [status, setStatus] = useState(space.estado);
  const [reason, setReason] = useState(DEFAULT_REASON);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const isDestructive = status !== 'disponible';

  const save = () => {
    if (!reason.trim()) {
      setError('Ingresa el motivo del cambio de estado.');
      return;
    }
    setSaving(true);
    try {
      const updated = updateCatalogSpaceStatus(space.id, status, reason.trim());
      onSaved?.(updated);
    } catch {
      setError('No se pudo guardar el cambio. Inténtalo nuevamente.');
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
            disabled={saving || !reason.trim()}
          >
            {isDestructive ? 'Cambiar estado y cancelar reservas' : 'Cambiar estado'}
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

        <TextArea
          label="Motivo (obligatorio)"
          value={reason}
          onChange={(event) => { setReason(event.target.value); setError(''); }}
          rows={3}
          maxLength={300}
          required
          errorMsg={error}
          className={styles.reason}
        />
        <p className={styles.helper}>El motivo se mostrará a los usuarios afectados.</p>

        {isDestructive && (
          <div className={styles.warning} role="status">
            <p><strong>Atención:</strong> se cancelarán 4 reservas vigentes entre el 14/09/2026 y el 18/09/2026. Los<br className={styles.mockupBreak} /> estudiantes recibirán un correo con el motivo.</p>
          </div>
        )}
        {!isDestructive && <p className={styles.availableMessage}>El espacio volverá a estar disponible para reservas.</p>}
        <span className={styles.srOnly}>Estado actual: {getStatusLabel(space.estado)}</span>
      </div>
    </Modal>
  );
}
