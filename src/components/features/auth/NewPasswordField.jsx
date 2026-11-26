// src/components/features/auth/NewPasswordField.jsx

import PasswordField from '../../ui/PasswordField/PasswordField';
import {
  describePasswordRules,
  PASSWORD_REQUIREMENTS_TEXT,
} from '../../../utils/validators';

/**
 * Campo de contraseña NUEVA con el feedback de requisitos (una sola regla
 * para registro, Mi cuenta y recuperación). Un solo mensaje por vez:
 *  - cumple todo           → verde: "Cumple los 8 caracteres, una mayúscula y un número."
 *  - no cumple y ya tocó   → rojo con los requisitos
 *  - no cumple y aún no    → gris con los requisitos
 *
 * Props: showError (cuándo mostrar el rojo), errorMsg (error externo, prioritario)
 * y el resto va a PasswordField (label, name, value, onChange, onBlur…).
 */
export default function NewPasswordField({
  label = 'Contraseña',
  value,
  showError = false,
  errorMsg,
  ...rest
}) {
  const { allOk, successText } = describePasswordRules(value);

  let feedback;
  if (errorMsg) feedback = { errorMsg };
  else if (allOk) feedback = { successMsg: successText };
  else if (showError) feedback = { errorMsg: PASSWORD_REQUIREMENTS_TEXT };
  else feedback = { hint: PASSWORD_REQUIREMENTS_TEXT };

  return (
    <PasswordField
      label={label}
      value={value}
      autoComplete="new-password"
      {...feedback}
      {...rest}
    />
  );
}
