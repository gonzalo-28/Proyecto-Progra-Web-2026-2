// src/components/ui/Pagination/Pagination.jsx

import styles from './Pagination.module.css';

const cx = (...classes) => classes.filter(Boolean).join(' ');

/**
 * Paginador ‹ 1 2 3 › (mockup 3.1). Genérico: no sabe qué se pagina.
 * No se muestra si hay una sola página.
 *
 * Props: page (desde 1), totalPages, onChange(numero), label (accesible)
 */
export default function Pagination({ page, totalPages, onChange, label = 'Paginación' }) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className={styles.root} aria-label={label}>
      <button
        type="button"
        className={styles.button}
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Página anterior"
      >
        ‹
      </button>

      {pages.map((number) => (
        <button
          key={number}
          type="button"
          className={cx(styles.button, number === page && styles.current)}
          onClick={() => onChange(number)}
          aria-current={number === page ? 'page' : undefined}
          aria-label={`Página ${number}`}
        >
          {number}
        </button>
      ))}

      <button
        type="button"
        className={styles.button}
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Página siguiente"
      >
        ›
      </button>
    </nav>
  );
}
