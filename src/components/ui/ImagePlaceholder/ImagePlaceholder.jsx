// src/components/ui/ImagePlaceholder/ImagePlaceholder.jsx

import styles from './ImagePlaceholder.module.css';

const cx = (...classes) => classes.filter(Boolean).join(' ');

/**
 * Marcador de imagen: fondo con rayado diagonal y etiqueta opcional en
 * tipografía monoespaciada, como en los mockups (hero, tarjetas de espacios
 * y panel izquierdo del login).
 *
 * Props:
 *  - label:     texto centrado ("fotografía · sala de estudio"). Sin label,
 *               el marcador es decorativo y se oculta a lectores de pantalla.
 *  - ratio:     proporción CSS ('16/9', '4/3', '1/1'). Sin ratio, el
 *               componente LLENA a su contenedor (ancho y alto 100%).
 *  - rounded:   aplica esquinas redondeadas (hero y cards sí; login no).
 *  - className: clase extra
 *  - children:  contenido opcional que se muestra bajo la etiqueta
 */
export default function ImagePlaceholder({
  label,
  ratio,
  rounded = false,
  className,
  children,
}) {
  return (
    <div
      className={cx(
        styles.root,
        ratio && styles.hasRatio,
        rounded && styles.rounded,
        className
      )}
      style={ratio ? { aspectRatio: ratio } : undefined}
      role={label ? 'img' : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
    >
      {label && <span className={styles.label}>{label}</span>}
      {children}
    </div>
  );
}