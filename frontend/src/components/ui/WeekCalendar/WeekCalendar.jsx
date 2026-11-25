// src/components/ui/WeekCalendar/WeekCalendar.jsx

import styles from './WeekCalendar.module.css';

const cx = (...classes) => classes.filter(Boolean).join(' ');

/**
 * Grilla semanal genérica: columnas = días, filas = bloques horarios.
 * Es un componente COMÚN (enunciado, sección 9): no sabe qué es una reserva
 * ni un bloqueo; solo pinta celdas con un tono y un texto. La usan la HU-3
 * (disponibilidad del espacio) y puede usarla la HU-5 (vista previa del bloqueo).
 *
 * Props:
 *  - columns: [{ key, label, highlight? }]          ej. { key: '2026-09-14', label: 'Lun 14/09' }
 *  - rows:    [{ key, label }]                      ej. { key: 'bloque_003', label: '10:00' }
 *  - cells:   cells[fila][columna] = {
 *               tone:        'free' | 'busy' | 'mine' | 'unavailable' | 'alert'
 *               label:       texto visible ("Libre", "Ocupado", "Cerrado"…)
 *               title?:      texto completo para lector de pantalla / tooltip
 *               selectable?: true → la celda es un botón
 *             }
 *  - selectedKey: 'filaKey|columnaKey' de la celda elegida (o null)
 *  - selectedLabel: texto de la celda elegida (por defecto "Seleccionado")
 *  - onSelect({ rowKey, columnKey, cell }): clic en una celda seleccionable
 *  - caption:  descripción accesible de la tabla
 *  - className
 */
export default function WeekCalendar({
  columns = [],
  rows = [],
  cells = [],
  selectedKey = null,
  selectedLabel = 'Seleccionado',
  onSelect,
  caption,
  className,
}) {
  return (
    <div className={cx(styles.scroller, className)}>
      <table className={styles.table}>
        {caption && <caption className={styles.caption}>{caption}</caption>}

        <thead>
          <tr>
            <td className={styles.corner} />
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cx(styles.dayHeader, column.highlight && styles.highlight)}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={row.key}>
              <th scope="row" className={styles.timeHeader}>
                {row.label}
              </th>

              {columns.map((column, columnIndex) => {
                const cell = cells[rowIndex]?.[columnIndex];
                const key = `${row.key}|${column.key}`;
                return (
                  <td key={key} className={styles.slot}>
                    {cell && (
                      <CalendarCell
                        cell={cell}
                        isSelected={selectedKey === key}
                        selectedLabel={selectedLabel}
                        onClick={() => onSelect?.({ rowKey: row.key, columnKey: column.key, cell })}
                      />
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Una celda: botón si se puede elegir, texto si no. */
function CalendarCell({ cell, isSelected, selectedLabel, onClick }) {
  const className = cx(styles.cell, styles[cell.tone], isSelected && styles.selected);
  const text = isSelected ? selectedLabel : cell.label;

  if (cell.selectable) {
    return (
      <button
        type="button"
        className={cx(className, styles.button)}
        title={cell.title}
        aria-label={cell.title}
        aria-pressed={isSelected}
        onClick={onClick}
      >
        {text}
      </button>
    );
  }

  return (
    <span className={className} title={cell.title}>
      {text}
    </span>
  );
}