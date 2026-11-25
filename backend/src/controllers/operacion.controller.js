// HU-5 · Controlador de la operación diaria: recibe, llama al servicio y responde.
import service from '../services/operacion.service.js'
import { responderError } from '../utils/errores.js'

const bandeja = async (req, resp) => {
  try {
    const respuesta = await service.obtenerBandeja(req.query);
    return resp.status(200).json(respuesta);
  } catch (error) {
    return responderError(error, resp);
  }
}

const llegada = async (req, resp) => {
  try {
    const respuesta = await service.registrarLlegada(req.params.id, req.body);
    return resp.status(200).json(respuesta);
  } catch (error) {
    return responderError(error, resp);
  }
}

const inasistencia = async (req, resp) => {
  try {
    const respuesta = await service.marcarInasistencia(req.params.id, req.body);
    return resp.status(200).json(respuesta);
  } catch (error) {
    return responderError(error, resp);
  }
}

const cancelar = async (req, resp) => {
  try {
    const respuesta = await service.cancelarPorEncargado(req.params.id, req.body);
    return resp.status(200).json(respuesta);
  } catch (error) {
    return responderError(error, resp);
  }
}

const buscar = async (req, resp) => {
  try {
    const respuesta = await service.buscarReservas(req.query);
    return resp.status(200).json(respuesta);
  } catch (error) {
    return responderError(error, resp);
  }
}

const espacios = async (req, resp) => {
  try {
    const respuesta = await service.espaciosDeSede(req.query);
    return resp.status(200).json(respuesta);
  } catch (error) {
    return responderError(error, resp);
  }
}

const controller = { bandeja, llegada, inasistencia, cancelar, buscar, espacios }

export default controller;
