// src/components/ui/WeekCalendar/WeekCalendarLegend.jsx

import calendarStyles from './WeekCalendar.module.css';
import styles from './WeekCalendarLegend.module.css';

/**
 * Leyenda de la grilla: una muestra de color por tono + su texto.
 * Usa las MISMAS clases de tono que WeekCalendar, así nunca se desalinean.
 *
 * Props:
 *  - items: [{ tone: 'free' | 'busy' | 'mine' | 'unavailable' | 'alert', label }]
 *  - className
 */
export default function WeekCalendarLegend({ items = [], className }) {
  return (
    <ul className={[styles.root, className].filter(Boolean).join(' ')} aria-label="Leyenda">
      {items.map((item) => (
        <li key={item.tone} className={styles.item}>
          <span className={`${styles.swatch} ${calendarStyles[item.tone]}`} aria-hidden="true" />
          {item.label}
        </li>
      ))}
    </ul>
  );
}