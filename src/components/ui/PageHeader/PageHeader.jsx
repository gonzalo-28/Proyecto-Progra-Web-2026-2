// src/components/ui/PageHeader/PageHeader.jsx

import styles from './PageHeader.module.css';

const cx = (...classes) => classes.filter(Boolean).join(' ');

/**
 * Encabezado de página: título grande, subtítulo gris y acciones a la derecha.
 *
 * Props:
 *  - title:     "Bandeja del día"
 *  - subtitle:  "Lunes 14/09/2026 · 14 reservas en los espacios a mi cargo"
 *  - actions:   nodo a la derecha (‹ Hoy ›, "Buscar reserva"…)
 *  - className: clase extra
 *
 * No conoce el negocio: cualquier HU puede usarlo.
 */
export default function PageHeader({ title, subtitle, actions, className }) {
  return (
    <header className={cx(styles.root, className)}>
      <div className={styles.text}>
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </header>
  );
}
