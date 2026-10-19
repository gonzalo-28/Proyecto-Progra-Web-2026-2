// src/pages/DailyTrayPage/DailyTrayPage.jsx
//
// HU-5 · Bandeja del día (mockups 5.1, 5.2 y 5.3).
// Paso 2: navegación entre días (en la URL, ?fecha=YYYY-MM-DD) y estado vacío.
// Los contadores y las reservas agrupadas por espacio se conectan en el
// Paso 3, cuando esté acordado el contrato de la reserva con la HU-4.

import ContentLayout from '../../components/layout/ContentLayout/ContentLayout';
import PageHeader from '../../components/ui/PageHeader/PageHeader';
import ButtonLink from '../../components/ui/Button/ButtonLink';
import DayNavigator from '../../components/features/operation/tray/DayNavigator';
import EmptyDay from '../../components/features/operation/tray/EmptyDay';
import { RUTAS_ENCARGADO } from '../../components/routes/rutasEncargado';
import useDateParam from '../../hooks/useDateParam';
import { formatDayLabel } from '../../utils/dates';

export default function DailyTrayPage() {
  const { date, today, isToday, setDate } = useDateParam();

  return (
    <ContentLayout screen="managerTray">
      <PageHeader
        title="Bandeja del día"
        subtitle={formatDayLabel(date)}
        actions={
          <>
            <DayNavigator date={date} today={today} onChange={setDate} />
            <ButtonLink to={RUTAS_ENCARGADO.busqueda} variant="outline">
              Buscar reserva
            </ButtonLink>
          </>
        }
      />

      {/* TODO(Paso 3): si hay reservas → <StatusCounters /> + grupos por espacio. */}
      <EmptyDay date={date} isToday={isToday} onGoToDate={setDate} />
    </ContentLayout>
  );
}
