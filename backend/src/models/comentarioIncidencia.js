// HU-6 · tabla comentarios_incidencia (hija de incidencias)
// incidenciaId y autorId se crean en relaciones.js
import sequelize from '../config/database.js'
import { DataTypes } from 'sequelize'

const ComentarioIncidencia = sequelize.define('comentarioIncidencia', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  tipo: {                   // reporte | seguimiento | estado | solucion
    type: DataTypes.STRING,
    allowNull: false
  },
  texto: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  fecha: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  tableName: 'comentarios_incidencia'
})

export default ComentarioIncidencia
