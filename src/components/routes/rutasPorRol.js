// src/components/routes/rutasPorRol.js

import { RUTAS_ENCARGADO } from './rutasEncargado';

/** Vista principal por defecto según el rol del usuario autenticado. */
export const obtenerRutaInicioPorRol = (rol) => {
  switch (rol) {
    case 'estudiante':
      return '/estudiante/dashboard';
    case 'encargado':
      return RUTAS_ENCARGADO.bandeja; // HU-5: la bandeja del día es su inicio
    default:
      return '/perfil';
  }
};
