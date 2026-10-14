// src/pages/ProfilePage/ProfilePage.jsx

import { useAuth } from '../../context/AuthContext';
import { obtenerCarreras, obtenerCiclos, obtenerSedes } from '../../services/catalogService';
import { getWeekRangeLabel } from '../../utils/dates';
import ContentLayout from '../../components/layout/ContentLayout/ContentLayout';
import ChangePasswordForm from '../../components/features/account/ChangePasswordForm';
import ProfileForm from '../../components/features/account/ProfileForm';
import UsageCard from '../../components/features/account/UsageCard';
import Card from '../../components/ui/Card/Card';
import styles from './ProfilePage.module.css';

const LIMITE_HORAS_SEMANALES = 8;
// TODO(HU-4): reemplazar por el consumo real cuando exista el servicio de reservas.
const USO_SEMANA = { used: 0, absences: 0 };

/**
 * Mi cuenta (estudiante y encargado). Es la única pieza que habla con useAuth
 * y con los servicios; los formularios reciben todo por props. "Uso de la
 * semana" solo aplica al estudiante.
 */
export default function ProfilePage() {
  const { usuario, actualizarPerfil, cambiarContrasena } = useAuth();
  const esEstudiante = usuario.rol === 'estudiante';

  const sedeLabel = obtenerSedes().find((sede) => sede.value === usuario.sedeAsignadaId)?.label;

  const handleCambiarContrasena = ({ contrasenaActual, contrasenaNueva }) =>
    cambiarContrasena(contrasenaActual, contrasenaNueva);

  return (
    <ContentLayout screen="account">
      <h1 className={styles.title}>Mi cuenta</h1>

      <div className={styles.grid}>
        <Card as="section" title="Datos personales" padding="lg">
          <ProfileForm
            rol={usuario.rol}
            initialValues={usuario}
            sedeLabel={sedeLabel ?? usuario.sedeAsignadaId ?? ''}
            carreras={obtenerCarreras()}
            ciclos={obtenerCiclos()}
            onSubmit={actualizarPerfil}
          />
        </Card>

        <div className={styles.column}>
          <Card as="section" title="Cambiar contraseña" padding="lg">
            <ChangePasswordForm onSubmit={handleCambiarContrasena} />
          </Card>

          {esEstudiante && (
            <UsageCard
              used={USO_SEMANA.used}
              limit={LIMITE_HORAS_SEMANALES}
              rangeLabel={getWeekRangeLabel()}
              absences={USO_SEMANA.absences}
            />
          )}
        </div>
      </div>
    </ContentLayout>
  );
}
