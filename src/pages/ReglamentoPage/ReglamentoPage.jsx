// src/pages/ReglamentoPage/ReglamentoPage.jsx

import ContentLayout from '../../components/layout/ContentLayout/ContentLayout';
import Card from '../../components/ui/Card/Card';
import { EARLY_ARRIVAL_MINUTES } from '../../utils/tolerance';
import {
  DIAS_BLOQUEO_POR_INASISTENCIAS,
  DURACION_BLOQUE_MIN,
  HORAS_CANCELACION_SIN_PENALIDAD,
  MOTIVO_MAX_CARACTERES,
  MOTIVO_MIN_CARACTERES,
  TOLERANCIA_LLEGADA_MIN,
  TOPE_HORAS_SEMANALES,
  UMBRAL_INASISTENCIAS,
} from '../../utils/reglas';
import styles from './ReglamentoPage.module.css';

const CONTACTO = 'reservas@ulima.edu.pe';

/* Los números salen de utils/reglas.js: si cambia una regla, el reglamento se
   actualiza solo. Solo se describen reglas que la aplicación ya aplica. */
const SECCIONES = [
  {
    titulo: 'Quién puede reservar',
    items: [
      'Pueden reservar los estudiantes con una cuenta activa y correo institucional.',
      'Los encargados de cada sede administran los espacios y operan las reservas del día.',
    ],
  },
  {
    titulo: 'Cómo se reserva',
    items: [
      `Cada reserva ocupa un bloque de ${DURACION_BLOQUE_MIN} minutos de un espacio disponible.`,
      `Debes indicar el motivo de la reserva (entre ${MOTIVO_MIN_CARACTERES} y ${MOTIVO_MAX_CARACTERES} caracteres) y el número de asistentes, que no puede superar el aforo del espacio.`,
      'No puedes tener dos reservas que se crucen en el mismo horario, ni reservar un bloque ya ocupado o que ya pasó.',
      `El tope es de ${TOPE_HORAS_SEMANALES} horas reservadas por semana (de lunes a sábado), sumando todos los espacios. Puedes ver tu consumo en Mi cuenta.`,
    ],
  },
  {
    titulo: 'Llegada y tolerancia',
    items: [
      `El encargado registra tu llegada desde ${EARLY_ARRIVAL_MINUTES} minutos antes del inicio del bloque.`,
      `Pasados ${TOLERANCIA_LLEGADA_MIN} minutos del inicio, la llegada se considera tardía y el encargado puede marcar tu inasistencia y liberar el bloque.`,
    ],
  },
  {
    titulo: 'Cancelaciones',
    items: [
      `Puedes cancelar tu reserva hasta ${HORAS_CANCELACION_SIN_PENALIDAD} horas antes del inicio sin consecuencias.`,
      `Si cancelas con menos de ${HORAS_CANCELACION_SIN_PENALIDAD} horas de anticipación, se registra una inasistencia. Una vez iniciado el bloque ya no se puede cancelar.`,
      'Si el encargado cancela tu reserva (por mantenimiento, un evento institucional u otro motivo), no se registra inasistencia y verás el motivo en Mis reservas.',
    ],
  },
  {
    titulo: 'Inasistencias y bloqueo',
    items: [
      `Al acumular ${UMBRAL_INASISTENCIAS} inasistencias, tus reservas se bloquean durante ${DIAS_BLOQUEO_POR_INASISTENCIAS} días, contados desde la última inasistencia.`,
    ],
  },
  {
    titulo: 'Cuidado de los espacios',
    items: [
      'Si encuentras un problema en un espacio (equipamiento, infraestructura, limpieza o seguridad), repórtalo desde Mis incidencias para que el encargado le dé seguimiento.',
    ],
  },
];

export default function ReglamentoPage() {
  return (
    <ContentLayout screen="info">
      <h1 className={styles.title}>Reglamento de uso de espacios</h1>
      <p className={styles.intro}>
        Estas son las reglas que aplica Reserva UL al reservar laboratorios, salas de estudio y
        auditorios de la Universidad de Lima. Dudas: <a href={`mailto:${CONTACTO}`}>{CONTACTO}</a>.
      </p>

      <div className={styles.sections}>
        {SECCIONES.map((seccion) => (
          <Card key={seccion.titulo} as="section" title={seccion.titulo} padding="lg">
            <ul className={styles.list}>
              {seccion.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </ContentLayout>
  );
}
