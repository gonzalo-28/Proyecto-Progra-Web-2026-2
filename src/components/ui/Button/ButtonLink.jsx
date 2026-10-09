// src/components/ui/Button/ButtonLink.jsx

import { Link } from 'react-router-dom';
import styles from './Button.module.css';

const cx = (...classes) => classes.filter(Boolean).join(' ');

export default function ButtonLink({
  to,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  children,
  ...rest
}) {
  return (
    <Link
      to={to}
      className={cx(
        styles.root,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        className
      )}
      {...rest}
    >
      {children}
    </Link>
  );
}