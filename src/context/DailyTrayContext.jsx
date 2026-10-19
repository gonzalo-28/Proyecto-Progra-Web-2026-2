// src/context/DailyTrayContext.jsx
// Contexto y hook de la bandeja del día (HU-5). El proveedor vive en
// DailyTrayProvider.jsx (react-refresh exige separar componentes y utilidades,
// igual que AuthContext / AuthProvider).

import { createContext, useContext } from 'react';

export const DailyTrayContext = createContext(null);

/** Estado y acciones de la bandeja. Solo funciona dentro de <DailyTrayProvider>. */
export const useDailyTray = () => {
  const context = useContext(DailyTrayContext);
  if (!context) {
    throw new Error('useDailyTray debe usarse dentro de un DailyTrayProvider');
  }
  return context;
};
