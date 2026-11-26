// src/components/ui/ConfirmDialog/ConfirmDialog.jsx

import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import styles from './ConfirmDialog.module.css';

/**
 * Diálogo "¿Seguro?" para toda acción destructiva (requisito no funcional:
 * "toda acción destructiva pide confirmación"). Se arma sobre Modal.
 *
 * Ejemplo (mockup 4.5, cancelación):
 *   <ConfirmDialog
 *     open={abierto}
 *     title="¿Cancelar la reserva RSV-2026-0473?"
 *     confirmText="Sí, cancelar"
 *     cancelText="Mantener la reserva"
 *     tone="danger"
 *     isLoading={cancelando}
 *     onConfirm={confirmar}
 *     onCancel={() => setAbierto(false)}
 *   >
 *     …contenido (resumen, avisos, campo de motivo)…
 *   </ConfirmDialog>
 *
 * Props:
 *  - open, title, children
 *  - confirmText / cancelText: textos de los botones
 *  - tone:        'danger' (botón rojo) | 'primary' (botón verde)
 *  - isLoading:   bloquea ambos botones y muestra spinner en el de confirmar
 *  - loadingText: texto mientras carga (ej. "Cancelando…")
 *  - confirmDisabled: deshabilita solo el botón de confirmar
 *  - onConfirm, onCancel
 */
export default function ConfirmDialog({
    open,
    title,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    tone = 'danger',
    isLoading = false,
    loadingText,
    confirmDisabled = false,
    onConfirm,
    onCancel,
    children,
}) {
    // Mientras se procesa no se puede cerrar (evita dejar la acción a medias).
    const cerrar = isLoading ? undefined : onCancel;

    return (
        <Modal
            open={open}
            title={title}
            onClose={cerrar}
            closeOnOverlay={!isLoading}
            size="sm"
            footer={
                <div className={styles.actions}>
                    <Button variant="ghost" onClick={onCancel} disabled={isLoading}>
                        {cancelText}
                    </Button>
                    <Button
                        variant="primary"
                        className={tone === 'danger' ? styles.danger : undefined}
                        onClick={onConfirm}
                        isLoading={isLoading}
                        loadingText={loadingText}
                        disabled={confirmDisabled}
                    >
                        {confirmText}
                    </Button>
                </div>
            }
        >
            {children}
        </Modal>
    );
}