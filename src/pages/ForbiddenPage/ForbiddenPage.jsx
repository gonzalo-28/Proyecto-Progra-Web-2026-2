// src/pages/ForbiddenPage/ForbiddenPage.jsx

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { obtenerRutaInicioPorRol } from '../../components/routes/rutasPorRol';
import StatusLayout from '../../components/layout/StatusLayout/StatusLayout';
import ErrorState from '../../components/features/feedback/ErrorState';
import StatusIcon from '../../components/ui/StatusIcon/StatusIcon';
import Button from '../../components/ui/Button/Button';
import ButtonLink from '../../components/ui/Button/ButtonLink';

const CONTACTO = 'reservas@ulima.edu.pe';

/* Texto y botón principal según el rol (el estudiante es el del mockup). */
const CONTENIDO_POR_ROL = {
  estudiante: {
    descripcion: `Tu cuenta de estudiante no tiene permisos sobre la bandeja del día, que es exclusiva del encargado de espacios. Si necesitas acceso, escribe a ${CONTACTO}.`,
    volver: 'Volver a mis reservas',
  },
  encargado: {
    descripcion: `Tu cuenta de encargado no tiene permisos para acceder a esta sección. Si necesitas acceso, escribe a ${CONTACTO}.`,
    volver: 'Volver a la bandeja del día',
  },
};

export default function ForbiddenPage() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate('/login', { replace: true });
    }
  };

  // Visitante que llegó por URL directa: no hay sesión que cerrar.
  if (!usuario) {
    return (
      <StatusLayout screen="forbidden" navbarProps={{ actions: ['login'] }}>
        <ErrorState
          icon={<StatusIcon variant="danger" />}
          title="Acceso denegado"
          description="Necesitas iniciar sesión para ver esta sección."
          actions={<ButtonLink to="/login">Ir a iniciar sesión</ButtonLink>}
        />
      </StatusLayout>
    );
  }

  const contenido = CONTENIDO_POR_ROL[usuario.rol] ?? CONTENIDO_POR_ROL.estudiante;

  return (
    <StatusLayout screen="forbidden">
      <ErrorState
        icon={<StatusIcon variant="danger" />}
        title="Acceso denegado"
        description={contenido.descripcion}
        actions={
          <>
            <Button variant="outline" onClick={handleLogout}>
              Cerrar sesión
            </Button>
            <ButtonLink to={obtenerRutaInicioPorRol(usuario.rol)}>
              {contenido.volver}
            </ButtonLink>
          </>
        }
      />
    </StatusLayout>
  );
}
