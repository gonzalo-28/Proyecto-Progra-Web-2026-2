// src/components/features/auth/InstitutionalEmailField.jsx

import TextField from '../../ui/TextField/TextField';
import { getInstitutionalEmailError } from '../../../utils/validators';

/**
 * Correo institucional (@ulima.edu.pe). La regla vive en utils/validators;
 * este campo solo decide CUÁNDO mostrarla.
 *
 * Props:
 *  - showError: el formulario indica si ya toca mostrar el error (campo tocado o envío intentado)
 *  - errorMsg:  error externo (p. ej. "Este correo ya está registrado."); tiene prioridad
 *  - readOnly, hint, label… y el resto se pasan a TextField
 */
export default function InstitutionalEmailField({
  label = 'Correo institucional',
  value,
  showError = false,
  errorMsg,
  readOnly = false,
  ...rest
}) {
  const error = errorMsg ?? (showError && !readOnly ? getInstitutionalEmailError(value) : null);

  return (
    <TextField
      label={label}
      type="email"
      autoComplete="email"
      value={value}
      readOnly={readOnly}
      errorMsg={error ?? undefined}
      {...rest}
    />
  );
}
