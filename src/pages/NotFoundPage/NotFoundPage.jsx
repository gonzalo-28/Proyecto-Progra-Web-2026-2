// src/pages/NotFoundPage/NotFoundPage.jsx

import StatusLayout from '../../components/layout/StatusLayout/StatusLayout';
import ErrorState from '../../components/features/feedback/ErrorState';
import ButtonLink from '../../components/ui/Button/ButtonLink';
import { ROUTES } from '../../components/layout/Navbar/navbarConfig';

export default function NotFoundPage() {
  return (
    <StatusLayout screen="notFound">
      <ErrorState
        code="404"
        title="Página no encontrada"
        description="El espacio o la reserva que buscas ya no existe o cambió de dirección."
        actions={<ButtonLink to={ROUTES.home}>Ir al inicio</ButtonLink>}
      />
    </StatusLayout>
  );
}
