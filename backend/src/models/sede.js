// HU-1 / HU-2 · tabla sedes
import sequelize from '../config/database.js'
import { DataTypes } from 'sequelize'

const Sede = sequelize.define('sede', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  codigo: {                 // 'sede_central' (el frontend actual usa este texto)
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  nombre: {                 // 'Campus Monterrico'
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'sedes'
})

export default Sede
