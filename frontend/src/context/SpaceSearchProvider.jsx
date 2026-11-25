// src/context/SpaceSearchProvider.jsx
//
// Estado del buscador de espacios (HU-3, mockups 3.1–3.3). Es el único que
// habla con availabilityService y useAuth; los componentes de features/search
// leen useSpaceSearch(), así no hay prop drilling.
//
// Los filtros APLICADOS viven en la URL (ver filtrosBusqueda.js): se puede
// compartir el enlace, volver atrás y llegar desde la landing con filtros.
// El borrador que el estudiante va armando en el panel es estado local del
// panel hasta que pulsa "Aplicar filtros".
//
// Mismo patrón de carga que AvailabilityProvider: cada consulta se guarda con
// su "clave"; si no coincide con la actual, está cargando. Sin useCallback ni
// useMemo a mano (reglas del React Compiler).

import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { SpaceSearchContext } from './SpaceSearchContext';
import { buscarEspacios, obtenerOpcionesDeBusqueda } from '../services/availabilityService';
import {
  aParametrosServicio,
  escribirFiltros,
  FILTROS_LIMPIOS,
  filtrosActivos,
  leerFiltros,
  TAMANO_PAGINA,
} from '../utils/filtrosBusqueda';

export function SpaceSearchProvider({ children }) {
  const { usuario } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const filtros = leerFiltros(searchParams);
  const usuarioId = usuario?.id ?? null;

  /* ------------------- Opciones del panel (una sola vez) ------------------- */
  const [opciones, setOpciones] = useState(null);

  useEffect(() => {
    let activo = true;
    obtenerOpcionesDeBusqueda().then((valor) => {
      if (activo) setOpciones(valor);
    });
    return () => {
      activo = false;
    };
  }, []);

  /* ------------------------------- Resultados ------------------------------ */
  const [intento, setIntento] = useState(0);
  const claveFiltros = JSON.stringify(filtros);
  const clave = JSON.stringify({ filtros, usuarioId, intento });
  const [consulta, setConsulta] = useState({ clave: null, resultados: [], error: null });

  useEffect(() => {
    let activo = true;
    const p = JSON.parse(clave);
    buscarEspacios(aParametrosServicio(p.filtros), { usuarioId: p.usuarioId })
      .then(({ resultados }) => {
        if (activo) setConsulta({ clave, resultados, error: null });
      })
      .catch((error) => {
        if (activo) setConsulta({ clave, resultados: [], error });
      });
    return () => {
      activo = false;
    };
  }, [clave]);

  const cargando = consulta.clave !== clave;
  const resultados = cargando ? [] : consulta.resultados;
  const error = cargando ? null : consulta.error;

  /* ------------------------ Paginación (en el cliente) --------------------- */
  const totalPaginas = Math.max(Math.ceil(resultados.length / TAMANO_PAGINA), 1);
  const pagina = Math.min(Math.max(Number(searchParams.get('pagina')) || 1, 1), totalPaginas);
  const visibles = resultados.slice((pagina - 1) * TAMANO_PAGINA, pagina * TAMANO_PAGINA);

  /* -------------------------------- Acciones ------------------------------- */
  // Cualquier cambio de filtros vuelve a la página 1 (escribirFiltros no la incluye).
  const aplicarFiltros = (cambios) => setSearchParams(escribirFiltros({ ...filtros, ...cambios }));

  const irAPagina = (numero) =>
    setSearchParams((actuales) => {
      const nuevos = new URLSearchParams(actuales);
      if (numero > 1) nuevos.set('pagina', String(numero));
      else nuevos.delete('pagina');
      return nuevos;
    });

  const value = {
    opciones,
    filtros,
    claveFiltros,
    chips: filtrosActivos(filtros, opciones),
    cargando,
    error,
    total: resultados.length,
    resultados: visibles,
    pagina,
    totalPaginas,
    aplicarFiltros,
    quitarFiltro: aplicarFiltros, // un chip trae justo el cambio que lo quita
    limpiarTodo: () => aplicarFiltros(FILTROS_LIMPIOS),
    cambiarOrden: (orden) => aplicarFiltros({ orden }),
    irAPagina,
    reintentar: () => setIntento((n) => n + 1),
  };

  return <SpaceSearchContext.Provider value={value}>{children}</SpaceSearchContext.Provider>;
}

export default SpaceSearchProvider;
