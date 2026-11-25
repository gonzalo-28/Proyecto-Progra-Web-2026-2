// HU-1 (opcional) · tabla tokens_recuperacion
// usuarioId se crea en relaciones.js
import sequelize from '../config/database.js'
import { DataTypes } from 'sequelize'

const TokenRecuperacion = sequelize.define('tokenRecuperacion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  token: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  expiraEn: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  tableName: 'tokens_recuperacion'
})

export default TokenRecuperacion
