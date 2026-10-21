// src/components/features/operation/search/ReservationSearchForm.jsx

import { useState } from 'react';
import Card from '../../../ui/Card/Card';
import TextField from '../../../ui/TextField/TextField';
import Select from '../../../ui/Select/Select';
import Button from '../../../ui/Button/Button';
import { ESTADO_RESERVA_UI, ESTADOS_RESERVA } from '../../../../utils/reglas';
import styles from './ReservationSearchForm.module.css';

/* Estados GUARDADOS ("En curso" es solo visual, no se filtra por él). */
const OPCIONES_ESTADO = [
  { value: '', label: 'Estado: Todos' },
  ...[
    ESTADOS_RESERVA.confirmada,
    ESTADOS_RESERVA.atendida,
    ESTADOS_RESERVA.inasistencia,
    ESTADOS_RESERVA.cancelada,
  ].map((estado) => ({ value: estado, label: ESTADO_RESERVA_UI[estado].label })),
];

/**
 * Barra de búsqueda del mockup 5.5: texto + "Espacio: Todos ▾" + "Estado: Todos ▾" + Buscar.
 * Maneja su propio estado de edición; solo avisa al buscar. La página le pone
 * `key` con los filtros de la URL, así se reinicia si cambian (botón Atrás).
 *
 * Props:
 *  - defaultValues:  { texto, espacioId, estado }
 *  - espacioOptions: [{ value, label }] espacios de la sede
 *  - minChars:       mínimo de caracteres del texto
 *  - onSearch:       ({ texto, espacioId, estado }) => void
 *  - onClear:        () => void   (aparece "Limpiar" si hay filtros)
 */
export default function ReservationSearchForm({
  defaultValues,
  espacioOptions = [],
  minChars = 2,
  onSearch,
  onClear,
}) {
  const [values, setValues] = useState(defaultValues);
  const [error, setError] = useState(null);

  const cambiar = (campo) => (event) => {
    setValues((prev) => ({ ...prev, [campo]: event.target.value }));
    if (campo === 'texto') setError(null);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const texto = values.texto.trim();
    if (texto && texto.length < minChars) {
      setError(`Escribe al menos ${minChars} caracteres.`);
      return;
    }
    if (!texto && !values.espacioId && !values.estado) {
      setError('Escribe un código, nombre o correo, o elige un espacio o estado.');
      return;
    }
    onSearch({ ...values, texto });
  };

  const hayFiltros = Boolean(
    defaultValues.texto || defaultValues.espacioId || defaultValues.estado
  );

  return (
    <Card as="section" padding="md" className={styles.card}>
      <form className={styles.form} onSubmit={handleSubmit} noValidate role="search">
        <TextField
          className={styles.query}
          type="search"
          aria-label="Buscar por código, nombre, correo o código de estudiante"
          placeholder="Código (RSV-2026-…), nombre, correo o código de estudiante"
          value={values.texto}
          onChange={cambiar('texto')}
          errorMsg={error}
        />
        <Select
          className={styles.filter}
          aria-label="Espacio"
          options={[{ value: '', label: 'Espacio: Todos' }, ...espacioOptions]}
          value={values.espacioId}
          onChange={cambiar('espacioId')}
        />
        <Select
          className={styles.filter}
          aria-label="Estado"
          options={OPCIONES_ESTADO}
          value={values.estado}
          onChange={cambiar('estado')}
        />
        <div className={styles.actions}>
          <Button type="submit">Buscar</Button>
          {hayFiltros && (
            <Button variant="ghost" onClick={onClear}>
              Limpiar
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}
