// HU-5 · Controlador de bloqueos: recibe la petición, llama al servicio y responde.
// Si el servicio lanza un error con status (400, 403, 404, 409), responderError
// lo devuelve con ese código y su `message`.
import service from '../services/bloqueos.service.js'
import { responderError } from '../utils/errores.js'

const findVigentes = async (req, resp) => {
  try {
    const respuesta = await service.listarVigentes({ sedeId: req.query.sedeId });
    return resp.status(200).json(respuesta);
  } catch (error) {
    return responderError(error, resp);
  }
}

const findOne = async (req, resp) => {
  try {
    const respuesta = await service.obtener(req.params.id);
    return resp.status(200).json(respuesta);
  } catch (error) {
    return responderError(error, resp);
  }
}

const preview = async (req, resp) => {
  try {
    const respuesta = await service.previsualizar(req.query);
    return resp.status(200).json(respuesta);
  } catch (error) {
    return responderError(error, resp);
  }
}

const create = async (req, resp) => {
  try {
    const respuesta = await service.crear(req.body);
    return resp.status(201).json(respuesta);
  } catch (error) {
    return responderError(error, resp);
  }
}

const remove = async (req, resp) => {
  try {
    const respuesta = await service.eliminar(req.params.id, { encargadoId: req.query.encargadoId });
    return resp.status(200).json(respuesta);
  } catch (error) {
    return responderError(error, resp);
  }
}

const controller = { findVigentes, findOne, preview, create, remove }

export default controller;
