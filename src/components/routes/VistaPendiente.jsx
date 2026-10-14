// src/components/routes/VistaPendiente.jsx
// Marcador temporal de vistas que aún no se construyen (se reemplaza fase a fase).

import PageShell from '../layout/PageShell/PageShell';
import styles from './VistaPendiente.module.css';

export default function VistaPendiente({ titulo, screen = 'account' }) {
  return (
    <PageShell screen={screen}>
      <div className={styles.root}>
        <h1 className={styles.title}>{titulo}</h1>
        <p className={styles.text}>Esta vista se construye en una fase posterior.</p>
      </div>
    </PageShell>
  );
}
