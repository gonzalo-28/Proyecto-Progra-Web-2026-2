// src/components/ui/Alert/Alert.jsx

import styles from './Alert.module.css';

const cx = (...classes) => classes.filter(Boolean).join(' ');

/**
 * Banner de mensaje dentro de formularios y pantallas.
 *
 * Props:
 *  - variant:   'error' | 'info' | 'success'
 *               error   → fondo rojo suave con borde (login con credenciales malas)
 *               info    → fondo mint (registro de encargado, ayuda en recuperar)
 *               success → mismo mint, para confirmaciones
 *  - children:  contenido del mensaje
 *  - onClose:   si se pasa, aparece el botón para cerrar el banner
 *  - className: clase extra (ej. para márgenes desde el padre)
 *
 * Accesibilidad: el error usa role="alert" (se anuncia de inmediato);
 * info y success usan role="status" (se anuncian sin interrumpir).
 */
export default function Alert({
  variant = 'info',
  children,
  onClose,
  className,
}) {
  return (
    <div
      className={cx(styles.root, styles[variant], className)}
      role={variant === 'error' ? 'alert' : 'status'}
    >
      <div className={styles.content}>{children}</div>

      {onClose && (
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label="Cerrar mensaje"
        >
          ×
        </button>
      )}
    </div>
  );
}