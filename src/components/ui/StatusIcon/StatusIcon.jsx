// src/components/ui/StatusIcon/StatusIcon.jsx

import styles from './StatusIcon.module.css';

const cx = (...classes) => classes.filter(Boolean).join(' ');

const ICONS = {
  // check
  success: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  // círculo prohibido
  danger: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M6.3 6.3l11.4 11.4" />
    </>
  ),
  // reloj
  pending: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
};

/**
 * Círculo suave con icono (check en "Cuenta creada", prohibido en 403).
 *
 * Props:
 *  - variant: 'success' | 'danger' | 'pending'
 *             'pending' (reloj) NO aparece en los mockups: se usa en la
 *             pantalla "pendiente de aprobación" del encargado.
 *  - size:    'sm' | 'md'
 * Es decorativo (aria-hidden): el texto de al lado dice lo importante.
 */
export default function StatusIcon({ variant = 'success', size = 'md', className }) {
  return (
    <span className={cx(styles.root, styles[variant], styles[size], className)} aria-hidden="true">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {ICONS[variant] ?? ICONS.success}
      </svg>
    </span>
  );
}
