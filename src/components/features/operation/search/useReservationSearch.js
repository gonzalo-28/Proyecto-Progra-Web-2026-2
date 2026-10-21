// src/components/features/operation/search/useReservationSearch.js

import { useEffect, useState } from 'react';
import * as operationService from '../../../../services/operationService';

const ERROR_BUSQUEDA = 'No se pudo completar la búsqueda. Inténtalo otra vez.';

/**
 * Ejecuta la búsqueda de reservas cada vez que cambian los filtros.
 * Si no hay ningún filtro, no busca (la página muestra el estado inicial).
 *
 * @param {{ sedeId, texto, espacioId, estado }} filtros
 * @returns {{ activo: boolean, cargando: boolean, datos: Object|null, error: string|null }}
 *          datos = { resultados, total, truncado } (ver operationService.buscarReservas)
 */
export default function useReservationSearch({ sedeId, texto, espacioId, estado }) {
  const activo = Boolean(texto || espacioId || estado);
  // `clave` identifica la búsqueda; una respuesta con otra clave es de una búsqueda vieja.
  const clave = activo ? JSON.stringify([sedeId, texto, espacioId, estado]) : null;
  const [respuesta, setRespuesta] = useState({ clave: null, datos: null, error: null });

  useEffect(() => {
    if (!clave) return undefined;
    let vigente = true;
    operationService
      .buscarReservas({ sedeId, texto, espacioId, estado })
      .then((datos) => {
        if (vigente) setRespuesta({ clave, datos, error: null });
      })
      .catch((err) => {
        if (vigente) setRespuesta({ clave, datos: null, error: err.message || ERROR_BUSQUEDA });
      });
    return () => {
      vigente = false;
    };
  }, [clave, sedeId, texto, espacioId, estado]);

  const cargando = activo && respuesta.clave !== clave;
  const vigente = activo && !cargando;

  return {
    activo,
    cargando,
    datos: vigente ? respuesta.datos : null,
    error: vigente ? respuesta.error : null,
  };
}
