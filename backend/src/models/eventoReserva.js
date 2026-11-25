// HU-4 / HU-5 · tabla eventos_reserva (historial, hija de reservas)
// reservaId se crea en relaciones.js
import sequelize from '../config/database.js'
import { DataTypes } from 'sequelize'

const EventoReserva = sequelize.define('eventoReserva', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  tipo: {   // creada | invitados_notificados | confirmada | llegada_registrada | inasistencia_marcada | cancelada
    type: DataTypes.STRING,
    allowNull: false
  },
  fecha: {
    type: DataTypes.DATE,
    allowNull: false
  },
  actor: {  // 'Carlos Ruiz' o 'Sistema' (texto, porque 'Sistema' no es un usuario)
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'eventos_reserva'
})

export default EventoReserva
