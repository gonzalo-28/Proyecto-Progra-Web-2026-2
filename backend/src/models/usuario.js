// HU-1 · tabla usuarios (estudiantes y encargados)
// sedeAsignadaId (solo encargados) se crea en relaciones.js
import sequelize from '../config/database.js'
import { DataTypes } from 'sequelize'

const Usuario = sequelize.define('usuario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  codigo: {                 // código de alumno, lo muestra la ficha de la HU-5 (mockup 5.3)
    type: DataTypes.STRING,
    allowNull: true
  },
  nombres: {
    type: DataTypes.STRING,
    allowNull: false
  },
  apellidos: {
    type: DataTypes.STRING,
    allowNull: false
  },
  correo: {                 // @ulima.edu.pe
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  contrasena: {
    type: DataTypes.STRING,
    allowNull: false
  },
  rol: {                    // 'estudiante' | 'encargado'
    type: DataTypes.STRING,
    allowNull: false
  },
  carrera: {                // solo estudiantes
    type: DataTypes.STRING,
    allowNull: true
  },
  ciclo: {                  // solo estudiantes
    type: DataTypes.INTEGER,
    allowNull: true
  },
  estado: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'activo'
  },
  intentosFallidos: {       // opcional: límite de intentos de login
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  bloqueadoHasta: {         // opcional, ídem
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'usuarios'
})

export default Usuario
