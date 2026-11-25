// Errores con código HTTP. El servicio los lanza con crearError y el controlador
// los responde con responderError. La respuesta usa la clave `message`, que es la que
// lee api.js del frontend (como en nuestra réplica 1).
//
//   400 datos inválidos (con `campos` para marcar cada input)
//   403 sin permiso       404 no existe       409 choca con otro registro

export const crearError = (status, message, extra = {}) =>
  Object.assign(new Error(message), { status, ...extra });

export const responderError = (error, resp) => {
  if (error.status) {
    return resp.status(error.status).json({
      success: false,
      message: error.message,
      code: error.code ?? null,
      campos: error.campos ?? null
    });
  }
  console.log(error);
  return resp.status(500).json({ success: false, message: 'Error interno del servidor.' });
};
