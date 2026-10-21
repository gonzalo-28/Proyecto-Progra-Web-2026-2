// src/components/ui/Modal/Modal.jsx

import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import styles from './Modal.module.css';

const cx = (...classes) => classes.filter(Boolean).join(' ');

/**
 * Ventana modal genérica (mockups 4.5 y 5.6). Solo dibuja el "marco":
 * fondo oscuro, caja blanca, título, botón × y pie con acciones. Lo que va
 * adentro lo decide quien la usa.
 *
 * Props:
 *  - open:      boolean. Si es false no se dibuja nada.
 *  - title:     texto del encabezado ("Reservar bloque")
 *  - onClose:   se llama con la ×, con Escape o al hacer clic fuera de la caja
 *  - footer:    nodos para el pie (normalmente los botones)
 *  - size:      'sm' | 'md' | 'lg'   (ancho máximo de la caja)
 *  - closeOnOverlay: si false, el clic fuera NO cierra (útil mientras se guarda)
 *  - children:  contenido del cuerpo
 *
 * Accesibilidad: role="dialog" + aria-modal, el título se enlaza con
 * aria-labelledby, el foco entra al modal al abrirse y vuelve al botón que lo
 * abrió al cerrarse, y la página de fondo no hace scroll mientras está abierto.
 */
export default function Modal({
    open,
    title,
    onClose,
    footer,
    size = 'md',
    closeOnOverlay = true,
    className,
    children,
}) {
    const titleId = useId();
    const boxRef = useRef(null);

    // Se guarda onClose en una ref para que el efecto de abajo dependa SOLO de
    // "open". Si dependiera de onClose (que el padre recrea en cada render), el
    // foco saltaría al primer campo cada vez que el usuario escribe algo.
    const onCloseRef = useRef(onClose);
    useEffect(() => {
        onCloseRef.current = onClose;
    });

    useEffect(() => {
        if (!open) return undefined;

        const anterior = document.activeElement;
        const overflowAnterior = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        // Lleva el foco al primer elemento enfocable del modal.
        const primero = boxRef.current?.querySelector(
            'input, textarea, select, button:not([data-close]), [href], [tabindex]:not([tabindex="-1"])'
        );
        (primero ?? boxRef.current)?.focus();

        const onKeyDown = (event) => {
            if (event.key === 'Escape') onCloseRef.current?.();
        };
        document.addEventListener('keydown', onKeyDown);

        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.body.style.overflow = overflowAnterior;
            anterior?.focus?.();
        };
    }, [open]);

    if (!open) return null;

    const onOverlayMouseDown = (event) => {
        if (closeOnOverlay && event.target === event.currentTarget) onClose?.();
    };

    return createPortal(
        <div className={styles.overlay} onMouseDown={onOverlayMouseDown}>
            <div
                ref={boxRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? titleId : undefined}
                tabIndex={-1}
                className={cx(styles.box, styles[size], className)}
            >
                <header className={styles.header}>
                    {title && (
                        <h2 id={titleId} className={styles.title}>
                            {title}
                        </h2>
                    )}
                    {onClose && (
                        <button
                            type="button"
                            data-close
                            className={styles.close}
                            onClick={onClose}
                            aria-label="Cerrar"
                        >
                            ×
                        </button>
                    )}
                </header>

                <div className={styles.body}>{children}</div>

                {footer && <footer className={styles.footer}>{footer}</footer>}
            </div>
        </div>,
        document.body
    );
}