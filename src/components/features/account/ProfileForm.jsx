// src/components/features/account/ProfileForm.jsx

import { useState } from 'react';
import Alert from '../../ui/Alert/Alert';
import Button from '../../ui/Button/Button';
import FormActions from '../../ui/FormActions/FormActions';
import { FormGrid, FormGridItem } from '../../ui/FormGrid/FormGrid';
import Select from '../../ui/Select/Select';
import TextField from '../../ui/TextField/TextField';
import InstitutionalEmailField from '../auth/InstitutionalEmailField';
import PersonNameFields from '../auth/PersonNameFields';
import { isBlank } from '../../../utils/validators';
import styles from './AccountForms.module.css';

const DEFAULT_ERROR = 'No pudimos guardar los cambios. Inténtalo de nuevo.';

const toFormValues = (initial) => ({
  nombres: initial.nombres ?? '',
  apellidos: initial.apellidos ?? '',
  carrera: initial.carrera ?? '',
  ciclo: initial.ciclo == null ? '' : String(initial.ciclo),
});

/** Errores de TODO el formulario (sirve para bloquear el envío). */
function validate(values, esEstudiante) {
  const errors = {};
  if (isBlank(values.nombres)) errors.nombres = 'Ingresa tus nombres.';
  if (isBlank(values.apellidos)) errors.apellidos = 'Ingresa tus apellidos.';
  if (esEstudiante) {
    if (isBlank(values.carrera)) errors.carrera = 'Selecciona tu carrera.';
    if (isBlank(values.ciclo)) errors.ciclo = 'Selecciona tu ciclo.';
  }
  return errors;
}

/**
 * "Datos personales" de Mi cuenta. No conoce useAuth ni los servicios.
 * El correo es de solo lectura. El estudiante edita carrera y ciclo; el
 * encargado ve su sede asignada (solo lectura).
 *
 * Props:
 *  - rol:           'estudiante' | 'encargado'
 *  - initialValues: { nombres, apellidos, correo, carrera, ciclo }  (datos guardados)
 *  - sedeLabel:     nombre de la sede asignada (encargado)
 *  - carreras, ciclos: [{ value, label }]
 *  - onSubmit(datos): async; guarda. Un rechazo con code 'VALIDACION' y `campos`
 *                     se pinta junto a cada campo; otro error, en un Alert.
 *
 * "Guardar" y "Descartar" solo se habilitan cuando hay cambios sin guardar.
 */
export default function ProfileForm({
  rol,
  initialValues,
  sedeLabel,
  carreras = [],
  ciclos = [],
  onSubmit,
}) {
  const esEstudiante = rol === 'estudiante';

  const [values, setValues] = useState(() => toFormValues(initialValues));
  const [submitted, setSubmitted] = useState(false);
  const [touched, setTouched] = useState({});
  const [serverErrors, setServerErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saved, setSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const original = toFormValues(initialValues);
  const isDirty =
    values.nombres.trim() !== original.nombres ||
    values.apellidos.trim() !== original.apellidos ||
    (esEstudiante && (values.carrera !== original.carrera || values.ciclo !== original.ciclo));

  const errors = validate(values, esEstudiante);
  const errorFor = (name) =>
    serverErrors[name] ?? (submitted || touched[name] ? errors[name] : undefined);

  const clearFeedback = () => {
    if (formError) setFormError('');
    if (saved) setSaved(false);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setServerErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev));
    clearFeedback();
  };

  const handleBlur = (event) => {
    const { name } = event.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleDiscard = () => {
    setValues(toFormValues(initialValues));
    setSubmitted(false);
    setTouched({});
    setServerErrors({});
    setFormError('');
    setSaved(false);
  };

  async function handleSubmit(event) {
    event.preventDefault();
    if (isSubmitting || !isDirty) return;

    setSubmitted(true);
    setFormError('');
    setSaved(false);
    if (Object.keys(errors).length > 0) return;

    const datos = {
      nombres: values.nombres.trim(),
      apellidos: values.apellidos.trim(),
      ...(esEstudiante && { carrera: values.carrera, ciclo: Number(values.ciclo) }),
    };

    setIsSubmitting(true);
    try {
      await onSubmit(datos);
      setValues((prev) => ({ ...prev, nombres: datos.nombres, apellidos: datos.apellidos }));
      setSubmitted(false);
      setTouched({});
      setSaved(true);
    } catch (error) {
      if (error?.code === 'VALIDACION' && error.campos) setServerErrors(error.campos);
      else setFormError(error?.message || DEFAULT_ERROR);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {formError && (
        <Alert variant="error" className={styles.alert}>
          {formError}
        </Alert>
      )}
      {saved && (
        <Alert variant="success" className={styles.alert}>
          Cambios guardados.
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
          <InstitutionalEmailField value={initialValues.correo ?? ''} readOnly hint="No editable." />
        </FormGridItem>

        {esEstudiante ? (
          <>
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
          </>
        ) : (
          <FormGridItem span="full">
            <TextField label="Sede asignada" value={sedeLabel ?? ''} readOnly hint="No editable." />
          </FormGridItem>
        )}
      </FormGrid>

      <FormActions>
        <Button variant="ghost" onClick={handleDiscard} disabled={!isDirty || isSubmitting}>
          Descartar
        </Button>
        <Button
          type="submit"
          disabled={!isDirty}
          isLoading={isSubmitting}
          loadingText="Guardando…"
        >
          Guardar cambios
        </Button>
      </FormActions>
    </form>
  );
}
