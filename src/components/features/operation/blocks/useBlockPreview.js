// src/components/features/operation/blocks/useBlockPreview.js

import { useMemo } from 'react';
import * as blockService from '../../../../services/blockService';
import { countDays, isISODate } from '../../../../utils/dates';
import { ALCANCE_BLOQUEO, MAX_DIAS_BLOQUEO } from '../../../../utils/reglasOperacion';

/**
 * Vista previa del bloqueo mientras se llena el formulario.
 * Devuelve null si todavía no hay espacio o el rango de fechas no es válido.
 *
 * @param {{ espacioId, desde, hasta, alcance, bloqueIds }} values  (useBlockForm)
 * @returns {{ dias, bloques, afectadas, bloqueIds } | null}
 */
export default function useBlockPreview({ espacioId, desde, hasta, alcance, bloqueIds }) {
  return useMemo(() => {
    const rangoValido =
      isISODate(desde) &&
      isISODate(hasta) &&
      hasta >= desde &&
      countDays(desde, hasta) <= MAX_DIAS_BLOQUEO;
    if (!espacioId || !rangoValido) return null;

    const elegidos = alcance === ALCANCE_BLOQUEO.rango ? bloqueIds : [];
    const preview = blockService.previsualizarBloqueo({ espacioId, desde, hasta, bloqueIds: elegidos });
    return { ...preview, bloqueIds: elegidos };
  }, [espacioId, desde, hasta, alcance, bloqueIds]);
}
