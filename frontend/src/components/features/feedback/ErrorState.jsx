// src/components/features/feedback/ErrorState.jsx

import styles from './ErrorState.module.css';

/**
 * Contenido de las pantallas 403 y 404.
 *
 * Props:
 *  - code:        texto grande verde ("404"); en 403 se usa `icon` en su lugar
 *  - icon:        nodo (p. ej. <StatusIcon variant="danger" />)
 *  - title:       "Acceso denegado" / "Página no encontrada"
 *  - description: se recibe por prop porque cambia según el contexto
 *  - actions:     nodo con los botones (Button / ButtonLink)
 */
export default function ErrorState({ code, icon, title, description, actions }) {
  return (
    <section className={styles.root} aria-labelledby="error-title">
      {icon}
      {code && <p className={styles.code}>{code}</p>}
      <h1 id="error-title" className={styles.title}>
        {title}
      </h1>
      {description && <p className={styles.description}>{description}</p>}
      {actions && <div className={styles.actions}>{actions}</div>}
    </section>
  );
}
