// Verifica que quien hace la acción sea un encargado (HU-5).
// No hay login con token en el curso: el frontend manda el id del usuario en sesión.
import RepositoryBase from '../repositories/RepositoryBase.js'
import { Usuario } from '../models/relaciones.js'
import { crearError } from './errores.js'

const usuarios = new RepositoryBase(Usuario);

export async function exigirEncargado(encargadoId, mensaje = 'Solo un encargado puede hacer esta acción.') {
  const encargado = encargadoId ? await usuarios.findOne(encargadoId) : null;
  if (!encargado || encargado.rol !== 'encargado') {
    throw crearError(403, mensaje, { code: 'SIN_PERMISO' });
  }
  return encargado;
}
