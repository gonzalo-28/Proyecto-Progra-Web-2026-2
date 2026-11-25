// HU-4 + HU-5 · tabla reservas
// Claves foráneas (se crean en relaciones.js):
//   usuarioId, espacioId, bloqueId   → HU-4 (quién, dónde, a qué hora)
//   canceladaPorId, bloqueoId        → HU-5 (quién canceló / qué bloqueo la canceló)
import sequelize from '../config/database.js'
import { DataTypes } from 'sequelize'

const Reserva = sequelize.define('reserva', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  // ----- HU-4: datos de la reserva -----
  codigo: {                 // 'RSV-2026-0473' (las URLs del frontend usan esto)
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  fecha: {                  // '2026-11-25'
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  motivo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  asistentes: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  estado: {                 // confirmada | atendida | inasistencia | cancelada
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'confirmada'
  },

  // ----- HU-5: llegada -----
  llegadaRegistradaEn: {    // cuándo el encargado marcó la llegada (estado → 'atendida')
    type: DataTypes.DATE,
    allowNull: true
  },

  // ----- HU-4 / HU-5: cancelación (antes era el objeto `cancelacion`, 1 a 1 → columnas) -----
  canceladaEn: {
    type: DataTypes.DATE,
    allowNull: true
  },
  canceladaPorRol: {        // 'estudiante' | 'encargado' | 'sistema'
    type: DataTypes.STRING,
    allowNull: true
  },
  motivoCancelacion: {      // texto que se muestra
    type: DataTypes.STRING,
    allowNull: true
  },
  motivoCodigo: {           // código del motivo elegido en el modal del encargado
    type: DataTypes.STRING,
    allowNull: true
  },
  detalleCancelacion: {
    type: DataTypes.STRING,
    allowNull: true
  },
  cancelacionTardia: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  tableName: 'reservas'
})

export default Reserva
