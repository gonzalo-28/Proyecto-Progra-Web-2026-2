// src/components/features/operation/blocks/useBlockForm.js

import { useCallback, useState } from 'react';
import { ALCANCE_BLOQUEO, validarBloqueo } from '../../../../utils/reglasOperacion';

const valoresIniciales = (hoy) => ({
  tipo: 'mantenimiento',
  espacioId: '',
  desde: hoy,
  hasta: hoy,
  alcance: ALCANCE_BLOQUEO.todoElDia,
  bloqueIds: [],
  motivo: '',
});

/**
 * Estado del formulario "Nuevo bloqueo" (mockup 5.4): valores, errores por
 * campo y validación (la misma regla que repite el servicio).
 *
 * @param {string} hoy  'YYYY-MM-DD'
 */
export default function useBlockForm(hoy) {
  const [values, setValues] = useState(() => valoresIniciales(hoy));
  const [errors, setErrors] = useState({});

  /** Cambia un campo y borra su error (y el de "hasta" si cambió "desde"). */
  const setField = useCallback((campo, valor) => {
    setValues((prev) => ({ ...prev, [campo]: valor }));
    setErrors((prev) => ({
      ...prev,
      [campo]: undefined,
      ...(campo === 'desde' ? { hasta: undefined } : {}),
      ...(campo === 'alcance' ? { bloqueIds: undefined } : {}),
    }));
  }, []);

  /** Agrega o quita un bloque horario del rango. */
  const toggleBloque = useCallback((bloqueId) => {
    setValues((prev) => ({
      ...prev,
      bloqueIds: prev.bloqueIds.includes(bloqueId)
        ? prev.bloqueIds.filter((id) => id !== bloqueId)
        : [...prev.bloqueIds, bloqueId],
    }));
    setErrors((prev) => ({ ...prev, bloqueIds: undefined }));
  }, []);

  /** Valida todo; devuelve true si se puede enviar. */
  const validate = useCallback(() => {
    const encontrados = validarBloqueo(values, hoy);
    setErrors(encontrados);
    return Object.keys(encontrados).length === 0;
  }, [values, hoy]);

  const reset = useCallback(() => {
    setValues(valoresIniciales(hoy));
    setErrors({});
  }, [hoy]);

  return { values, errors, setErrors, setField, toggleBloque, validate, reset };
}
