// src/components/features/spaces/SpaceSearchForm.jsx

import { useState } from 'react';
import Card from '../../ui/Card/Card';
import Select from '../../ui/Select/Select';
import DateField from '../../ui/DataField/DataField';
import Button from '../../ui/Button/Button';
import { toISODate } from '../../../utils/dates';
import styles from './SpaceSearchForm.module.css';

/**
 * Buscador de espacios: Sede + Tipo de espacio + Día + "Buscar", dentro de un Card.
 *
 * Props:
 *  - sedeOptions, typeOptions: [{ value, label }]
 *  - defaultValues: { sede?, type?, date? }  (por defecto: primera opción y hoy)
 *  - onSearch({ sede, type, date }): se llama al enviar el formulario
 *  - className
 *
 * No navega ni consulta datos: solo recoge los filtros y avisa con onSearch.
 */
export default function SpaceSearchForm({
  sedeOptions = [],
  typeOptions = [],
  defaultValues,
  onSearch,
  className,
}) {
  const [values, setValues] = useState(() => ({
    sede: defaultValues?.sede ?? sedeOptions[0]?.value ?? '',
    type: defaultValues?.type ?? typeOptions[0]?.value ?? '',
    date: defaultValues?.date ?? toISODate(),
  }));

  const handleChange = (field) => (event) => {
    const { value } = event.target;
    setValues((previous) => ({ ...previous, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSearch?.(values);
  };

  return (
    <Card className={className} padding="md">
      <form
        className={styles.form}
        onSubmit={handleSubmit}
        role="search"
        aria-label="Buscar espacios"
      >
        <Select
          label="Sede"
          options={sedeOptions}
          value={values.sede}
          onChange={handleChange('sede')}
        />

        <Select
          label="Tipo de espacio"
          options={typeOptions}
          value={values.type}
          onChange={handleChange('type')}
        />

        <DateField
          label="Día"
          value={values.date}
          min={toISODate()}
          onChange={handleChange('date')}
          required
        />

        <div className={styles.actions}>
          <Button type="submit">Buscar</Button>
        </div>
      </form>
    </Card>
  );
}
