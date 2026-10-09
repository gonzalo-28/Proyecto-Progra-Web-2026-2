// src/components/ui/Spinner/Spineer.jsx

import styles from './Spinner.module.css';

/**
 * Indicador de carga. Hereda el color del texto (currentColor), así que
 * dentro de un Button primario se ve blanco y dentro de uno outline, verde.
 *
 * Props:
 *  - size: 'sm' | 'md'
 *  - className: clase extra para posicionamiento externo
 */
export default function Spinner({ size = 'md', className }) {
  const classes = [styles.root, styles[size], className].filter(Boolean).join(' ');
  return <span className={classes} aria-hidden="true" />;
}