import { forwardRef } from 'react';
import Spinner from '../Spinner/Spinner';
import styles from './Button.module.css';

const cx = (...classes) => classes.filter(Boolean).join(' ');

/**
 * Botón base de ReservaUL.
 *
 * Props:
 *  - variant:     'primary' | 'outline' | 'ghost'   (ghost = "Descartar")
 *  - size:        'sm' | 'md' | 'lg'                (sm = navbar, lg = CTA de ancho completo)
 *  - fullWidth:   ocupa todo el ancho del contenedor (Ingresar, Actualizar contraseña…)
 *  - isLoading:   muestra spinner dentro del botón y lo bloquea
 *  - loadingText: texto mientras carga (ej. "Verificando…"); si falta, se mantiene children
 *  - disabled, type ('button' | 'submit'), onClick, className
 *  - ...rest:     cualquier atributo nativo (aria-*, form, name…)
 *
 * Mientras isLoading=true el botón conserva su color (como en el mockup) y
 * queda deshabilitado, así que no dispara un segundo submit.
 */
const Button = forwardRef(function Button(
  {
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    isLoading = false,
    loadingText,
    disabled = false,
    type = 'button',
    className,
    children,
    ...rest
  },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={cx(
        styles.root,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        isLoading && styles.loading,
        className
      )}
      {...rest}
    >
      {isLoading && <Spinner size="sm" />}
      <span>{isLoading && loadingText ? loadingText : children}</span>
    </button>
  );
});

export default Button;