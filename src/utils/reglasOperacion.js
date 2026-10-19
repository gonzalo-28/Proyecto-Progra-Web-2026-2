// src/utils/reglasOperacion.js
//
// Reglas de la operación diaria (HU-5) en UN solo lugar, igual que reglas.js
// para la HU-4. El servicio y los formularios leen de aquí.

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
