// src/components/features/auth/RecoverEmailForm.jsx

import { useState } from 'react';
import Alert from '../../ui/Alert/Alert';
import Button from '../../ui/Button/Button';
import ButtonLink from '../../ui/Button/ButtonLink';
import FormActions from '../../ui/FormActions/FormActions';
import InstitutionalEmailField from './InstitutionalEmailField';
import { getInstitutionalEmailError } from '../../../utils/validators';
import styles from './RecoverForms.module.css';

const DEFAULT_ERROR = 'No pudimos enviar el enlace. Inténtalo de nuevo.';

/**
 * Paso 1 de la recuperación: pedir el enlace por correo. No conoce useAuth.
 *
 * Props:
 *  - onSubmit(correo): async; pide el enlace. Un rechazo con code 'VALIDACION'
 *                      y `campos` se pinta junto al campo; otro error, en un Alert.
 *  - loginTo: ruta de "Volver al inicio de sesión"
 */
export default function RecoverEmailForm({ onSubmit, loginTo = '/login' }) {
  const [correo, setCorreo] = useState('');
  const [touched, setTouched] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    setCorreo(event.target.value);
    if (serverError) setServerError('');
    if (formError) setFormError('');
  };

  async function handleSubmit(event) {
    event.preventDefault();
    if (isSubmitting) return;

    setSubmitted(true);
    setFormError('');
    if (getInstitutionalEmailError(correo)) return;

    setIsSubmitting(true);
    try {
      await onSubmit(correo.trim());
    } catch (error) {
      if (error?.code === 'VALIDACION' && error.campos?.correo) setServerError(error.campos.correo);
      else setFormError(error?.message || DEFAULT_ERROR);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section aria-labelledby="recuperar-correo-titulo">
      <h1 id="recuperar-correo-titulo" className={styles.title}>
        Ingresa tu correo institucional
      </h1>
      <p className={styles.description}>
        Te enviaremos un enlace para crear una nueva contraseña. El enlace vence en 30 minutos.
      </p>

      <form onSubmit={handleSubmit} noValidate>
        {formError && (
          <Alert variant="error" className={styles.alert}>
            {formError}
          </Alert>
        )}

        <InstitutionalEmailField
          name="correo"
          value={correo}
          onChange={handleChange}
          onBlur={() => setTouched(true)}
          showError={submitted || touched}
          errorMsg={serverError || undefined}
          required
        />

        <FormActions align="start">
          <ButtonLink to={loginTo} variant="outline">
            Volver al inicio de sesión
          </ButtonLink>
          <Button type="submit" isLoading={isSubmitting} loadingText="Enviando…">
            Enviar enlace
          </Button>
        </FormActions>
      </form>
    </section>
  );
}
