// src/components/ui/Select/Select.jsx

import { forwardRef, useId } from 'react';
import styles from './Select.module.css';

const cx = (...classes) => classes.filter(Boolean).join(' ');

/**
 * Select nativo con caret propio. Reutiliza los estilos de TextField
 * (label, borde, foco, error) mediante `composes`, sin duplicar CSS.
 *
 * Props:
 *  - id, label, options: [{ value, label }], value, onChange (evento nativo)
 *  - size: 'sm' | 'md'     (sm = navbar)
 *  - placeholder: primera opción deshabilitada con value ''
 *  - errorMsg, disabled, className
 *  - aria-label: obligatorio cuando no hay `label` visible (ej. selector de campus)
 */
const Select = forwardRef(function Select(
  {
    id,
    label,
    options = [],
    value,
    onChange,
    size = 'md',
    placeholder,
    errorMsg,
    disabled = false,
    className,
    ...rest
  },
  ref
) {
  const autoId = useId();
  const selectId = id ?? autoId;
  const messageId = `${selectId}-message`;

  return (
    <div className={cx(styles.root, className)}>
      {label && (
        <label htmlFor={selectId} className={styles.label}>
          {label}
        </label>
      )}

      <div
        className={cx(
          styles.control,
          styles[size],
          errorMsg && styles.hasError
        )}
      >
        <select
          ref={ref}
          id={selectId}
          value={value}
          onChange={onChange}
          disabled={disabled}
          aria-invalid={errorMsg ? true : undefined}
          aria-describedby={errorMsg ? messageId : undefined}
          className={styles.select}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className={styles.caret} aria-hidden="true" />
      </div>

      {errorMsg && (
        <p
          id={messageId}
          className={cx(styles.message, styles.error)}
          role="alert"
        >
          {errorMsg}
        </p>
      )}
    </div>
  );
});

export default Select;
