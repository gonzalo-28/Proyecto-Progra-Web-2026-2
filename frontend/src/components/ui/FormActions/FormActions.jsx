// src/components/ui/FormActions/FormActions.jsx

import styles from './FormActions.module.css';

const cx = (...classes) => classes.filter(Boolean).join(' ');

/**
 * Fila de botones al pie de un formulario.
 *
 * Props:
 *  - align:   'end' (por defecto: Cancelar + Crear cuenta) | 'start' (Recuperar)
 *  - divider: línea superior, como en los registros y Mi cuenta
 *  - className, children (los <Button>)
 */
export default function FormActions({ align = 'end', divider = false, className, children }) {
  return (
    <div className={cx(styles.root, styles[align], divider && styles.divider, className)}>
      {children}
    </div>
  );
}
