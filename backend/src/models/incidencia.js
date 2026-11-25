// HU-6 · tabla incidencias
// usuarioId y espacioId se crean en relaciones.js
import sequelize from '../config/database.js'
import { DataTypes } from 'sequelize'

const Incidencia = sequelize.define('incidencia', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  codigo: {                 // 'INC-…'
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  tipo: {                   // equipamiento | infraestructura | limpieza | seguridad | otro
    type: DataTypes.STRING,
    allowNull: false
  },
  descripcion: {            // mínimo 10 caracteres (se valida en el servicio)
    type: DataTypes.TEXT,
    allowNull: false
  },
  equipamientoAfectado: {
    type: DataTypes.STRING,
    allowNull: true
  },
  detectadaEn: {
    type: DataTypes.DATE,
    allowNull: false
  },
  estado: {                 // recibida | en_atencion | resuelta | desestimada
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'recibida'
  },
  solucion: {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: ''
  }
}, {
  tableName: 'incidencias'
})

export default Incidencia
