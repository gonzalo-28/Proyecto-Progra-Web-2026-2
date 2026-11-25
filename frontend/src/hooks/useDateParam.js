// src/hooks/useDateParam.js

import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { isISODate, toISODate } from '../utils/dates';

/**
 * Fecha seleccionada guardada en la URL (?fecha=2026-09-14).
 * Así el botón "Atrás" del navegador funciona, la página se puede recargar
 * sin perder el día y el enlace se puede compartir. Si el parámetro falta
 * o es inválido, se usa hoy.
 *
 * @param {string} paramName  nombre del parámetro en la URL (por defecto 'fecha')
 * @returns {{ date: string, today: string, isToday: boolean, setDate: (iso: string) => void }}
 */
export default function useDateParam(paramName = 'fecha') {
  const [searchParams, setSearchParams] = useSearchParams();
  const today = toISODate();
  const raw = searchParams.get(paramName);
  const date = isISODate(raw) ? raw : today;

  const setDate = useCallback(
    (iso) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        // Hoy es el valor por defecto: no ensuciamos la URL con él.
        if (iso === toISODate()) next.delete(paramName);
        else next.set(paramName, iso);
        return next;
      });
    },
    [paramName, setSearchParams]
  );

  return { date, today, isToday: date === today, setDate };
}
