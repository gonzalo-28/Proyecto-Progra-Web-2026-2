// src/pages/ReservationSearchPage/ReservationSearchPage.jsx
//
// HU-5 · Búsqueda de reservas por código, espacio o usuario (mockup 5.5).
// ESQUELETO del Paso 1: el buscador y la tabla de resultados llegan en los
// pasos siguientes.

import ContentLayout from '../../components/layout/ContentLayout/ContentLayout';
import PageHeader from '../../components/ui/PageHeader/PageHeader';
import Alert from '../../components/ui/Alert/Alert';

export default function ReservationSearchPage() {
  return (
    <ContentLayout screen="manager">
      <PageHeader title="Búsqueda de reservas" />
      <Alert variant="info">
        Vista en construcción (HU-5): búsqueda por código, espacio o usuario.
      </Alert>
    </ContentLayout>
  );
}
