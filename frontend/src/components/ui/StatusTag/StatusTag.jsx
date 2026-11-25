// src/components/ui/StatusTag/StatusTag.jsx

import styles from './StatusTag.module.css';

const cx = (...classes) => classes.filter(Boolean).join(' ');

/**
 * Etiqueta de ESTADO ("Confirmada", "En curso", "Inasistencia"…). Es genérica:
 * no sabe nada de reservas, solo pinta un color. La usan las reservas (HU-4),
 * la bandeja del encargado (HU-5) y las incidencias (HU-6).
 *
 * Se separa de Badge (de HU-1) porque Badge no tiene los tonos "info" (azul) ni
 * "neutral" (gris) que piden los mockups, y así no se modifica su componente.
 *
 * Props:
 *  - tone:     'success' | 'info' | 'warning' | 'danger' | 'neutral'
 *  - children: el texto
 */
export default function StatusTag({ tone = 'neutral', className, children }) {
    return <span className={cx(styles.root, styles[tone], className)}>{children}</span>;
}