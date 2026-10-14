// src/components/ui/FormGrid/FormGrid.jsx

import styles from './FormGrid.module.css';

const cx = (...classes) => classes.filter(Boolean).join(' ');

/**
 * Grilla de formulario. Cada hijo ocupa una celda; para un campo de ancho
 * completo (Correo, Checkbox de aceptación) envuélvelo en <FormGridItem span="full">.
 *
 * Props: columns (1 | 2), className
 * En pantallas angostas siempre es de 1 columna.
 */
export function FormGrid({ columns = 2, className, children }) {
  return <div className={cx(styles.grid, styles[`cols${columns}`], className)}>{children}</div>;
}

/** Celda de FormGrid. span="full" ocupa todas las columnas. */
export function FormGridItem({ span = 1, className, children }) {
  return <div className={cx(span === 'full' && styles.full, className)}>{children}</div>;
}

export default FormGrid;
