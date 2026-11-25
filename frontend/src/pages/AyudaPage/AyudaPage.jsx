// src/pages/AyudaPage/AyudaPage.jsx

import ContentLayout from '../../components/layout/ContentLayout/ContentLayout';
import Card from '../../components/ui/Card/Card';
import TextLink from '../../components/ui/TextLink/TextLink';
import {
  DIAS_BLOQUEO_POR_INASISTENCIAS,
  HORAS_CANCELACION_SIN_PENALIDAD,
  TOPE_HORAS_SEMANALES,
  UMBRAL_INASISTENCIAS,
} from '../../utils/reglas';
import styles from './AyudaPage.module.css';

const CONTACTO = 'reservas@ulima.edu.pe';

const PREGUNTAS = [
  {
    pregunta: '¿Cómo reservo un espacio?',
    respuesta: (
      <>
        Busca el espacio en <TextLink to="/espacios">Espacios</TextLink>, elige un bloque libre en
        su calendario semanal y completa el motivo y los asistentes. Necesitas iniciar sesión como
        estudiante.
      </>
    ),
  },
  {
    pregunta: '¿Cómo cancelo una reserva?',
    respuesta: (
      <>
        Entra a <TextLink to="/mis-reservas">Mis reservas</TextLink> y cancela la reserva desde su
        tarjeta. Hazlo al menos {HORAS_CANCELACION_SIN_PENALIDAD} horas antes del inicio; si no, se
        registra una inasistencia.
      </>
    ),
  },
  {
    pregunta: '¿Por qué no puedo reservar?',
    respuesta: (
      <>
        Puede ser por alguno de estos motivos: ya usaste tus {TOPE_HORAS_SEMANALES} horas de la
        semana, el bloque está ocupado o ya pasó, tienes otra reserva en el mismo horario, o tu
        cuenta está bloqueada por acumular {UMBRAL_INASISTENCIAS} inasistencias (el bloqueo dura{' '}
        {DIAS_BLOQUEO_POR_INASISTENCIAS} días). Revisa tu consumo en Mi cuenta y las reglas en el{' '}
        <TextLink to="/reglamento">reglamento</TextLink>.
      </>
    ),
  },
  {
    pregunta: 'Olvidé mi contraseña',
    respuesta: (
      <>
        Usa <TextLink to="/recuperar">Recuperar contraseña</TextLink> con tu correo institucional y
        sigue los pasos para crear una nueva.
      </>
    ),
  },
  {
    pregunta: 'Registré mi cuenta de encargado y no puedo ingresar',
    respuesta:
      'Las cuentas de encargado quedan pendientes hasta que la Dirección de Servicios Académicos las apruebe. Si pasó un tiempo prudente, escríbenos.',
  },
  {
    pregunta: 'Encontré un problema en un espacio',
    respuesta: (
      <>
        Repórtalo desde <TextLink to="/mis-incidencias">Mis incidencias</TextLink> indicando el
        espacio, el tipo de problema y una descripción. Podrás seguir su estado desde ahí.
      </>
    ),
  },
];

export default function AyudaPage() {
  return (
    <ContentLayout screen="info">
      <h1 className={styles.title}>Mesa de ayuda</h1>
      <p className={styles.intro}>Respuestas a las dudas más frecuentes sobre las reservas.</p>

      <div className={styles.layout}>
        <Card as="section" title="Preguntas frecuentes" padding="lg">
          <div className={styles.faq}>
            {PREGUNTAS.map(({ pregunta, respuesta }) => (
              <details key={pregunta} className={styles.item}>
                <summary className={styles.summary}>{pregunta}</summary>
                <p className={styles.answer}>{respuesta}</p>
              </details>
            ))}
          </div>
        </Card>

        <Card as="section" title="¿Sigues con dudas?" padding="lg">
          <p className={styles.contact}>
            Escríbenos a <a href={`mailto:${CONTACTO}`}>{CONTACTO}</a> y cuéntanos qué pasó.
          </p>
        </Card>
      </div>
    </ContentLayout>
  );
}
