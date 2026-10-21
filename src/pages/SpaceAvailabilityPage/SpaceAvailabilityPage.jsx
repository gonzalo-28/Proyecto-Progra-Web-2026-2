// src/pages/SpaceAvailabilityPage/SpaceAvailabilityPage.jsx
//
// HU-3 · Vista de detalle del espacio: ficha + equipamiento + calendario
// semanal (mockups 3.4, 3.5 y 3.6). Ruta pública: el visitante consulta en
// modo lectura; para reservar debe iniciar sesión como estudiante.
//
// La página solo COMPONE. Los datos y las acciones viven en
// AvailabilityProvider y cada pieza los lee con useAvailability().

import { useParams } from 'react-router-dom';
import ContentLayout from '../../components/layout/ContentLayout/ContentLayout';
import Card from '../../components/ui/Card/Card';
import Button from '../../components/ui/Button/Button';
import ButtonLink from '../../components/ui/Button/ButtonLink';
import ErrorState from '../../components/features/feedback/ErrorState';
import AvailabilityHeader from '../../components/features/availability/AvailabilityHeader';
import AvailabilityCalendar from '../../components/features/availability/AvailabilityCalendar';
import AvailabilitySkeleton from '../../components/features/availability/AvailabilitySkeleton';
import FullWeekNotice from '../../components/features/availability/FullWeekNotice';
import NoSlotsInRange from '../../components/features/availability/NoSlotsInRange';
import SelectionBar from '../../components/features/availability/SelectionBar';
import SpaceSummaryCard from '../../components/features/availability/SpaceSummaryCard';
import WeekSummaryCard from '../../components/features/availability/WeekSummaryCard';
import { AvailabilityProvider } from '../../context/AvailabilityProvider';
import { useAvailability } from '../../context/AvailabilityContext';
import { RUTAS_ESPACIOS } from '../../components/routes/rutasEspacios';
import styles from './SpaceAvailabilityPage.module.css';

export default function SpaceAvailabilityPage() {
  const { espacioId } = useParams();

  return (
    <ContentLayout screen="availability">
      {/* key: al pasar a otro espacio, el estado (selección, cargas) empieza de cero */}
      <AvailabilityProvider key={espacioId} espacioId={espacioId}>
        <AvailabilityContent />
      </AvailabilityProvider>
    </ContentLayout>
  );
}

/** Elige qué mostrar según el estado: error, carga, sin bloques o calendario. */
function AvailabilityContent() {
  const { datos, error, franja, reintentar } = useAvailability();

  if (error?.code === 'NO_ENCONTRADO') {
    return (
      <ErrorState
        code="404"
        title="Espacio no encontrado"
        description={error.message}
        actions={<ButtonLink to={RUTAS_ESPACIOS.busqueda}>Buscar otro espacio</ButtonLink>}
      />
    );
  }

  if (error) {
    return (
      <ErrorState
        title="No pudimos cargar la disponibilidad"
        description="Revisa tu conexión e inténtalo de nuevo."
        actions={<Button onClick={reintentar}>Reintentar</Button>}
      />
    );
  }

  if (!datos) return <AvailabilitySkeleton />;

  const sinBloquesEnFranja = Boolean(franja) && datos.sinDisponibilidad; // 3.6
  const semanaSinLibres = !franja && datos.sinDisponibilidad; // 3.5

  return (
    <div className={styles.root}>
      <AvailabilityHeader />

      <div className={styles.layout}>
        <Card as="section" padding="lg" className={styles.main} aria-label="Calendario de disponibilidad">
          {sinBloquesEnFranja ? (
            <NoSlotsInRange />
          ) : (
            <>
              {semanaSinLibres && <FullWeekNotice />}
              <AvailabilityCalendar />
              {semanaSinLibres ? <FullWeekNotice position="bottom" /> : <SelectionBar />}
            </>
          )}
        </Card>

        <aside className={styles.aside}>
          <SpaceSummaryCard />
          <WeekSummaryCard />
        </aside>
      </div>
    </div>
  );
}
