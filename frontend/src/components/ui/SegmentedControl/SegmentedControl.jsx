// src/components/ui/SegmentedControl/SegmentedControl.jsx

import styles from './SegmentedControl.module.css';

const cx = (...classes) => classes.filter(Boolean).join(' ');

/**
 * Grupo de botones donde solo uno está activo ("Todo el día | Rango horario").
 * La opción activa va en verde sólido, como en el mockup 5.4.
 *
 * Props:
 *  - options:   [{ value, label }]
 *  - value:     valor activo
 *  - onChange:  (value) => void
 *  - label:     texto del grupo para lectores de pantalla (y visible si showLabel)
 *  - showLabel: muestra el label arriba, en mayúscula pequeña (como los campos)
 *  - disabled, className
 */
export default function SegmentedControl({
  options = [],
  value,
  onChange,
  label,
  showLabel = false,
  disabled = false,
  className,
}) {
  return (
    <div className={cx(styles.root, className)}>
      {showLabel && label && <span className={styles.label}>{label}</span>}
      <div className={styles.group} role="group" aria-label={label}>
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              className={cx(styles.option, active && styles.active)}
              aria-pressed={active}
              disabled={disabled}
              onClick={() => onChange(option.value)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
