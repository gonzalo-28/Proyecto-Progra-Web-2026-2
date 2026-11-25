// HU-5 · Consultas de bloqueos (como ordenes.repository.js de la clase 18).
// Hereda de RepositoryBase (remove…) y agrega o reemplaza lo que necesita include.
import { Op } from 'sequelize'
import sequelize from '../config/database.js'
import {
  Bloqueo, BloqueoBloque, BloqueHorario, Espacio,
  Reserva, Usuario, EventoReserva
} from '../models/relaciones.js'
import RepositoryBase from './RepositoryBase.js'

const repository = new RepositoryBase(Bloqueo);

/** Espacio del bloqueo + sus bloques horarios. Si llega sedeId, solo los de esa sede. */
const includeBloqueo = (sedeId) => [
  {
    model: Espacio,
    attributes: ['id', 'codigo', 'nombre', 'sedeId'],
    ...(sedeId ? { where: { sedeId } } : {})
  },
  {
    model: BloqueoBloque,
    as: 'bloques',                    // el `as` de relaciones.js
    attributes: ['id', 'bloqueId'],
    include: [{ model: BloqueHorario, attributes: ['id', 'horaInicio', 'horaFin'] }]
  }
];

/** Bloqueos que terminan hoy o después (opcionalmente de una sede). */
repository.findVigentes = async ({ sedeId, hoy }) => {
  try {
    return await Bloqueo.findAll({
      where: { hasta: { [Op.gte]: hoy } },
      include: includeBloqueo(sedeId),
      order: [['desde', 'ASC'], ['id', 'ASC']]
    });
  } catch (error) {
    console.log(error);
    return null;
  }
}

/** REEMPLAZA findOne para traer también el espacio y los bloques. */
repository.findOne = async (id) => {
  try {
    return await Bloqueo.findOne({
      where: { id: id },
      include: includeBloqueo(null)
    });
  } catch (error) {
    console.log(error);
    return null;
  }
}

/** Bloqueos del mismo espacio cuyas fechas se cruzan con [desde, hasta]. */
repository.findCruces = async ({ espacioId, desde, hasta }) => {
  try {
    return await Bloqueo.findAll({
      where: {
        espacioId,
        desde: { [Op.lte]: hasta },
        hasta: { [Op.gte]: desde }
      },
      include: [{ model: BloqueoBloque, as: 'bloques', attributes: ['id', 'bloqueId'] }]
    });
  } catch (error) {
    console.log(error);
    return null;
  }
}

/** Cuántas reservas canceló cada bloqueo → [{ bloqueoId: 1, count: 2 }, …] */
repository.contarCanceladas = async (bloqueoIds) => {
  try {
    if (bloqueoIds.length === 0) return [];
    return await Reserva.count({
      where: { bloqueoId: bloqueoIds },
      group: ['bloqueoId']
    });
  } catch (error) {
    console.log(error);
    return null;
  }
}

/** Reservas CONFIRMADAS del espacio entre esas fechas (y en esos bloques, si hay). */
repository.findReservasEnRango = async ({ espacioId, desde, hasta, bloqueIds }) => {
  try {
    return await Reserva.findAll({
      where: {
        espacioId,
        estado: 'confirmada',
        fecha: { [Op.between]: [desde, hasta] },
        ...(bloqueIds.length ? { bloqueId: bloqueIds } : {})   // sin bloques = todo el día
      },
      include: [
        { model: BloqueHorario, attributes: ['id', 'horaInicio', 'horaFin'] },
        { model: Usuario, attributes: ['id', 'codigo', 'nombres', 'apellidos', 'correo'] }
      ],
      order: [['fecha', 'ASC']]
    });
  } catch (error) {
    console.log(error);
    return null;
  }
}

/**
 * Crea el bloqueo, sus bloques y cancela las reservas afectadas, TODO en una transacción
 * (como createConDetalles de la clase 18): si algo falla, no se guarda nada.
 */
repository.crearYCancelar = async ({ datos, bloqueIds, reservaIds, actor, motivoVisible, ahora }) => {
  try {
    const bloqueoId = await sequelize.transaction(async (t) => {
      const bloqueo = await Bloqueo.create(datos, { transaction: t });

      if (bloqueIds.length > 0) {
        await BloqueoBloque.bulkCreate(
          bloqueIds.map((bloqueId) => ({ bloqueoId: bloqueo.id, bloqueId })),
          { transaction: t }
        );
      }

      if (reservaIds.length > 0) {
        await Reserva.update({
          estado: 'cancelada',
          canceladaEn: ahora,
          canceladaPorId: datos.creadoPorId,
          canceladaPorRol: 'encargado',
          motivoCancelacion: motivoVisible,   // lo que ve el estudiante en "Mis reservas"
          motivoCodigo: 'bloqueo',
          detalleCancelacion: datos.motivo,
          bloqueoId: bloqueo.id,
          cancelacionTardia: false            // no cuenta como inasistencia
        }, { where: { id: reservaIds }, transaction: t });

        await EventoReserva.bulkCreate(
          reservaIds.map((reservaId) => ({ reservaId, tipo: 'cancelada', fecha: ahora, actor })),
          { transaction: t }
        );
      }

      return bloqueo.id;
    });

    return await repository.findOne(bloqueoId);
  } catch (error) {
    console.log(error);
    return null;
  }
}

export default repository;
