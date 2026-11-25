// HU-5 · tabla bloqueos
// Claves foráneas (en relaciones.js): espacioId (qué espacio) y creadoPorId (qué encargado).
// Los bloques horarios elegidos van en la tabla hija bloqueo_bloques.
// Si un bloqueo NO tiene filas en bloqueo_bloques, bloquea TODO el día.
// Lo que se calcula no se guarda: las reservas que canceló se cuentan con reservas.bloqueoId.
import sequelize from '../config/database.js'
import { DataTypes } from 'sequelize'

const Bloqueo = sequelize.define('bloqueo', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  tipo: {                   // mantenimiento | evento
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'mantenimiento'
  },
  desde: {                  // '2026-11-25'
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  hasta: {                  // '2026-11-27' (igual a desde si es un solo día)
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  motivo: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'bloqueos'
})

export default Bloqueo
