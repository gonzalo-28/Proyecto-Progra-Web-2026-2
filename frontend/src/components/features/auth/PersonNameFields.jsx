// src/components/features/auth/PersonNameFields.jsx

import { FormGridItem } from '../../ui/FormGrid/FormGrid';
import TextField from '../../ui/TextField/TextField';

/**
 * Nombres + Apellidos. Va DENTRO de un <FormGrid columns={2}>: devuelve dos celdas.
 * Compartido por el registro de estudiante, el de encargado y Mi cuenta.
 *
 * Props:
 *  - values:   { nombres, apellidos }
 *  - errors:   { nombres?, apellidos? }  (mensaje ya decidido por el formulario)
 *  - onChange, onBlur: handlers nativos; cada campo lleva su `name`
 */
export default function PersonNameFields({ values, errors = {}, onChange, onBlur }) {
  return (
    <>
      <FormGridItem>
        <TextField
          label="Nombres"
          name="nombres"
          value={values.nombres}
          onChange={onChange}
          onBlur={onBlur}
          errorMsg={errors.nombres}
          autoComplete="given-name"
          required
        />
      </FormGridItem>
      <FormGridItem>
        <TextField
          label="Apellidos"
          name="apellidos"
          value={values.apellidos}
          onChange={onChange}
          onBlur={onBlur}
          errorMsg={errors.apellidos}
          autoComplete="family-name"
          required
        />
      </FormGridItem>
    </>
  );
}
