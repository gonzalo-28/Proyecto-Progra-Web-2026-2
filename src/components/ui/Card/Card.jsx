// src/components/ui/Card/Card.jsx

import styles from './Card.module.css';

const cx = (...classes) => classes.filter(Boolean).join(' ');

/**
 * Contenedor blanco con borde y radio.
 *
 * Props:
 *  - as:        etiqueta HTML ('div' | 'article' | 'section'…)
 *  - title:     título verde opcional ("Datos personales")
 *  - padding:   'none' | 'md' | 'lg'
 *               none → para contenido a sangre (ej. imagen arriba en SpaceCard)
 *  - className: clase extra
 */
export default function Card({
  as: Tag = 'div',
  title,
  padding = 'md',
  className,
  children,
  ...rest
}) {
  return (
    <Tag className={cx(styles.root, styles[padding], className)} {...rest}>
      {title && <h2 className={styles.title}>{title}</h2>}
      {children}
    </Tag>
  );
}
