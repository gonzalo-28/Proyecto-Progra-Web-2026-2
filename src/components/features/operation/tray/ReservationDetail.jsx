// src/components/features/operation/tray/ReservationDetail.jsx

import DetailActions from './DetailActions';
import { UMBRAL_INASISTENCIAS } from '../../../../utils/reglas';
import styles from './ReservationDetail.module.css';

/** Un dato del detalle: label en mayúscula pequeña + valor. */
function Field({ label, children, wide = false }) {
  return (
    <div className={wide ? styles.wide : undefined}>
      <dt className={styles.label}>{label}</dt>
      <dd className={styles.value}>{children}</dd>
    </div>
  );
}

const CANCEL_LABEL = { estudiante: 'el estudiante', encargado: 'el encargado' };

/**
 * Contenido de la fila expandida (mockup 5.3): datos de la reserva y del
 * estudiante a la izquierda; tolerancia y acciones a la derecha.
 *
 * Props:
 *  - reserva: vista de la reserva
 */
export default function ReservationDetail({ reserva }) {
  const { estudiante } = reserva;
  const { inasistencias } = estudiante;

  return (
    <div className={styles.root}>
      <dl className={styles.fields}>
        <Field label="Reserva">
          <span className={styles.code}>{reserva.codigo}</span>
        </Field>
        <Field label="Código de estudiante">{estudiante.codigo ?? '—'}</Field>
        <Field label="Correo">{estudiante.correo || '—'}</Field>
        <Field label="Inasistencias acumuladas">
          <span className={inasistencias >= UMBRAL_INASISTENCIAS ? styles.alert : undefined}>
            {inasistencias}
            {inasistencias >= UMBRAL_INASISTENCIAS && ' · alcanzó el umbral'}
          </span>
        </Field>
        <Field label="Motivo" wide>
          {reserva.motivo || '—'}
        </Field>
        <Field label="Invitados" wide>
          {reserva.invitados.length > 0 ? reserva.invitados.join(' · ') : 'Sin invitados'}
        </Field>
        {reserva.cancelacion && (
          <Field label="Cancelación" wide>
            Cancelada por {CANCEL_LABEL[reserva.cancelacion.porRol] ?? reserva.cancelacion.porRol}
            {reserva.cancelacion.motivo && ` · ${reserva.cancelacion.motivo}`}
            {reserva.cancelacion.detalle && ` · ${reserva.cancelacion.detalle}`}
          </Field>
        )}
        {reserva.operadaPor && (
          <Field label="Registrado por" wide>
            {reserva.operadaPor}
          </Field>
        )}
      </dl>

      <div className={styles.side}>
        <DetailActions reserva={reserva} />
      </div>
    </div>
  );
}
