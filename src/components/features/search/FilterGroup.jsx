// src/components/features/search/FilterGroup.jsx

import styles from './FilterGroup.module.css';

/**
 * Grupo del panel de filtros con su título en mayúscula pequeña
 * ("TIPO DE ESPACIO", "AFORO MÍNIMO"…). Es un fieldset para lectores de pantalla.
 *
 * Props: title, children
 */
export default function FilterGroup({ title, children }) {
  return (
    <fieldset className={styles.root}>
      <legend className={styles.title}>{title}</legend>
      {children}
    </fieldset>
  );
}
