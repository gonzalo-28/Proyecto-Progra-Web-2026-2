// src/pages/DailyTrayPage/DailyTrayPage.jsx
//
// HU-5 · Bandeja del día (mockups 5.1, 5.2 y 5.3).
// ESQUELETO del Paso 1: fija la ruta, el layout y el encabezado. Los
// contadores, los grupos por espacio y las filas llegan en los pasos
// siguientes, cuando esté acordado el contrato de la reserva con la HU-4.

import ContentLayout from '../../components/layout/ContentLayout/ContentLayout';
import PageHeader from '../../components/ui/PageHeader/PageHeader';
import ButtonLink from '../../components/ui/Button/ButtonLink';
import Alert from '../../components/ui/Alert/Alert';
import { RUTAS_ENCARGADO } from '../../components/routes/rutasEncargado';

export default function DailyTrayPage() {
  return (
    <ContentLayout screen="managerTray">
      <PageHeader
        title="Bandeja del día"
        subtitle="Reservas de hoy en los espacios a tu cargo"
        actions={
          <ButtonLink to={RUTAS_ENCARGADO.busqueda} variant="outline">
            Buscar reserva
          </ButtonLink>
        }
      />
      <Alert variant="info">
        Vista en construcción (HU-5): aquí irán los contadores y las reservas
        agrupadas por espacio.
      </Alert>
    </ContentLayout>
  );
}
