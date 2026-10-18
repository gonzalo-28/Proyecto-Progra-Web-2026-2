// src/components/ui/Modal/Modal.jsx

import { useEffect, useId, useRef } from 'react';
import styles from './Modal.module.css';

const cx = (...classes) => classes.filter(Boolean).join(' ');

/**
 * Ventana modal sobre <dialog> nativo: el navegador ya resuelve el foco
 * atrapado dentro del modal, la tecla Escape y devolver el foco al cerrar.
 *
 * Props:
 *  - open:            boolean controlado por el padre
 *  - onClose():       se llama con la X, Escape o clic fuera del panel
 *  - title:           "Cancelar la reserva RSV-2026-0455"
 *  - footer:          nodo con los botones (va alineado a la derecha con línea superior)
 *  - size:            'sm' | 'md'
 *  - closeOnBackdrop: si un clic fuera del panel cierra (por defecto true)
 *  - children:        contenido
 *
 * El contenido se desmonta al cerrar, así un formulario dentro del modal
 * empieza limpio cada vez que se abre.
 */
export default function Modal({
  open,
  onClose,
  title,
  footer,
  size = 'md',
  closeOnBackdrop = true,
  className,
  children,
}) {
  const dialogRef = useRef(null);
  const titleId = useId();

  // Sincroniza el estado de React con el <dialog> del navegador.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Evita que la página de fondo haga scroll mientras el modal está abierto.
  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Escape dispara "cancel": lo frenamos para que el padre decida si cierra.
  const handleCancel = (event) => {
    event.preventDefault();
    onClose?.();
  };

  // El <dialog> ocupa toda la pantalla; si el clic no cayó en el panel, fue fuera.
  const handleClick = (event) => {
    if (closeOnBackdrop && event.target === dialogRef.current) onClose?.();
  };

  return (
    <dialog
      ref={dialogRef}
      className={styles.root}
      aria-labelledby={titleId}
      onCancel={handleCancel}
      onClick={handleClick}
    >
      {open && (
        <div className={cx(styles.panel, styles[size], className)}>
          <header className={styles.header}>
            <h2 id={titleId} className={styles.title}>
              {title}
            </h2>
            <button
              type="button"
              className={styles.close}
              onClick={onClose}
              aria-label="Cerrar"
            >
              ×
            </button>
          </header>

          <div className={styles.body}>{children}</div>

          {footer && <footer className={styles.footer}>{footer}</footer>}
        </div>
      )}
    </dialog>
  );
}
