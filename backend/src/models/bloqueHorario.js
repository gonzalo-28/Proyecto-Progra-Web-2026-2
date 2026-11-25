// HU-3 / HU-4 / HU-5 · tabla bloques_horarios
import sequelize from '../config/database.js'
import { DataTypes } from 'sequelize'

const BloqueHorario = sequelize.define('bloqueHorario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  horaInicio: {             // 'HH:mm'
    type: DataTypes.STRING,
    allowNull: false
  },
  horaFin: {                // 'HH:mm'
    type: DataTypes.STRING,
    allowNull: false
  },
  etiqueta: {               // '08:00 AM - 09:00 AM'
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'bloques_horarios'
})

export default BloqueHorario
