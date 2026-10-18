// src/components/ui/ConfirmDialog/ConfirmDialog.jsx

import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import styles from './ConfirmDialog.module.css';

/**
 * Confirmación genérica para acciones destructivas ("toda acción destructiva
 * pide confirmación", requerimiento no funcional del curso).
 *
 * Props:
 *  - open, title
 *  - children:     mensaje (texto o nodo)
 *  - confirmText:  "Marcar inasistencia"
 *  - cancelText:   "Volver"
 *  - tone:         'primary' | 'danger'  → color del botón de confirmar
 *  - isLoading:    bloquea ambos botones mientras se guarda
 *  - onConfirm(), onCancel()
 */
export default function ConfirmDialog({
  open,
  title,
  children,
  confirmText = 'Confirmar',
  cancelText = 'Volver',
  tone = 'primary',
  isLoading = false,
  onConfirm,
  onCancel,
}) {
  // Mientras se guarda, ni Escape ni el clic fuera cierran el diálogo.
  const handleClose = isLoading ? undefined : onCancel;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onCancel} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            variant={tone === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            isLoading={isLoading}
            loadingText="Guardando…"
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <div className={styles.message}>{children}</div>
    </Modal>
  );
}
