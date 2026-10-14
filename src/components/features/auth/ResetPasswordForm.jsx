// src/components/features/auth/ResetPasswordForm.jsx

import { useState } from 'react';
import Alert from '../../ui/Alert/Alert';
import Button from '../../ui/Button/Button';
import ButtonLink from '../../ui/Button/ButtonLink';
import FormActions from '../../ui/FormActions/FormActions';
import { FormGrid, FormGridItem } from '../../ui/FormGrid/FormGrid';
import PasswordField from '../../ui/PasswordField/PasswordField';
import NewPasswordField from './NewPasswordField';
import {
  isBlank,
  isPasswordValid,
  PASSWORD_REQUIREMENTS_TEXT,
  passwordsMatch,
} from '../../../utils/validators';
import styles from './RecoverForms.module.css';

const DEFAULT_ERROR = 'No pudimos actualizar tu contraseña. Inténtalo de nuevo.';

const INITIAL_VALUES = { contrasenaNueva: '', confirmacion: '' };

/** Errores de TODO el formulario (sirve para bloquear el envío). */
function validate(values) {
  const errors = {};
  if (!isPasswordValid(values.contrasenaNueva)) errors.contrasenaNueva = PASSWORD_REQUIREMENTS_TEXT;
  if (isBlank(values.confirmacion)) errors.confirmacion = 'Confirma tu contraseña.';
  else if (!passwordsMatch(values.contrasenaNueva, values.confirmacion)) {
    errors.confirmacion = 'Las contraseñas no coinciden.';
  }
  return errors;
}

/**
 * Paso 3 de la recuperación: fijar la nueva contraseña. No conoce useAuth.
 *
 * Props:
 *  - correo:   cuenta a la que pertenece el enlace (solo se muestra)
 *  - onSubmit(contrasenaNueva): async; restablece. Un rechazo con code
 *              'VALIDACION' y `campos` se pinta junto al campo; otro error, en un Alert.
 *  - loginTo:  ruta de "Volver al inicio de sesión"
 */
export default function ResetPasswordForm({ correo, onSubmit, loginTo = '/login' }) {
  const [values, setValues] = useState(INITIAL_VALUES);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [serverErrors, setServerErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const errors = validate(values);
  const shouldShow = (name) => submitted || Boolean(touched[name]);
  // La confirmación avisa en vivo apenas se empieza a escribir.
  const confirmationError =
    serverErrors.confirmacion ??
    (shouldShow('confirmacion') || values.confirmacion !== '' ? errors.confirmacion : undefined);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setServerErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev));
    if (formError) setFormError('');
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
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    try {
      await onSubmit(values.contrasenaNueva);
    } catch (error) {
      if (error?.code === 'VALIDACION' && error.campos) setServerErrors(error.campos);
      else setFormError(error?.message || DEFAULT_ERROR);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section aria-labelledby="recuperar-nueva-titulo">
      <h1 id="recuperar-nueva-titulo" className={styles.title}>
        Crea tu nueva contraseña
      </h1>
      <p className={styles.description}>Cuenta: {correo}</p>

      <form onSubmit={handleSubmit} noValidate>
        {formError && (
          <Alert variant="error" className={styles.alert}>
            {formError}
          </Alert>
        )}

        <FormGrid columns={2}>
          <FormGridItem>
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
          </FormGridItem>
          <FormGridItem>
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
          </FormGridItem>
        </FormGrid>

        <FormActions align="start">
          <ButtonLink to={loginTo} variant="outline">
            Volver al inicio de sesión
          </ButtonLink>
          <Button type="submit" isLoading={isSubmitting} loadingText="Guardando…">
            Guardar contraseña
          </Button>
        </FormActions>
      </form>
    </section>
  );
}
