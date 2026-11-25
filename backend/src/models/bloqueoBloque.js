// HU-5 · tabla bloqueo_bloques (hija de bloqueos)
// Funciona como detalleOrden de la clase 18: une bloqueos con bloques_horarios (N a N).
// Solo tiene sus dos claves foráneas, que se crean en relaciones.js: bloqueoId y bloqueId.
import sequelize from '../config/database.js'
import { DataTypes } from 'sequelize'

const BloqueoBloque = sequelize.define('bloqueoBloque', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  }
}, {
  tableName: 'bloqueo_bloques'
})

export default BloqueoBloque
