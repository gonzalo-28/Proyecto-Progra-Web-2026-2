// src/components/ui/EmptyState/EmptyState.jsx

import styles from './EmptyState.module.css';

const cx = (...classes) => classes.filter(Boolean).join(' ');

/**
 * Estado vacío de una vista ("toda vista que pueda quedar sin datos
 * contempla su estado vacío", requerimiento no funcional del curso).
 *
 * Props:
 *  - icon:        símbolo o nodo dentro del círculo ("☾")
 *  - title:       "No hay reservas para hoy"
 *  - description: texto gris de ayuda
 *  - actions:     nodo con botones
 *  - className
 *
 * Usa <h2>: la página ya tiene su <h1> en el encabezado.
 */
export default function EmptyState({ icon, title, description, actions, className }) {
  return (
    <section className={cx(styles.root, className)}>
      {icon && (
        <div className={styles.icon} aria-hidden="true">
          {icon}
        </div>
      )}
      <h2 className={styles.title}>{title}</h2>
      {description && <p className={styles.description}>{description}</p>}
      {actions && <div className={styles.actions}>{actions}</div>}
    </section>
  );
}
