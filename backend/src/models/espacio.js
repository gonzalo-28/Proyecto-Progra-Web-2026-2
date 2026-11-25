// HU-2 · tabla espacios
// sedeId se crea en relaciones.js. El equipamiento y el horario son tablas hijas.
import sequelize from '../config/database.js'
import { DataTypes } from 'sequelize'

const Espacio = sequelize.define('espacio', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  codigo: {                 // 'H-304'
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  tipo: {                   // laboratorio | sala | sala_reuniones | cabina | auditorio
    type: DataTypes.STRING,
    allowNull: false
  },
  capacidad: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  pabellon: {
    type: DataTypes.STRING,
    allowNull: true
  },
  piso: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  ubicacion: {
    type: DataTypes.STRING,
    allowNull: true
  },
  estado: {                 // disponible | mantenimiento | baja
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'disponible'
  },
  motivoEstado: {
    type: DataTypes.STRING,
    allowNull: true
  },
  duracionBloque: {         // minutos, del horario de atención
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 60
  },
  foto: {                   // foto propia (PR #16 de HU-2). TEXT porque puede ser base64
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'espacios'
})

export default Espacio
