// src/components/layout/AuthCardLayout/AuthCardLayout.jsx

import PageShell from '../PageShell/PageShell';
import Card from '../../ui/Card/Card';
import styles from './AuthCardLayout.module.css';

const cx = (...classes) => classes.filter(Boolean).join(' ');

/**
 * PageShell + una card blanca centrada horizontalmente.
 * La usan Recuperar contraseña, Registro de estudiante y Registro de encargado.
 *
 * Props:
 *  - screen, navbarProps, footerProps: se pasan a PageShell
 *  - width: 'sm' | 'md'   (sm = estados cortos como "Cuenta creada"; md = formularios)
 *  - above: nodo sobre la card (el Stepper de Recuperar)
 *  - below: nodo bajo la card (el Alert info de Recuperar)
 *  - className: clase extra para la card
 */
export default function AuthCardLayout({
  screen,
  navbarProps,
  footerProps,
  width = 'md',
  above,
  below,
  className,
  children,
}) {
  return (
    <PageShell screen={screen} navbarProps={navbarProps} footerProps={footerProps}>
      <div className={styles.stage}>
        {above && <div className={cx(styles.slot, styles[width])}>{above}</div>}
        <Card padding="lg" className={cx(styles.card, styles[width], className)}>
          {children}
        </Card>
        {below && <div className={cx(styles.slot, styles[width])}>{below}</div>}
      </div>
    </PageShell>
  );
}
