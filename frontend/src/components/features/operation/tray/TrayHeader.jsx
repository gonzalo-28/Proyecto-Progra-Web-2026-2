// src/components/features/operation/tray/TrayHeader.jsx

import PageHeader from '../../../ui/PageHeader/PageHeader';
import ButtonLink from '../../../ui/Button/ButtonLink';
import DayNavigator from './DayNavigator';
import { useDailyTray } from '../../../../context/DailyTrayContext';
import { RUTAS_ENCARGADO } from '../../../routes/rutasEncargado';
import { formatDayLabel } from '../../../../utils/dates';

/**
 * Encabezado de la bandeja: "Bandeja del día", fecha + total de reservas,
 * navegación ‹ Hoy › y "Buscar reserva" (mockup 5.1).
 *
 * Props:
 *  - today:        hoy, 'YYYY-MM-DD'
 *  - onChangeDate: (iso) => void
 */
export default function TrayHeader({ today, onChangeDate }) {
  const { date, bandeja } = useDailyTray();
  const total = bandeja?.contadores.total ?? 0;

  const subtitle =
    total > 0
      ? `${formatDayLabel(date)} · ${total} ${total === 1 ? 'reserva' : 'reservas'} en los espacios a mi cargo`
      : formatDayLabel(date);

  return (
    <PageHeader
      title="Bandeja del día"
      subtitle={subtitle}
      actions={
        <>
          <DayNavigator date={date} today={today} onChange={onChangeDate} />
          <ButtonLink to={RUTAS_ENCARGADO.busqueda} variant="outline">
            Buscar reserva
          </ButtonLink>
        </>
      }
    />
  );
}
