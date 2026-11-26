// src/components/ui/TextArea/TextArea.jsx

import { forwardRef, useId } from 'react';
import styles from './TextArea.module.css';

const cx = (...classes) => classes.filter(Boolean).join(' ');

/**
 * Campo de texto de varias líneas, con el mismo marco visual que TextField
 * (label en mayúscula pequeña, borde, foco y un solo mensaje debajo).
 * Se usa en "Motivo" del bloqueo y "Detalle" de la cancelación (HU-5).
 *
 * Props:
 *  - id, label, value, onChange, onBlur, placeholder, rows, maxLength
 *  - hint, errorMsg   (prioridad: error > hint)
 *  - disabled, required, className
 */
const TextArea = forwardRef(function TextArea(
  {
    id,
    label,
    value,
    onChange,
    onBlur,
    placeholder,
    rows = 3,
    maxLength,
    hint,
    errorMsg,
    disabled = false,
    required = false,
    className,
    ...rest
  },
  ref
) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const messageId = `${fieldId}-message`;
  const message = errorMsg || hint;

  return (
    <div className={cx(styles.root, className)}>
      {label && (
        <label htmlFor={fieldId} className={styles.label}>
          {label}
        </label>
      )}

      <textarea
        ref={ref}
        id={fieldId}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        disabled={disabled}
        required={required}
        aria-invalid={errorMsg ? true : undefined}
        aria-describedby={message ? messageId : undefined}
        className={cx(styles.input, errorMsg && styles.hasError)}
        {...rest}
      />

      {message && (
        <p
          id={messageId}
          className={cx(styles.message, errorMsg ? styles.error : styles.hint)}
          role={errorMsg ? 'alert' : undefined}
        >
          {message}
        </p>
      )}
    </div>
  );
});

export default TextArea;
