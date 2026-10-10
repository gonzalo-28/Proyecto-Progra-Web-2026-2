// src/components/ui/PasswordField/Passwordfield.jsx 

import { forwardRef, useId, useState } from 'react';
import TextField from '../TextField/TextField';

import styles from './PasswordField.module.css';

/**
 * Campo de contraseña. Es un TextField con type conmutable.
 *
 * Props propias:
 *  - showToggle: muestra el botón "Mostrar / Ocultar".
 *                Por defecto es false: según el mockup SOLO el Login lo usa
 *                (<PasswordField showToggle />). En registros y Mi cuenta
 *                se deja sin la prop y el campo queda enmascarado siempre.
 *  - autoComplete: 'current-password' por defecto; usar 'new-password'
 *                  en registro y cambio de contraseña.
 *
 * El resto de props (label, value, onChange, errorMsg, hint, successMsg…)
 * se pasan tal cual a TextField.
 */
const PasswordField = forwardRef(function PasswordField(
  { id, showToggle = false, autoComplete = 'current-password', ...rest },
  ref
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const [isVisible, setIsVisible] = useState(false);

  const toggle = showToggle ? (
    <button
      type="button"
      className={styles.toggle}
      onClick={() => setIsVisible((prev) => !prev)}
      aria-pressed={isVisible}
      aria-controls={inputId}
    >
      {isVisible ? 'Ocultar' : 'Mostrar'}
    </button>
  ) : undefined;

  return (
    <TextField
      ref={ref}
      id={inputId}
      type={showToggle && isVisible ? 'text' : 'password'}
      autoComplete={autoComplete}
      rightSlot={toggle}
      {...rest}
    />
  );
});

export default PasswordField;