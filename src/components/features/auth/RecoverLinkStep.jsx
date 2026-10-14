// src/components/features/auth/RecoverLinkStep.jsx

import Button from '../../ui/Button/Button';
import ButtonLink from '../../ui/Button/ButtonLink';
import StatusCard from './StatusCard';
import styles from './RecoverLinkStep.module.css';

/**
 * Paso 2 de la recuperación: "revisa tu correo". Como en esta entrega no se
 * envían correos reales, el botón "Abrir enlace del correo" simula el clic en
 * el enlace del mensaje. El texto no revela si el correo tiene cuenta.
 *
 * Props:
 *  - correo:      correo al que se "envió" el enlace
 *  - onOpenLink:  simula abrir el enlace
 *  - loginTo:     ruta de "Volver al inicio de sesión"
 */
export default function RecoverLinkStep({ correo, onOpenLink, loginTo = '/login' }) {
  return (
    <StatusCard
      variant="success"
      title="Revisa tu correo"
      message={`Si ${correo} pertenece a una cuenta activa, enviamos un enlace para crear una nueva contraseña. Vence en 30 minutos.`}
      action={
        <div className={styles.actions}>
          <Button size="lg" fullWidth onClick={onOpenLink}>
            Abrir enlace del correo
          </Button>
          <p className={styles.note}>Simulación: en esta versión no se envían correos reales.</p>
          <ButtonLink to={loginTo} variant="outline" fullWidth>
            Volver al inicio de sesión
          </ButtonLink>
        </div>
      }
    />
  );
}
