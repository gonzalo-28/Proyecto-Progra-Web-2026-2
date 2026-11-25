// HU-2 · tabla equipamientos (hija de espacios)
// espacioId se crea en relaciones.js
import sequelize from '../config/database.js'
import { DataTypes } from 'sequelize'

const Equipamiento = sequelize.define('equipamiento', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  }
}, {
  tableName: 'equipamientos'
})

export default Equipamiento
