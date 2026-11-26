// src/context/SpaceSearchContext.jsx
// Contexto y hook del buscador de espacios (HU-3). El proveedor vive en
// SpaceSearchProvider.jsx, igual que AuthContext / AuthProvider.

import { createContext, useContext } from 'react';

export const SpaceSearchContext = createContext(null);

/** Filtros, resultados y acciones del buscador. Solo dentro de SpaceSearchProvider. */
export const useSpaceSearch = () => {
  const context = useContext(SpaceSearchContext);
  if (!context) {
    throw new Error('useSpaceSearch debe usarse dentro de un SpaceSearchProvider');
  }
  return context;
};
