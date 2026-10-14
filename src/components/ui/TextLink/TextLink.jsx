// src/components/ui/TextLink/TextLink.jsx

import { Link } from 'react-router-dom';
import styles from './TextLink.module.css';

const cx = (...classes) => classes.filter(Boolean).join(' ');

/**
 * Enlace de texto verde (Regístrate, ¿Olvidaste tu contraseña?, Reglamento de uso…).
 *
 * Props:
 *  - to:      ruta interna (react-router)
 *  - href:    URL externa o mailto (se abre como <a> normal)
 *  - onClick: sin to ni href se renderiza como <button> con aspecto de link
 *  - className, children, ...rest (aria-*, target…)
 */
export default function TextLink({ to, href, onClick, className, children, ...rest }) {
  const classes = cx(styles.root, className);

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={cx(classes, styles.button)} {...rest}>
      {children}
    </button>
  );
}
