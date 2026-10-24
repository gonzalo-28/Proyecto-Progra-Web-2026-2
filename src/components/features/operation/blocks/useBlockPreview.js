// src/components/features/operation/blocks/useBlockPreview.js

import { useMemo } from 'react';
import * as blockService from '../../../../services/blockService';
import { countDays, isISODate } from '../../../../utils/dates';
import { ALCANCE_BLOQUEO, MAX_DIAS_BLOQUEO } from '../../../../utils/reglasOperacion';

/**
 * Vista previa del bloqueo mientras se llena el formulario.
 * Devuelve null si todavía no hay espacio o el rango de fechas no es válido.
 *
 * Con "Rango horario" y ninguna hora marcada no se bloquea nada: la vista
 * previa vuelve vacía (sinBloques) en lugar de tratarlo como "Todo el día".
 *
 * @param {{ espacioId, desde, hasta, alcance, bloqueIds }} values  (useBlockForm)
 * @returns {{ dias, bloques, afectadas, bloqueIds, sinBloques } | null}
 */
export default function useBlockPreview({ espacioId, desde, hasta, alcance, bloqueIds }) {
  return useMemo(() => {
    const rangoValido =
      isISODate(desde) &&
      isISODate(hasta) &&
      hasta >= desde &&
      countDays(desde, hasta) <= MAX_DIAS_BLOQUEO;
    if (!espacioId || !rangoValido) return null;

    const esRango = alcance === ALCANCE_BLOQUEO.rango;
    if (esRango && bloqueIds.length === 0) {
      return { dias: [], bloques: [], afectadas: [], bloqueIds: [], sinBloques: true };
    }

    const elegidos = esRango ? bloqueIds : [];
    const preview = blockService.previsualizarBloqueo({ espacioId, desde, hasta, bloqueIds: elegidos });
    return { ...preview, bloqueIds: elegidos, sinBloques: false };
  }, [espacioId, desde, hasta, alcance, bloqueIds]);
}
