// src/pages/RecoverPasswordPage/RecoverPasswordPage.jsx

import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthCardLayout from '../../components/layout/AuthCardLayout/AuthCardLayout';
import RecoverEmailForm from '../../components/features/auth/RecoverEmailForm';
import RecoverLinkStep from '../../components/features/auth/RecoverLinkStep';
import ResetPasswordForm from '../../components/features/auth/ResetPasswordForm';
import StatusCard from '../../components/features/auth/StatusCard';
import Alert from '../../components/ui/Alert/Alert';
import Button from '../../components/ui/Button/Button';
import ButtonLink from '../../components/ui/Button/ButtonLink';
import Stepper from '../../components/ui/Stepper/Stepper';

const STEPS = ['Correo', 'Enlace', 'Nueva contraseña'];
const TOKEN_FALSO = 'invalido'; // al simular el enlace de un correo sin cuenta: no revela si existe

/**
 * Recuperación de contraseña en 3 pasos, en una sola ruta (/recuperar):
 *   1. Correo          → sin ?token=
 *   2. Enlace          → tras pedirlo (estado de la página; simula el correo)
 *   3. Nueva contraseña → con ?token=<token>, previa verificación del enlace
 * Es la única pieza que habla con useAuth; los formularios reciben todo por props.
 */
export default function RecoverPasswordPage() {
  const { solicitarRecuperacion, verificarTokenRecuperacion, restablecerContrasena } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [enlaceEnviado, setEnlaceEnviado] = useState(null); // { correo, token }
  const [restablecido, setRestablecido] = useState(false);
  const [verificacion, setVerificacion] = useState(null); // { token, ok, correo?, message? }

  // Verifica el enlace cada vez que cambia el token. El resultado se guarda junto
  // al token que lo originó, así un resultado viejo nunca se muestra con otro token.
  useEffect(() => {
    if (!token) return undefined;
    let activo = true;
    verificarTokenRecuperacion(token)
      .then(({ correo }) => activo && setVerificacion({ token, ok: true, correo }))
      .catch((error) => activo && setVerificacion({ token, ok: false, message: error.message }));
    return () => {
      activo = false;
    };
  }, [token, verificarTokenRecuperacion]);

  const verificado = token && verificacion?.token === token ? verificacion : null;

  const handleSolicitar = async (correo) => {
    const respuesta = await solicitarRecuperacion(correo);
    setEnlaceEnviado({ correo: respuesta.correo, token: respuesta.token });
  };

  const handleAbrirEnlace = () => setSearchParams({ token: enlaceEnviado.token ?? TOKEN_FALSO });

  const handleSolicitarNuevo = () => {
    setEnlaceEnviado(null);
    setSearchParams({});
  };

  const handleRestablecer = async (contrasenaNueva) => {
    await restablecerContrasena(token, contrasenaNueva);
    setRestablecido(true);
    setSearchParams({}, { replace: true });
  };

  const ayuda = (
    <Alert variant="info">
      Si no recibes el correo en 5 minutos, revisa la carpeta de correo no deseado o escribe a
      reservas@ulima.edu.pe.
    </Alert>
  );

  const renderPaso = (paso, contenido, below) => (
    <AuthCardLayout
      screen="recover"
      width="md"
      above={<Stepper steps={STEPS} current={paso} />}
      below={below}
    >
      {contenido}
    </AuthCardLayout>
  );

  // Contraseña actualizada: todos los pasos quedan completados.
  if (restablecido) {
    return renderPaso(
      STEPS.length + 1,
      <StatusCard
        variant="success"
        title="Contraseña actualizada"
        message="Ya puedes iniciar sesión con tu nueva contraseña."
        action={
          <ButtonLink to="/login" size="lg" fullWidth>
            Ir a iniciar sesión
          </ButtonLink>
        }
      />
    );
  }

  // Llegó por el enlace del correo.
  if (token) {
    if (!verificado) {
      return renderPaso(
        2,
        <StatusCard variant="pending" title="Verificando enlace…" />
      );
    }
    if (!verificado.ok) {
      return renderPaso(
        2,
        <StatusCard
          variant="danger"
          title="No pudimos validar el enlace"
          message={verificado.message}
          action={
            <Button size="lg" fullWidth onClick={handleSolicitarNuevo}>
              Solicitar un nuevo enlace
            </Button>
          }
        />
      );
    }
    return renderPaso(
      3,
      <ResetPasswordForm correo={verificado.correo} onSubmit={handleRestablecer} loginTo="/login" />
    );
  }

  if (enlaceEnviado) {
    return renderPaso(
      2,
      <RecoverLinkStep correo={enlaceEnviado.correo} onOpenLink={handleAbrirEnlace} loginTo="/login" />,
      ayuda
    );
  }

  return renderPaso(1, <RecoverEmailForm onSubmit={handleSolicitar} loginTo="/login" />, ayuda);
}
