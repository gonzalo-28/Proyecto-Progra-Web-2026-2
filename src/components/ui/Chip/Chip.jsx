// src/components/ui/Chip/Chip.jsx

import styles from './Chip.module.css';

const cx = (...classes) => classes.filter(Boolean).join(' ');

/**
 * Etiqueta pequeña con dos usos del mockup 3.1:
 *
 *  1. Filtro activo removible ("Aforo ≥ 6 ✕"): pasa onRemove.
 *       <Chip onRemove={() => quitar('aforo')}>Aforo ≥ 6</Chip>
 *
 *  2. Opción seleccionable (equipamiento "Pizarra acrílica"): pasa onClick y selected.
 *       <Chip selected={tiene} onClick={alternar}>Proyector</Chip>
 *
 * Props:
 *  - children:    texto
 *  - onRemove:    muestra el botón ✕
 *  - removeLabel: texto accesible del ✕ (por defecto "Quitar filtro <texto>")
 *  - onClick, selected: modo seleccionable (botón con aria-pressed)
 *  - className
 */
export default function Chip({ children, onRemove, removeLabel, onClick, selected = false, className }) {
  if (onClick) {
    return (
      <button
        type="button"
        className={cx(styles.root, styles.toggle, selected && styles.selected, className)}
        aria-pressed={selected}
        onClick={onClick}
      >
        {children}
      </button>
    );
  }

  return (
    <span className={cx(styles.root, styles.active, className)}>
      {children}
      {onRemove && (
        <button
          type="button"
          className={styles.remove}
          onClick={onRemove}
          aria-label={removeLabel ?? `Quitar filtro ${typeof children === 'string' ? children : ''}`.trim()}
        >
          <span aria-hidden="true">✕</span>
        </button>
      )}
    </span>
  );
}