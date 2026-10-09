// src/components/layout/Navbar/AutchActions.jsx

import ButtonLink from '../../ui/Button/ButtonLink';
import { ROUTES } from './navbarConfig';
import styles from './Navbar.module.css';

const ACTIONS = {
  login: { to: ROUTES.login, label: 'Ingresar', variant: 'outline' },
  register: { to: ROUTES.register, label: 'Crear cuenta', variant: 'primary' },
};

/* Orden fijo del mockup: Ingresar primero, Crear cuenta después. */
const ORDER = ['login', 'register'];

/**
 * Botones de visitante.
 * Props: actions — subconjunto de ['login', 'register'] a mostrar.
 */
export default function AuthActions({ actions = [] }) {
  const visible = ORDER.filter((key) => actions.includes(key));
  if (visible.length === 0) return null;

  return (
    <div className={styles.actions}>
      {visible.map((key) => (
        <ButtonLink
          key={key}
          to={ACTIONS[key].to}
          variant={ACTIONS[key].variant}
          size="sm"
        >
          {ACTIONS[key].label}
        </ButtonLink>
      ))}
    </div>
  );
}
