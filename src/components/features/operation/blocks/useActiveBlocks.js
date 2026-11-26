// src/components/features/operation/blocks/useActiveBlocks.js

import { useEffect, useState } from 'react';
import * as blockService from '../../../../services/blockService';

/**
 * Carga los bloqueos vigentes de la sede. `version` se incrementa desde fuera
 * (al crear o eliminar un bloqueo) para volver a cargar la lista.
 *
 * @returns {{ cargando: boolean, bloqueos: Object[], error: string|null }}
 */
export default function useActiveBlocks(sedeId, version) {
  const clave = `${sedeId}|${version}`;
  const [respuesta, setRespuesta] = useState({ clave: null, bloqueos: [], error: null });

  useEffect(() => {
    let vigente = true;
    blockService
      .obtenerBloqueosVigentes({ sedeId })
      .then((bloqueos) => {
        if (vigente) setRespuesta({ clave, bloqueos, error: null });
      })
      .catch((err) => {
        if (vigente) setRespuesta({ clave, bloqueos: [], error: err.message || 'No se pudieron cargar los bloqueos.' });
      });
    return () => {
      vigente = false;
    };
  }, [clave, sedeId]);

  // Mientras recarga se sigue mostrando la lista anterior (sin parpadeo).
  return {
    cargando: respuesta.clave !== clave,
    bloqueos: respuesta.bloqueos,
    error: respuesta.error,
  };
}
