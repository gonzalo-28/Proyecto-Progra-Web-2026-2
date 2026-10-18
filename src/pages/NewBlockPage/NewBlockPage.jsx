// src/pages/NewBlockPage/NewBlockPage.jsx
//
// HU-5 · Nuevo bloqueo por mantenimiento (mockup 5.4).
// ESQUELETO del Paso 1: el formulario, la vista previa y la lista de
// reservas afectadas llegan en los pasos siguientes.

import ContentLayout from '../../components/layout/ContentLayout/ContentLayout';
import PageHeader from '../../components/ui/PageHeader/PageHeader';
import Alert from '../../components/ui/Alert/Alert';

export default function NewBlockPage() {
  return (
    <ContentLayout screen="manager">
      <PageHeader title="Nuevo bloqueo por mantenimiento" />
      <Alert variant="info">
        Vista en construcción (HU-5): formulario del bloqueo y vista previa
        sobre el calendario.
      </Alert>
    </ContentLayout>
  );
}
