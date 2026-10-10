// src/components/routes/rutasPorRol.js

/** Dashboard por defecto según el rol del usuario autenticado. */
export const obtenerRutaInicioPorRol = (rol) => {
  switch (rol) {
    case 'estudiante':
      return '/estudiante/dashboard';
    case 'encargado':
      return '/encargado/dashboard';
    default:
      return '/perfil';
  }
};
