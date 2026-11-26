// src/components/features/operation/blocks/BlockForm.jsx

import Card from '../../../ui/Card/Card';
import Select from '../../../ui/Select/Select';
import DateField from '../../../ui/DateField/DateField';
import TextArea from '../../../ui/TextArea/TextArea';
import Button from '../../../ui/Button/Button';
import ButtonLink from '../../../ui/Button/ButtonLink';
import SegmentedControl from '../../../ui/SegmentedControl/SegmentedControl';
import HourChips from './HourChips';
import {
  ALCANCE_BLOQUEO,
  MOTIVO_BLOQUEO_MAX,
  TIPOS_BLOQUEO,
} from '../../../../utils/reglasOperacion';
import styles from './BlockForm.module.css';

const OPCIONES_ALCANCE = [
  { value: ALCANCE_BLOQUEO.todoElDia, label: 'Todo el día' },
  { value: ALCANCE_BLOQUEO.rango, label: 'Rango horario' },
];

/**
 * "Datos del bloqueo" (mockup 5.4, columna izquierda). Formulario CONTROLADO:
 * los valores y errores viven en useBlockForm (en la página), porque la vista
 * previa de la derecha también los necesita.
 *
 * Props:
 *  - values, errors        (useBlockForm)
 *  - onField(campo, valor), onToggleBloque(id)
 *  - espacioOptions        [{ value, label }]
 *  - bloques               [{ id, horaInicio, horaFin }]
 *  - minDate               'YYYY-MM-DD' (hoy)
 *  - enviando              boolean
 *  - cancelTo              ruta del botón "Cancelar"
 *  - onSubmit              () => void
 */
export default function BlockForm({
  values,
  errors,
  onField,
  onToggleBloque,
  espacioOptions = [],
  bloques = [],
  minDate,
  enviando = false,
  cancelTo,
  onSubmit,
}) {
  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit();
  };
  const cambiar = (campo) => (event) => onField(campo, event.target.value);

  return (
    <Card as="section" title="Datos del bloqueo" padding="lg">
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <SegmentedControl
          label="Tipo de bloqueo"
          showLabel
          options={TIPOS_BLOQUEO}
          value={values.tipo}
          onChange={(valor) => onField('tipo', valor)}
          disabled={enviando}
        />

        <Select
          label="Espacio"
          placeholder="Selecciona un espacio"
          options={espacioOptions}
          value={values.espacioId}
          onChange={cambiar('espacioId')}
          errorMsg={errors.espacioId}
          disabled={enviando}
        />

        <div className={styles.dates}>
          <DateField
            label="Desde"
            value={values.desde}
            min={minDate}
            onChange={cambiar('desde')}
            errorMsg={errors.desde}
            disabled={enviando}
          />
          <DateField
            label="Hasta"
            value={values.hasta}
            min={values.desde || minDate}
            onChange={cambiar('hasta')}
            errorMsg={errors.hasta}
            disabled={enviando}
          />
        </div>

        <div className={styles.blocks}>
          <SegmentedControl
            label="Bloques afectados"
            showLabel
            options={OPCIONES_ALCANCE}
            value={values.alcance}
            onChange={(valor) => onField('alcance', valor)}
            disabled={enviando}
          />
          <HourChips
            bloques={bloques}
            selected={values.bloqueIds}
            allDay={values.alcance === ALCANCE_BLOQUEO.todoElDia}
            onToggle={onToggleBloque}
            errorMsg={errors.bloqueIds}
          />
        </div>

        <TextArea
          label="Motivo"
          value={values.motivo}
          onChange={cambiar('motivo')}
          placeholder="Ej.: Cambio de 24 computadoras y recableado eléctrico del laboratorio."
          maxLength={MOTIVO_BLOQUEO_MAX}
          hint={`${values.motivo.length}/${MOTIVO_BLOQUEO_MAX} caracteres · lo verá cada estudiante afectado`}
          errorMsg={errors.motivo}
          disabled={enviando}
        />

        <div className={styles.actions}>
          <ButtonLink to={cancelTo} variant="ghost">
            Cancelar
          </ButtonLink>
          <Button type="submit" isLoading={enviando} loadingText="Bloqueando…">
            Bloquear y avisar
          </Button>
        </div>
      </form>
    </Card>
  );
}
