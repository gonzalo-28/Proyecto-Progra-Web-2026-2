// src/components/features/auth/RegisterStudentForm.jsx

import { useState } from 'react';
import Alert from '../../ui/Alert/Alert';
import Button from '../../ui/Button/Button';
import ButtonLink from '../../ui/Button/ButtonLink';
import Checkbox from '../../ui/Checkbox/Checkbox';
import FormActions from '../../ui/FormActions/FormActions';
import { FormGrid, FormGridItem } from '../../ui/FormGrid/FormGrid';
import PasswordField from '../../ui/PasswordField/PasswordField';
import Select from '../../ui/Select/Select';
import TextLink from '../../ui/TextLink/TextLink';
import InstitutionalEmailField from './InstitutionalEmailField';
import NewPasswordField from './NewPasswordField';
import PersonNameFields from './PersonNameFields';
import {
  getInstitutionalEmailError,
  INSTITUTIONAL_DOMAIN,
  isBlank,
  isPasswordValid,
  PASSWORD_REQUIREMENTS_TEXT,
  passwordsMatch,
} from '../../../utils/validators';
import styles from './RegisterStudentForm.module.css';

const DEFAULT_ERROR = 'No pudimos crear tu cuenta. Inténtalo de nuevo.';

const INITIAL_VALUES = {
  nombres: '',
  apellidos: '',
  correo: '',
  contrasena: '',
  confirmacion: '',
  carrera: '',
  ciclo: '',
  acepta: false,
};

/** Errores de TODO el formulario (sirve para bloquear el envío). */
function validate(values) {
  const errors = {};

  if (isBlank(values.nombres)) errors.nombres = 'Ingresa tus nombres.';
  if (isBlank(values.apellidos)) errors.apellidos = 'Ingresa tus apellidos.';

  const emailError = getInstitutionalEmailError(values.correo);
  if (emailError) errors.correo = emailError;

  if (!isPasswordValid(values.contrasena)) errors.contrasena = PASSWORD_REQUIREMENTS_TEXT;

  if (isBlank(values.confirmacion)) errors.confirmacion = 'Confirma tu contraseña.';
  else if (!passwordsMatch(values.contrasena, values.confirmacion)) {
    errors.confirmacion = 'Las contraseñas no coinciden.';
  }

  if (isBlank(values.carrera)) errors.carrera = 'Selecciona tu carrera.';
  if (isBlank(values.ciclo)) errors.ciclo = 'Selecciona tu ciclo.';
  if (!values.acepta) errors.acepta = 'Debes aceptar el reglamento para continuar.';

  return errors;
}

/**
 * Formulario "Crear cuenta de estudiante". No conoce useAuth ni los servicios:
 * recibe todo por props.
 *
 * Props:
 *  - onSubmit(datos): async; hace el registro. Si rechaza con code 'VALIDACION'
 *                     y `campos`, los errores se pintan junto a cada campo;
 *                     cualquier otro error sale como Alert arriba.
 *  - carreras, ciclos: [{ value, label }]
 *  - cancelTo: ruta del botón "Cancelar"
 */
export default function RegisterStudentForm({
  onSubmit,
  carreras = [],
  ciclos = [],
  cancelTo = '/login',
}) {
  const [values, setValues] = useState(INITIAL_VALUES);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [serverErrors, setServerErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const errors = validate(values);

  const shouldShow = (name) => submitted || Boolean(touched[name]);
  // El error de un campo de texto aparece al salir del campo o al intentar enviar.
  const errorFor = (name) => serverErrors[name] ?? (shouldShow(name) ? errors[name] : undefined);
  // La confirmación avisa en vivo apenas se empieza a escribir.
  const confirmationError =
    serverErrors.confirmacion ??
    (shouldShow('confirmacion') || values.confirmacion !== '' ? errors.confirmacion : undefined);

  const handleChange = (event) => {
    const { name, type, checked, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
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
        carrera: values.carrera,
        ciclo: Number(values.ciclo),
      });
    } catch (error) {
      if (error?.code === 'VALIDACION' && error.campos) setServerErrors(error.campos);
      else setFormError(error?.message || DEFAULT_ERROR);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section aria-labelledby="registro-estudiante-titulo">
      <header className={styles.header}>
        <h1 id="registro-estudiante-titulo" className={styles.title}>
          Crear cuenta de estudiante
        </h1>
        <p className={styles.subtitle}>
          Solo correos {INSTITUTIONAL_DOMAIN}. La cuenta se activa al confirmar el correo.
        </p>
      </header>

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
            <PasswordField
              label="Confirmar contraseña"
              name="confirmacion"
              value={values.confirmacion}
              onChange={handleChange}
              onBlur={handleBlur}
              errorMsg={confirmationError}
              autoComplete="new-password"
              required
            />
          </FormGridItem>

          <FormGridItem>
            <Select
              label="Carrera"
              name="carrera"
              value={values.carrera}
              onChange={handleChange}
              onBlur={handleBlur}
              options={carreras}
              placeholder="Selecciona tu carrera"
              errorMsg={errorFor('carrera')}
            />
          </FormGridItem>
          <FormGridItem>
            <Select
              label="Ciclo"
              name="ciclo"
              value={values.ciclo}
              onChange={handleChange}
              onBlur={handleBlur}
              options={ciclos}
              placeholder="Selecciona tu ciclo"
              errorMsg={errorFor('ciclo')}
            />
          </FormGridItem>

          <FormGridItem span="full">
            <Checkbox
              name="acepta"
              checked={values.acepta}
              onChange={handleChange}
              errorMsg={errorFor('acepta')}
              label={
                <>
                  Acepto el{' '}
                  <TextLink to="/reglamento" target="_blank" rel="noopener noreferrer">
                    reglamento de uso de espacios
                  </TextLink>{' '}
                  y el registro de mis inasistencias.
                </>
              }
            />
          </FormGridItem>
        </FormGrid>

        <FormActions divider>
          <ButtonLink to={cancelTo} variant="outline">
            Cancelar
          </ButtonLink>
          <Button type="submit" isLoading={isSubmitting} loadingText="Creando cuenta…">
            Crear cuenta
          </Button>
        </FormActions>
      </form>
    </section>
  );
}
