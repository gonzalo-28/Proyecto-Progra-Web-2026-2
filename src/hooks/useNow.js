// src/hooks/useNow.js

import { useEffect, useState } from 'react';

/**
 * Hora actual que se refresca sola cada `intervalMs` milisegundos.
 * La HU-5 la usa para que "Faltan 7 min" avance sin recargar la página.
 *
 * @param {number} intervalMs  cada cuánto se actualiza (por defecto 30 s)
 * @returns {Date}
 */
export default function useNow(intervalMs = 30000) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}
