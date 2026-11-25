// src/components/ui/Checkbox/Checkbox.jsx

import { forwardRef, useId } from 'react';
import styles from './Checkbox.module.css';

const cx = (...classes) => classes.filter(Boolean).join(' ');

/**
 * Casilla con etiqueta. `label` es un nodo (no solo texto) porque el
 * mockup lleva un link dentro: "Acepto el <TextLink>reglamento de uso…</TextLink>".
 *
 * Props: id, checked, onChange (evento nativo), label, errorMsg, disabled, className
 */
const Checkbox = forwardRef(function Checkbox(
  { id, checked, onChange, label, errorMsg, disabled = false, className, ...rest },
  ref
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const messageId = `${inputId}-message`;

  return (
    <div className={cx(styles.root, className)}>
      <div className={styles.row}>
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          aria-invalid={errorMsg ? true : undefined}
          aria-describedby={errorMsg ? messageId : undefined}
          className={styles.input}
          {...rest}
        />
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      </div>

      {errorMsg && (
        <p id={messageId} className={styles.error} role="alert">
          {errorMsg}
        </p>
      )}
    </div>
  );
});

export default Checkbox;
