// src/components/features/availability/AvailabilityCalendar.jsx

import { useAvailability } from '../../../context/AvailabilityContext';
import WeekCalendar from '../../ui/WeekCalendar/WeekCalendar';
import WeekCalendarLegend from '../../ui/WeekCalendar/WeekCalendarLegend';
import { aCeldaCalendario, LEYENDA_DISPONIBILIDAD } from './calendarCells';
import styles from './AvailabilityCalendar.module.css';

/**
 * Leyenda + grilla semanal del espacio (mockup 3.4). Une los datos del
 * servicio con el componente común WeekCalendar.
 */
export default function AvailabilityCalendar() {
  const { datos, cargando, seleccion, seleccionar, puedeElegir } = useAvailability();
  const { espacio, semana, filas } = datos;

  const columns = semana.dias.map((dia) => ({ key: dia.fecha, label: dia.etiqueta, highlight: dia.esHoy }));
  const rows = filas.map((fila) => ({ key: fila.bloque.id, label: fila.bloque.horaInicio }));
  const cells = filas.map((fila) =>
    fila.celdas.map((celda, i) =>
      aCeldaCalendario(celda, { dia: semana.dias[i], bloque: fila.bloque, puedeElegir })
    )
  );

  return (
    <div className={styles.root} aria-busy={cargando}>
      <WeekCalendarLegend items={LEYENDA_DISPONIBILIDAD} />
      <WeekCalendar
        caption={`Disponibilidad de ${espacio.nombre}, semana del ${semana.rangoTexto}`}
        columns={columns}
        rows={rows}
        cells={cells}
        selectedKey={seleccion ? `${seleccion.bloqueId}|${seleccion.fecha}` : null}
        onSelect={({ rowKey, columnKey }) => seleccionar({ fecha: columnKey, bloqueId: rowKey })}
        className={cargando ? styles.stale : undefined}
      />
    </div>
  );
}
