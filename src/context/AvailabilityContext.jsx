// src/context/AvailabilityContext.jsx
// Contexto y hook de la página de disponibilidad (HU-3). El proveedor vive en
// AvailabilityProvider.jsx (react-refresh exige que un archivo exporte solo
// componentes o solo utilidades), igual que AuthContext / AuthProvider.

import { createContext, useContext } from 'react';

export const AvailabilityContext = createContext(null);

/** Estado y acciones del calendario de un espacio. Solo dentro de AvailabilityProvider. */
export const useAvailability = () => {
  const context = useContext(AvailabilityContext);
  if (!context) {
    throw new Error('useAvailability debe usarse dentro de un AvailabilityProvider');
  }
  return context;
};
