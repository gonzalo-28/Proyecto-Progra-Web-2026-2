// src/pages/RegisterStudentPage/RegisterStudentPage.jsx

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { obtenerCarreras, obtenerCiclos } from '../../services/catalogService';
import AuthCardLayout from '../../components/layout/AuthCardLayout/AuthCardLayout';
import RegisterStudentForm from '../../components/features/auth/RegisterStudentForm';
import StatusCard from '../../components/features/auth/StatusCard';
import ButtonLink from '../../components/ui/Button/ButtonLink';

/**
 * Registro de estudiante. Es la única pieza que habla con useAuth y con los
 * servicios; el formulario recibe todo por props.
 * Al terminar NO inicia sesión: muestra "Cuenta creada" → "Ir a iniciar sesión".
 */
export default function RegisterStudentPage() {
  const { registro } = useAuth();
  const [correoCreado, setCorreoCreado] = useState(null);

  const handleSubmit = async (datos) => {
    const usuario = await registro({ rol: 'estudiante', ...datos });
    setCorreoCreado(usuario.correo);
  };

  if (correoCreado) {
    return (
      <AuthCardLayout screen="registerStudent" width="sm">
        <StatusCard
          variant="success"
          title="Cuenta creada"
          message={`Enviamos un enlace de confirmación a ${correoCreado}. Tienes 24 horas para activarla.`}
          action={
            <ButtonLink to="/login" size="lg" fullWidth>
              Ir a iniciar sesión
            </ButtonLink>
          }
        />
      </AuthCardLayout>
    );
  }

  return (
    <AuthCardLayout screen="registerStudent" width="md">
      <RegisterStudentForm
        onSubmit={handleSubmit}
        carreras={obtenerCarreras()}
        ciclos={obtenerCiclos()}
        cancelTo="/login"
      />
    </AuthCardLayout>
  );
}
