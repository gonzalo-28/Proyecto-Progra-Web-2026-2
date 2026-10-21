// src/components/features/availability/AvailabilityHeader.jsx

import { useAvailability } from '../../../context/AvailabilityContext';
import WeekNavigator from './WeekNavigator';
import styles from './AvailabilityHeader.module.css';

/**
 * "Disponibilidad · <espacio>" + la semana (o la franja aplicada) + ‹ Hoy ›.
 * Mockups 3.4 a 3.6.
 */
export default function AvailabilityHeader() {
  const { datos, cargando, franja, irASemana, irAHoy } = useAvailability();
  const { espacio, semana } = datos;
  const esSemanaActual = semana.dias.some((dia) => dia.esHoy);

  const subtitulo = franja
    ? `Filtro aplicado: ${semana.rangoTexto.replace(' al ', ' – ')} · entre ${franja.desde || 'la apertura'} y ${franja.hasta || 'el cierre'}`
    : `Semana del ${semana.rangoTexto}`;

  return (
    <header className={styles.root}>
      <div className={styles.text}>
        <h1 className={styles.title}>Disponibilidad · {espacio.nombre}</h1>
        <p className={styles.subtitle}>{subtitulo}</p>
      </div>

      <WeekNavigator
        onPrevious={() => irASemana(semana.anterior)}
        onToday={irAHoy}
        onNext={() => irASemana(semana.siguiente)}
        isCurrentWeek={esSemanaActual}
        disabled={cargando}
      />
    </header>
  );
}
