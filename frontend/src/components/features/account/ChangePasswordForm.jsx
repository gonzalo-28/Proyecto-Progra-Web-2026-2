// src/components/features/account/ChangePasswordForm.jsx

import { useState } from 'react';
import Alert from '../../ui/Alert/Alert';
import Button from '../../ui/Button/Button';
import PasswordField from '../../ui/PasswordField/PasswordField';
import NewPasswordField from '../auth/NewPasswordField';
import {
  isBlank,
  isPasswordValid,
  PASSWORD_REQUIREMENTS_TEXT,
  passwordsMatch,
} from '../../../utils/validators';
import styles from './AccountForms.module.css';

const DEFAULT_ERROR = 'No pudimos actualizar tu contraseña. Inténtalo de nuevo.';

const INITIAL_VALUES = { contrasenaActual: '', contrasenaNueva: '', confirmacion: '' };

/** Errores de TODO el formulario (sirve para bloquear el envío). */
function validate(values) {
  const errors = {};
  if (isBlank(values.contrasenaActual)) errors.contrasenaActual = 'Ingresa tu contraseña actual.';
  if (!isPasswordValid(values.contrasenaNueva)) errors.contrasenaNueva = PASSWORD_REQUIREMENTS_TEXT;
  if (isBlank(values.confirmacion)) errors.confirmacion = 'Confirma tu nueva contraseña.';
  else if (!passwordsMatch(values.contrasenaNueva, values.confirmacion)) {
    errors.confirmacion = 'Las contraseñas no coinciden.';
  }
  return errors;
}

/**
 * "Cambiar contraseña" de Mi cuenta. No conoce useAuth ni los servicios.
 *
 * Props:
 *  - onSubmit({ contrasenaActual, contrasenaNueva }): async. Un rechazo con
 *    code 'VALIDACION' y `campos` (p. ej. "La contraseña actual es incorrecta.")
 *    se pinta junto a cada campo; otro error, en un Alert. Si todo sale bien
 *    el formulario se limpia y avisa "Contraseña actualizada."
 */
export default function ChangePasswordForm({ onSubmit }) {
  const [values, setValues] = useState(INITIAL_VALUES);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [serverErrors, setServerErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saved, setSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const errors = validate(values);
  const shouldShow = (name) => submitted || Boolean(touched[name]);
  const errorFor = (name) => serverErrors[name] ?? (shouldShow(name) ? errors[name] : undefined);
  // La confirmación avisa en vivo apenas se empieza a escribir.
  const confirmationError =
    serverErrors.confirmacion ??
    (shouldShow('confirmacion') || values.confirmacion !== '' ? errors.confirmacion : undefined);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setServerErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev));
    if (formError) setFormError('');
    if (saved) setSaved(false);
  };

  const handleBlur = (event) => {
    const { name } = event.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  async function handleSubmit(event) {
    event.preventDefault();
    if (isSubmitting) return;

    setSubmitted(true);
    setFormError('');
    setSaved(false);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        contrasenaActual: values.contrasenaActual,
        contrasenaNueva: values.contrasenaNueva,
      });
      setValues(INITIAL_VALUES);
      setTouched({});
      setSubmitted(false);
      setSaved(true);
    } catch (error) {
      if (error?.code === 'VALIDACION' && error.campos) setServerErrors(error.campos);
      else setFormError(error?.message || DEFAULT_ERROR);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className={styles.stack}>
      {formError && <Alert variant="error">{formError}</Alert>}
      {saved && <Alert variant="success">Contraseña actualizada.</Alert>}

      <PasswordField
        label="Contraseña actual"
        name="contrasenaActual"
        value={values.contrasenaActual}
        onChange={handleChange}
        onBlur={handleBlur}
        errorMsg={errorFor('contrasenaActual')}
        autoComplete="current-password"
        required
      />
      <NewPasswordField
        label="Nueva contraseña"
        name="contrasenaNueva"
        value={values.contrasenaNueva}
        onChange={handleChange}
        onBlur={handleBlur}
        showError={shouldShow('contrasenaNueva')}
        errorMsg={serverErrors.contrasenaNueva}
        required
      />
      <PasswordField
        label="Confirmar nueva contraseña"
        name="confirmacion"
        value={values.confirmacion}
        onChange={handleChange}
        onBlur={handleBlur}
        errorMsg={confirmationError}
        autoComplete="new-password"
        required
      />

      <Button type="submit" fullWidth isLoading={isSubmitting} loadingText="Actualizando…">
        Actualizar contraseña
      </Button>
    </form>
  );
}
