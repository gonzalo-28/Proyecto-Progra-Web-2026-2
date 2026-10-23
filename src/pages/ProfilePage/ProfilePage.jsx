// src/pages/ProfilePage/ProfilePage.jsx

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { obtenerCarreras, obtenerCiclos, obtenerSedes } from '../../services/catalogService';
import { obtenerUsoSemanal } from '../../services/reservationService';
import ContentLayout from '../../components/layout/ContentLayout/ContentLayout';
import ChangePasswordForm from '../../components/features/account/ChangePasswordForm';
import ProfileForm from '../../components/features/account/ProfileForm';
import UsageCard from '../../components/features/account/UsageCard';
import Alert from '../../components/ui/Alert/Alert';
import Card from '../../components/ui/Card/Card';
import Skeleton from '../../components/ui/Skeleton/Skeleton';
import styles from './ProfilePage.module.css';

const ERROR_USO = 'No pudimos cargar tu uso de la semana. Inténtalo de nuevo más tarde.';

/** 'YYYY-MM-DD' → 'DD/MM' */
const diaMes = (fechaISO) => fechaISO.split('-').reverse().slice(0, 2).join('/');

/**
 * Mi cuenta (estudiante y encargado). Es la única pieza que habla con useAuth
 * y con los servicios; los formularios reciben todo por props. "Uso de la
 * semana" solo aplica al estudiante.
 */
export default function ProfilePage() {
  const { usuario, actualizarPerfil, cambiarContrasena } = useAuth();
  const esEstudiante = usuario.rol === 'estudiante';

  // Uso semanal real (solo estudiante). Si el resultado guardado es de otro
  // usuario o aún no llega, la consulta está en curso.
  const [resultadoUso, setResultadoUso] = useState({ usuarioId: null, uso: null, error: false });
  const cargandoUso = esEstudiante && resultadoUso.usuarioId !== usuario.id;

  useEffect(() => {
    if (!esEstudiante) return undefined;
    let activo = true; // descarta la respuesta si el componente se desmonta
    obtenerUsoSemanal(usuario.id)
      .then((uso) => {
        if (activo) setResultadoUso({ usuarioId: usuario.id, uso, error: false });
      })
      .catch(() => {
        if (activo) setResultadoUso({ usuarioId: usuario.id, uso: null, error: true });
      });
    return () => {
      activo = false;
    };
  }, [esEstudiante, usuario.id]);

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

          {esEstudiante && cargandoUso && (
            <Card as="section" aria-label="Uso de la semana" role="status" className={styles.usoCargando}>
              <span className={styles.visuallyHidden}>Cargando tu uso de la semana…</span>
              <Skeleton width="45%" height="0.9rem" />
              <Skeleton width="70%" height="1.4rem" />
              <Skeleton width="100%" height="0.6rem" radius="pill" />
              <Skeleton width="55%" height="0.9rem" />
            </Card>
          )}

          {esEstudiante && !cargandoUso && resultadoUso.error && (
            <Alert variant="error">{ERROR_USO}</Alert>
          )}

          {esEstudiante && !cargandoUso && resultadoUso.uso && (
            <UsageCard
              used={resultadoUso.uso.usadas}
              limit={resultadoUso.uso.tope}
              rangeLabel={`${diaMes(resultadoUso.uso.desde)} – ${diaMes(resultadoUso.uso.hasta)}`}
              absences={resultadoUso.uso.inasistencias}
            />
          )}
        </div>
      </div>
    </ContentLayout>
  );
}