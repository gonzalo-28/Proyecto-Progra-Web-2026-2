// src/utils/reglasOperacion.js
//
// Reglas de la operación diaria (HU-5) en UN solo lugar, igual que reglas.js
// para la HU-4. El servicio y los formularios leen de aquí.

import { countDays, isISODate } from './dates';

/** Motivos de cancelación por el encargado (mockup 5.6). */
export const MOTIVOS_CANCELACION = [
  { value: 'mantenimiento_correctivo', label: 'Mantenimiento correctivo' },
  { value: 'corte_energia', label: 'Corte programado de energía' },
  { value: 'uso_academico', label: 'Uso académico prioritario' },
  { value: 'incidencia', label: 'Incidencia reportada' },
  { value: 'otro', label: 'Otro' },
];

/** Largo máximo del detalle de una cancelación. */
export const DETALLE_MAX_CARACTERES = 300;

/** Si el motivo es "Otro", el detalle es obligatorio y debe tener al menos esto. */
export const DETALLE_MIN_CARACTERES_OTRO = 10;

/** Etiqueta visible de un motivo, o null si el código no existe. */
export const etiquetaMotivo = (codigo) =>
  MOTIVOS_CANCELACION.find((motivo) => motivo.value === codigo)?.label ?? null;

/**
 * Valida motivo y detalle de una cancelación del encargado.
 * La usan el formulario (para marcar el campo) y el servicio (que repite la
 * validación como lo haría el servidor).
 *
 * @returns {{ motivo?: string, detalle?: string }} errores por campo (vacío si todo está bien)
 */
export function validarCancelacion({ motivo, detalle }) {
  const errores = {};
  const texto = String(detalle ?? '').trim();

  if (!etiquetaMotivo(motivo)) errores.motivo = 'Selecciona el motivo de la cancelación.';

  if (texto.length > DETALLE_MAX_CARACTERES) {
    errores.detalle = `Máximo ${DETALLE_MAX_CARACTERES} caracteres.`;
  } else if (motivo === 'otro' && texto.length < DETALLE_MIN_CARACTERES_OTRO) {
    errores.detalle = `Si el motivo es "Otro", explica el detalle (mínimo ${DETALLE_MIN_CARACTERES_OTRO} caracteres).`;
  }

  return errores;
}

/* ------------------------------- Bloqueos ---------------------------------- */

/** Tipos de bloqueo (HU-5: "por mantenimiento o evento institucional"). */
export const TIPOS_BLOQUEO = [
  { value: 'mantenimiento', label: 'Mantenimiento' },
  { value: 'evento', label: 'Evento institucional' },
];

/** Alcance dentro de cada día: todo el día o solo algunos bloques. */
export const ALCANCE_BLOQUEO = { todoElDia: 'dia', rango: 'rango' };

/** Máximo de días que puede cubrir un bloqueo. */
export const MAX_DIAS_BLOQUEO = 31;

export const MOTIVO_BLOQUEO_MIN = 10;
export const MOTIVO_BLOQUEO_MAX = 300;

/** Etiqueta de un tipo de bloqueo ('mantenimiento' → 'Mantenimiento'). */
export const etiquetaTipoBloqueo = (tipo) =>
  TIPOS_BLOQUEO.find((t) => t.value === tipo)?.label ?? 'Bloqueo';

/**
 * Valida los datos de un bloqueo. La usan el formulario y el servicio.
 *
 * @param {{ tipo, espacioId, desde, hasta, alcance, bloqueIds, motivo }} datos
 *        alcance: ALCANCE_BLOQUEO; bloqueIds solo cuenta en 'rango'
 * @param {string} hoy  'YYYY-MM-DD'
 * @returns {Object} errores por campo (vacío si todo está bien)
 */
export function validarBloqueo(datos, hoy) {
  const errores = {};
  const motivo = String(datos.motivo ?? '').trim();

  if (!TIPOS_BLOQUEO.some((t) => t.value === datos.tipo)) errores.tipo = 'Elige el tipo de bloqueo.';
  if (!datos.espacioId) errores.espacioId = 'Selecciona el espacio.';

  if (!isISODate(datos.desde)) errores.desde = 'Ingresa la fecha de inicio.';
  else if (datos.desde < hoy) errores.desde = 'No se puede bloquear una fecha pasada.';

  if (!isISODate(datos.hasta)) errores.hasta = 'Ingresa la fecha de fin.';
  else if (!errores.desde && datos.hasta < datos.desde) {
    errores.hasta = 'Debe ser igual o posterior a "Desde".';
  } else if (!errores.desde && countDays(datos.desde, datos.hasta) > MAX_DIAS_BLOQUEO) {
    errores.hasta = `Un bloqueo puede cubrir como máximo ${MAX_DIAS_BLOQUEO} días.`;
  }

  if (datos.alcance === ALCANCE_BLOQUEO.rango && !(datos.bloqueIds?.length > 0)) {
    errores.bloqueIds = 'Elige al menos un bloque horario.';
  }

  if (motivo.length < MOTIVO_BLOQUEO_MIN) {
    errores.motivo = `Describe el motivo (mínimo ${MOTIVO_BLOQUEO_MIN} caracteres).`;
  } else if (motivo.length > MOTIVO_BLOQUEO_MAX) {
    errores.motivo = `Máximo ${MOTIVO_BLOQUEO_MAX} caracteres.`;
  }

  return errores;
}
