// src/components/ui/TextField/Textfield.jsx

import { forwardRef, useId } from 'react';
import styles from './TextField.module.css';

const cx = (...classes) => classes.filter(Boolean).join(' ');

/**
 * Campo de texto con label en mayúscula pequeña (como en los mockups).
 *
 * Props:
 *  - id, label, type, value, onChange, onBlur, placeholder, autoComplete
 *  - hint:       texto gris de ayuda        ("No editable.")
 *  - successMsg: texto verde de validación  ("Cumple los 8 caracteres…")
 *  - errorMsg:   texto rojo + borde rojo    ("El correo debe terminar en @ulima.edu.pe")
 *  - readOnly:   fondo gris, no editable (Correo institucional y Código en Mi cuenta)
 *  - disabled, required
 *  - rightSlot:  nodo dentro del borde, a la derecha (ej. "Mostrar")
 *  - className:  clase del contenedor; inputClassName: clase del <input>
 *
 * Solo se muestra UN mensaje bajo el campo. Prioridad: error > success > hint.
 * Este componente no conoce reglas de negocio: quien lo usa decide qué
 * mensaje pasar según el mockup de su formulario.
 */
const TextField = forwardRef(function TextField(
  {
    id,
    label,
    type = 'text',
    value,
    onChange,
    onBlur,
    placeholder,
    autoComplete,
    hint,
    successMsg,
    errorMsg,
    readOnly = false,
    disabled = false,
    required = false,
    rightSlot,
    className,
    inputClassName,
    ...rest
  },
  ref
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const messageId = `${inputId}-message`;

  let message = null;
  if (errorMsg) message = { tone: 'error', text: errorMsg };
  else if (successMsg) message = { tone: 'success', text: successMsg };
  else if (hint) message = { tone: 'hint', text: hint };

  return (
    <div className={cx(styles.root, className)}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}

      <div
        className={cx(
          styles.control,
          errorMsg && styles.hasError,
          readOnly && styles.readOnly,
          disabled && styles.disabled
        )}
      >
        <input
          ref={ref}
          id={inputId}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          readOnly={readOnly}
          disabled={disabled}
          required={required}
          aria-invalid={errorMsg ? true : undefined}
          aria-describedby={message ? messageId : undefined}
          className={cx(styles.input, inputClassName)}
          {...rest}
        />
        {rightSlot && <div className={styles.right}>{rightSlot}</div>}
      </div>

      {message && (
        <p
          id={messageId}
          className={cx(styles.message, styles[message.tone])}
          role={message.tone === 'error' ? 'alert' : undefined}
        >
          {message.text}
        </p>
      )}
    </div>
  );
});

export default TextField;