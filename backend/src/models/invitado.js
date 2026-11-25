// HU-4 · tabla invitados (hija de reservas)
// reservaId se crea en relaciones.js
import sequelize from '../config/database.js'
import { DataTypes } from 'sequelize'

const Invitado = sequelize.define('invitado', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: true
  },
  correo: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'invitados'
})

export default Invitado
