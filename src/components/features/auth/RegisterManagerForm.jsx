// src/components/features/auth/RegisterManagerForm.jsx

import { useState } from 'react';
import Alert from '../../ui/Alert/Alert';
import Button from '../../ui/Button/Button';
import ButtonLink from '../../ui/Button/ButtonLink';
import FormActions from '../../ui/FormActions/FormActions';
import { FormGrid, FormGridItem } from '../../ui/FormGrid/FormGrid';
import Select from '../../ui/Select/Select';
import InstitutionalEmailField from './InstitutionalEmailField';
import NewPasswordField from './NewPasswordField';
import PersonNameFields from './PersonNameFields';
import {
  getInstitutionalEmailError,
  isBlank,
  isPasswordValid,
  PASSWORD_REQUIREMENTS_TEXT,
} from '../../../utils/validators';
import styles from './RegisterManagerForm.module.css';

const DEFAULT_ERROR = 'No pudimos enviar tu solicitud. Inténtalo de nuevo.';

const INITIAL_VALUES = {
  nombres: '',
  apellidos: '',
  correo: '',
  contrasena: '',
  sedeAsignadaId: '',
};

/** Errores de TODO el formulario (sirve para bloquear el envío). */
function validate(values) {
  const errors = {};

  if (isBlank(values.nombres)) errors.nombres = 'Ingresa tus nombres.';
  if (isBlank(values.apellidos)) errors.apellidos = 'Ingresa tus apellidos.';

  const emailError = getInstitutionalEmailError(values.correo);
  if (emailError) errors.correo = emailError;

  if (!isPasswordValid(values.contrasena)) errors.contrasena = PASSWORD_REQUIREMENTS_TEXT;
  if (isBlank(values.sedeAsignadaId)) errors.sedeAsignadaId = 'Selecciona la sede asignada.';

  return errors;
}

/**
 * Formulario "Registro de encargado de espacios". No conoce useAuth ni los
 * servicios: recibe todo por props. Según el mockup no pide confirmar la
 * contraseña (a diferencia del registro de estudiante).
 *
 * Props:
 *  - onSubmit(datos): async; hace el registro. Un rechazo con code 'VALIDACION'
 *                     y `campos` se pinta junto a cada campo; cualquier otro
 *                     error sale como Alert arriba.
 *  - sedes: [{ value, label }]
 *  - cancelTo: ruta del botón "Cancelar"
 */
export default function RegisterManagerForm({ onSubmit, sedes = [], cancelTo = '/login' }) {
  const [values, setValues] = useState(INITIAL_VALUES);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [serverErrors, setServerErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const errors = validate(values);

  const shouldShow = (name) => submitted || Boolean(touched[name]);
  // El error aparece al salir del campo o al intentar enviar.
  const errorFor = (name) => serverErrors[name] ?? (shouldShow(name) ? errors[name] : undefined);

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
      await onSubmit({
        nombres: values.nombres.trim(),
        apellidos: values.apellidos.trim(),
        correo: values.correo.trim(),
        contrasena: values.contrasena,
        sedeAsignadaId: values.sedeAsignadaId,
      });
    } catch (error) {
      if (error?.code === 'VALIDACION' && error.campos) setServerErrors(error.campos);
      else setFormError(error?.message || DEFAULT_ERROR);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section aria-labelledby="registro-encargado-titulo">
      <header className={styles.header}>
        <h1 id="registro-encargado-titulo" className={styles.title}>
          Registro de encargado de espacios
        </h1>
      </header>

      <Alert variant="info" className={styles.alert}>
        La cuenta queda pendiente de aprobación por la Dirección de Servicios Académicos.
      </Alert>

      <form onSubmit={handleSubmit} noValidate>
        {formError && (
          <Alert variant="error" className={styles.alert}>
            {formError}
          </Alert>
        )}

        <FormGrid columns={2}>
          <PersonNameFields
            values={values}
            errors={{ nombres: errorFor('nombres'), apellidos: errorFor('apellidos') }}
            onChange={handleChange}
            onBlur={handleBlur}
          />

          <FormGridItem span="full">
            <InstitutionalEmailField
              name="correo"
              value={values.correo}
              onChange={handleChange}
              onBlur={handleBlur}
              showError={shouldShow('correo')}
              errorMsg={serverErrors.correo}
              required
            />
          </FormGridItem>

          <FormGridItem>
            <NewPasswordField
              name="contrasena"
              value={values.contrasena}
              onChange={handleChange}
              onBlur={handleBlur}
              showError={shouldShow('contrasena')}
              errorMsg={serverErrors.contrasena}
              required
            />
          </FormGridItem>
          <FormGridItem>
            <Select
              label="Sede asignada"
              name="sedeAsignadaId"
              value={values.sedeAsignadaId}
              onChange={handleChange}
              onBlur={handleBlur}
              options={sedes}
              placeholder="Selecciona la sede"
              errorMsg={errorFor('sedeAsignadaId')}
            />
          </FormGridItem>
        </FormGrid>

        <FormActions divider>
          <ButtonLink to={cancelTo} variant="outline">
            Cancelar
          </ButtonLink>
          <Button type="submit" isLoading={isSubmitting} loadingText="Enviando…">
            Enviar solicitud
          </Button>
        </FormActions>
      </form>
    </section>
  );
}
