// src/pages/RegisterManagerPage/RegisterManagerPage.jsx

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { obtenerSedes } from '../../services/catalogService';
import AuthCardLayout from '../../components/layout/AuthCardLayout/AuthCardLayout';
import { ROUTES } from '../../components/layout/Navbar/navbarConfig';
import RegisterManagerForm from '../../components/features/auth/RegisterManagerForm';
import StatusCard from '../../components/features/auth/StatusCard';
import ButtonLink from '../../components/ui/Button/ButtonLink';

/**
 * Registro de encargado de espacios. Es la única pieza que habla con useAuth
 * y con los servicios. La cuenta nace "pendiente": no puede iniciar sesión
 * hasta que la Dirección de Servicios Académicos la apruebe, así que al
 * terminar se muestra el estado de aprobación pendiente (sin iniciar sesión).
 */
export default function RegisterManagerPage() {
  const { registro } = useAuth();
  const [correoEnviado, setCorreoEnviado] = useState(null);

  const handleSubmit = async (datos) => {
    const usuario = await registro({ rol: 'encargado', ...datos });
    setCorreoEnviado(usuario.correo);
  };

  if (correoEnviado) {
    return (
      <AuthCardLayout screen="registerManager" width="sm">
        <StatusCard
          variant="pending"
          title="Solicitud enviada"
          message={`Tu cuenta (${correoEnviado}) queda pendiente de aprobación por la Dirección de Servicios Académicos. Podrás iniciar sesión cuando sea aprobada.`}
          action={
            <ButtonLink to={ROUTES.home} size="lg" fullWidth>
              Volver al inicio
            </ButtonLink>
          }
        />
      </AuthCardLayout>
    );
  }

  return (
    <AuthCardLayout screen="registerManager" width="md">
      <RegisterManagerForm onSubmit={handleSubmit} sedes={obtenerSedes()} cancelTo="/login" />
    </AuthCardLayout>
  );
}
