// src/components/ui/Stepper/Stepper.jsx

import styles from './Stepper.module.css';

const cx = (...classes) => classes.filter(Boolean).join(' ');

/**
 * Pastillas "Paso N · Nombre" (recuperación de contraseña).
 *
 * Props:
 *  - steps:   ['Correo', 'Enlace', 'Nueva contraseña']
 *  - current: paso activo, empezando en 1 (igual que el texto "Paso 1")
 *  - className
 */
export default function Stepper({ steps = [], current = 1, className }) {
  return (
    <ol className={cx(styles.root, className)} aria-label="Pasos">
      {steps.map((step, index) => {
        const number = index + 1;
        const state = number === current ? 'active' : number < current ? 'done' : 'todo';
        return (
          <li
            key={step}
            className={cx(styles.step, styles[state])}
            aria-current={state === 'active' ? 'step' : undefined}
          >
            Paso {number} · {step}
          </li>
        );
      })}
    </ol>
  );
}
