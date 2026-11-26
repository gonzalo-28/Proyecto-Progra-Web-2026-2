// src/components/layout/ContentLayout/ContentLayout.jsx

import PageShell from '../PageShell/PageShell';
import styles from './ContentLayout.module.css';

const cx = (...classes) => classes.filter(Boolean).join(' ');

/**
 * PageShell + contenedor centrado con ancho máximo y márgenes laterales.
 * Lo usan la Landing y Mi cuenta.
 *
 * Props:
 *  - screen, navbarProps, footerProps: se pasan tal cual a PageShell
 *  - spacing:   'md' (padding vertical, por defecto) | 'none'
 *               'none' deja que la página maneje su propio ritmo vertical
 *               (la Landing lo necesita para que el hero toque el navbar).
 *  - className: clase extra para el contenedor
 */
export default function ContentLayout({
  screen,
  navbarProps,
  footerProps,
  spacing = 'md',
  className,
  children,
}) {
  return (
    <PageShell
      screen={screen}
      navbarProps={navbarProps}
      footerProps={footerProps}
    >
      <div className={cx(styles.container, styles[spacing], className)}>
        {children}
      </div>
    </PageShell>
  );
}
