// HU-2 · tabla horarios_atencion (hija de espacios)
// espacioId se crea en relaciones.js
import sequelize from '../config/database.js'
import { DataTypes } from 'sequelize'

const HorarioAtencion = sequelize.define('horarioAtencion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  dia: {                    // 'lunes' … 'domingo'
    type: DataTypes.STRING,
    allowNull: false
  },
  apertura: {               // 'HH:mm' (null si el día no atiende)
    type: DataTypes.STRING,
    allowNull: true
  },
  cierre: {                 // 'HH:mm'
    type: DataTypes.STRING,
    allowNull: true
  },
  habilitado: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'horarios_atencion'
})

export default HorarioAtencion
