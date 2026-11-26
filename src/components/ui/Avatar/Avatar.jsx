// src/components/ui/Avatar/Avatar.jsx

import styles from './Avatar.module.css';

const cx = (...classes) => classes.filter(Boolean).join(' ');

/** "Camila Rojas" -> "CR". Toma la inicial de las dos primeras palabras. */
function getInitials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('');
}

/**
 * Círculo con las iniciales del usuario (o su foto si hay `src`).
 *
 * Props: name, src?, size ('sm' | 'md'), className
 */
export default function Avatar({ name, src, size = 'md', className }) {
  return (
    <span
      className={cx(styles.root, styles[size], className)}
      aria-hidden="true"
    >
      {src ? (
        <img className={styles.image} src={src} alt="" />
      ) : (
        getInitials(name)
      )}
    </span>
  );
}
