// src/components/layout/SplitAuthLayout/SplitAuthLayout.jsx

import PageShell from '../PageShell/PageShell';
import styles from './SplitAuthLayout.module.css';

export default function SplitAuthLayout({ children, aside, screen }) {
  return (
    <PageShell screen={screen}>
      <div className={styles.splitContainer}>
        <div className={styles.asideWrapper}>
          {aside}
        </div>
        <div className={styles.formWrapper}>
          {children}
        </div>
      </div>
    </PageShell>
  );
}