// HU-5 · Consultas de la operación diaria del encargado (bandeja, búsqueda e historial).
// Lee las tablas de la HU-4 (reservas, invitados, eventos_reserva) y solo ESCRIBE
// el cambio de estado de una reserva + su evento en el historial.
import { Op } from 'sequelize'
import sequelize from '../config/database.js'
import {
  Reserva, Espacio, BloqueHorario, Usuario, Invitado, EventoReserva,
  Bloqueo, BloqueoBloque
} from '../models/relaciones.js'
import RepositoryBase from './RepositoryBase.js'

const repository = new RepositoryBase(Reserva);

const atributosUsuario = ['id', 'codigo', 'nombres', 'apellidos', 'correo'];

/** Todo lo que necesita la vista de una reserva. Si llega sedeId, solo esa sede. */
const includeReserva = (sedeId) => [
  {
    model: Espacio,
    attributes: ['id', 'codigo', 'nombre', 'ubicacion', 'sedeId'],
    ...(sedeId ? { where: { sedeId } } : {})
  },
  { model: BloqueHorario, attributes: ['id', 'horaInicio', 'horaFin'] },
  { model: Usuario, attributes: atributosUsuario },               // quien reservó (relación sin `as`)
  { model: Invitado, as: 'invitados', attributes: ['id', 'nombre', 'correo'] },
  { model: EventoReserva, as: 'historial', attributes: ['id', 'tipo', 'fecha', 'actor'] }
];

/** Reservas de un día en los espacios de una sede (bandeja, mockup 5.1). */
repository.findDelDia = async ({ sedeId, fecha }) => {
  try {
    return await Reserva.findAll({
      where: { fecha },
      include: includeReserva(sedeId),
      order: [['id', 'ASC']]
    });
  } catch (error) {
    console.log(error);
    return null;
  }
}

/** Una reserva con todo su detalle (para operarla). */
repository.findConDetalle = async (id) => {
  try {
    return await Reserva.findOne({
      where: { id: id },
      include: includeReserva(null)
    });
  } catch (error) {
    console.log(error);
    return null;
  }
}

/** Reservas de la sede filtradas por espacio y estado (el texto se filtra en el servicio). */
repository.buscar = async ({ sedeId, espacioId, estado }) => {
  try {
    return await Reserva.findAll({
      where: {
        ...(espacioId ? { espacioId } : {}),
        ...(estado ? { estado } : {})
      },
      include: includeReserva(sedeId)
    });
  } catch (error) {
    console.log(error);
    return null;
  }
}

/**
 * Inasistencias acumuladas por usuario (misma regla que la HU-4):
 * inasistencias marcadas + cancelaciones tardías → [{ usuarioId: 3, count: 1 }, …]
 */
repository.contarInasistencias = async (usuarioIds) => {
  try {
    if (usuarioIds.length === 0) return [];
    return await Reserva.count({
      where: {
        usuarioId: usuarioIds,
        [Op.or]: [
          { estado: 'inasistencia' },
          { estado: 'cancelada', cancelacionTardia: true }
        ]
      },
      group: ['usuarioId']
    });
  } catch (error) {
    console.log(error);
    return null;
  }
}

/**
 * Cambia el estado de una reserva CONFIRMADA y registra el evento en su historial,
 * en una transacción. El `where estado: 'confirmada'` evita operar dos veces la misma
 * reserva (por ejemplo, dos encargados a la vez).
 * @returns {Promise<number|null>} filas cambiadas (0 = ya no estaba confirmada), null si falló
 */
repository.operar = async ({ reservaId, cambios, evento }) => {
  try {
    return await sequelize.transaction(async (t) => {
      const [filas] = await Reserva.update(cambios, {
        where: { id: reservaId, estado: 'confirmada' },
        transaction: t
      });
      if (filas === 0) return 0;

      await EventoReserva.create({ ...evento, reservaId }, { transaction: t });
      return filas;
    });
  } catch (error) {
    console.log(error);
    return null;
  }
}

/** Llegadas, inasistencias y cancelaciones que OCURRIERON en ese rango de horas (historial del día). */
repository.findEventosOperados = async ({ sedeId, desde, hasta }) => {
  try {
    return await EventoReserva.findAll({
      where: {
        tipo: ['llegada_registrada', 'inasistencia_marcada', 'cancelada'],
        fecha: { [Op.between]: [desde, hasta] }
      },
      include: [{
        model: Reserva,
        required: true,
        attributes: ['id', 'codigo', 'fecha', 'canceladaPorRol', 'motivoCancelacion', 'cancelacionTardia'],
        include: [
          {
            model: Espacio,
            attributes: ['id', 'nombre', 'sedeId'],
            ...(sedeId ? { where: { sedeId } } : {})
          },
          { model: BloqueHorario, attributes: ['id', 'horaInicio', 'horaFin'] },
          { model: Usuario, attributes: atributosUsuario }
        ]
      }],
      order: [['fecha', 'ASC']]
    });
  } catch (error) {
    console.log(error);
    return null;
  }
}

/** Bloqueos CREADOS en ese rango de horas (también son parte del historial del día). */
repository.findBloqueosCreados = async ({ sedeId, desde, hasta }) => {
  try {
    return await Bloqueo.findAll({
      where: { createdAt: { [Op.between]: [desde, hasta] } },
      include: [
        {
          model: Espacio,
          attributes: ['id', 'nombre', 'sedeId'],
          ...(sedeId ? { where: { sedeId } } : {})
        },
        {
          model: BloqueoBloque,
          as: 'bloques',
          attributes: ['id', 'bloqueId'],
          include: [{ model: BloqueHorario, attributes: ['id', 'horaInicio'] }]
        },
        { model: Usuario, as: 'creadoPor', attributes: atributosUsuario }
      ]
    });
  } catch (error) {
    console.log(error);
    return null;
  }
}

/** Espacios de una sede (para el filtro "Espacio" de la búsqueda). */
repository.findEspacios = async (sedeId) => {
  try {
    return await Espacio.findAll({
      where: sedeId ? { sedeId } : {},
      attributes: ['id', 'nombre'],
      order: [['id', 'ASC']]
    });
  } catch (error) {
    console.log(error);
    return null;
  }
}

export default repository;
