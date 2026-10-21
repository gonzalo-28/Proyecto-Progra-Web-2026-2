// src/components/features/operation/tray/EmptyDay.jsx

import EmptyState from '../../../ui/EmptyState/EmptyState';
import Button from '../../../ui/Button/Button';
import ButtonLink from '../../../ui/Button/ButtonLink';
import { RUTAS_ENCARGADO } from '../../../routes/rutasEncargado';
import {
  addDays,
  formatShortDate,
  getWeekdayName,
  isSunday,
} from '../../../../utils/dates';

/**
 * Jornada sin reservas (mockup 5.2).
 * El texto cambia si el día mostrado es hoy y si cae domingo (el campus no
 * atiende; en ese caso ofrece saltar al lunes).
 *
 * Props:
 *  - date:     día mostrado, 'YYYY-MM-DD'
 *  - isToday:  boolean
 *  - onGoToDate(iso): para el botón "Ver el lunes DD/MM"
 */
export default function EmptyDay({ date, isToday, onGoToDate }) {
  const sunday = isSunday(date);
  const nextMonday = addDays(date, 1);

  const title = isToday
    ? 'No hay reservas para hoy'
    : `No hay reservas para el ${getWeekdayName(date)} ${formatShortDate(date)}`;

  const description = sunday
    ? 'Los espacios del campus no atienden los domingos. Puedes revisar la jornada del lunes o registrar un bloqueo por mantenimiento.'
    : 'No hay reservas en los espacios a tu cargo para esta fecha. Puedes revisar otro día o registrar un bloqueo por mantenimiento.';

  return (
    <EmptyState
      icon="☾"
      title={title}
      description={description}
      actions={
        <>
          {sunday && (
            <Button variant="outline" onClick={() => onGoToDate(nextMonday)}>
              Ver el lunes {formatShortDate(nextMonday)}
            </Button>
          )}
          <ButtonLink to={RUTAS_ENCARGADO.bloqueos}>Nuevo bloqueo</ButtonLink>
        </>
      }
    />
  );
}
