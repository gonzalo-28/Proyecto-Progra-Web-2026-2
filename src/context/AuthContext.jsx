// src/context/AuthContext.jsx
// Contexto y hook de autenticación. El proveedor vive en AuthProvider.jsx
// (react-refresh exige que un archivo exporte solo componentes o solo utilidades).

import { createContext, useContext } from 'react';

export const AuthContext = createContext(null);

// 5. Custom Hook para consumir el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};