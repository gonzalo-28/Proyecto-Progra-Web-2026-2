// src/components/features/spaces/InfoStrip.jsx

import styles from './InfoStrip.module.css';

const cx = (...classes) => classes.filter(Boolean).join(' ');

/**
 * Franja de fondo verde suave con las reglas clave de uso.
 *
 * Props:
 *  - items: [{ title, text }]  (en el mockup son 3)
 *  - className
 */
export default function InfoStrip({ items = [], className }) {
  return (
    <section
      className={cx(styles.root, className)}
      aria-label="Reglas clave de uso"
    >
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.title} className={styles.item}>
            <h3 className={styles.title}>{item.title}</h3>
            <p className={styles.text}>{item.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
