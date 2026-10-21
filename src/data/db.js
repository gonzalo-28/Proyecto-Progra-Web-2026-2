// src/data/db.js
import reservasSemilla from './reservasSemilla.js';
import { estudiantesOperacion, reservasOperacion } from './operacionSemilla.js'; // HU-5
export const initialDb = {
  usuarios: [
    {
      id: "usr_101",
      nombres: "Ana",
      apellidos: "Gómez",
      correo: "agomez@ulima.edu.pe",
      contrasena: "Aa1234",
      rol: "estudiante",
      carrera: "Ingeniería de Sistemas",
      ciclo: 6,
      sedeAsignadaId: null,
      estado: "activo"
    },
    {
      id: "usr_201",
      nombres: "Carlos",
      apellidos: "Ruiz",
      correo: "cruiz@ulima.edu.pe",
      contrasena: "Aa1234",
      rol: "encargado",
      carrera: null,
      ciclo: null,
      sedeAsignadaId: "sede_central",
      estado: "activo"
    },
    ...estudiantesOperacion, // HU-5: estudiantes de los mockups 5.x
  ],
  espacios: [
    {
      id: "esp_001",
      codigo: "H-304",
      nombre: "Laboratorio de Cómputo H-304",
      tipo: "laboratorio",
      capacidad: 30,
      sedeId: "sede_central",
      pabellon: "Ed. de Ingeniería",
      piso: 3,
      ubicacion: "Edificio de Ingeniería, piso 3",
      equipamiento: ["Proyector", "30 PCs", "Aire acondicionado"],
      estado: "disponible",
      reservasVigentes: 11
    },
    {
      id: "esp_002",
      codigo: "E-201",
      nombre: "Sala de Estudio Grupal E-201",
      tipo: "sala",
      capacidad: 8,
      sedeId: "sede_central",
      pabellon: "Pabellón E",
      ubicacion: "Pabellón E",
      equipamiento: ["Pizarra"],
      estado: "disponible",
      reservasVigentes: 6
    },
    {
      id: "esp_003",
      codigo: "N-105",
      nombre: "Cabina de Grabación N-105",
      tipo: "cabina",
      capacidad: 3,
      sedeId: "sede_central",
      pabellon: "Pabellón N",
      ubicacion: "Pabellón N",
      equipamiento: ["Micrófono"],
      estado: "disponible",
      reservasVigentes: 5
    },
    {
      id: "esp_004",
      codigo: "Q-101",
      nombre: "Auditorio Q-101",
      tipo: "auditorio",
      capacidad: 120,
      sedeId: "sede_central",
      pabellon: "Pabellón Q",
      ubicacion: "Pabellón Q",
      equipamiento: ["Proyector"],
      estado: "disponible",
      reservasVigentes: 2
    },
    {
      id: "esp_005",
      codigo: "E-202",
      nombre: "Sala de Estudio Grupal E-202",
      tipo: "sala",
      capacidad: 6,
      sedeId: "sede_central",
      pabellon: "Pabellón E",
      ubicacion: "Pabellón E",
      equipamiento: ["Pizarra"],
      estado: "disponible",
      reservasVigentes: 4
    },
    {
      id: "esp_006",
      codigo: "H-305",
      nombre: "Laboratorio de Cómputo H-305",
      tipo: "laboratorio",
      capacidad: 24,
      sedeId: "sede_central",
      pabellon: "Ed. de Ingeniería",
      ubicacion: "Edificio de Ingeniería, piso 3",
      equipamiento: ["Computadoras", "Proyector"],
      estado: "mantenimiento",
      reservasVigentes: 0
    },
    {
      id: "esp_007",
      codigo: "H-201",
      nombre: "Laboratorio de Redes H-201",
      tipo: "laboratorio",
      capacidad: 20,
      sedeId: "sede_central",
      pabellon: "Ed. de Ingeniería",
      ubicacion: "Edificio de Ingeniería, piso 2",
      equipamiento: ["Computadoras", "Switches"],
      estado: "disponible",
      reservasVigentes: 6
    },
    {
      id: "esp_008",
      codigo: "A-410",
      nombre: "Sala de Reuniones A-410",
      tipo: "sala_reuniones",
      capacidad: 12,
      sedeId: "sede_central",
      pabellon: "Pabellón A",
      ubicacion: "Pabellón A",
      equipamiento: ["Pantalla", "Pizarra"],
      estado: "disponible",
      reservasVigentes: 7
    },
    {
      id: "esp_009",
      codigo: "A-411",
      nombre: "Sala de Reuniones A-411",
      tipo: "sala_reuniones",
      capacidad: 10,
      sedeId: "sede_central",
      pabellon: "Pabellón A",
      ubicacion: "Pabellón A",
      equipamiento: [],
      estado: "baja",
      reservasVigentes: 0
    },
    {
      id: "esp_010",
      codigo: "B-102",
      nombre: "Sala de Estudio Biblioteca B-102",
      tipo: "sala",
      capacidad: 6,
      sedeId: "sede_central",
      pabellon: "Biblioteca",
      ubicacion: "Biblioteca",
      equipamiento: ["Pizarra"],
      estado: "disponible",
      reservasVigentes: 9
    },
    {
      id: "esp_011",
      codigo: "E-203",
      nombre: "Sala de Estudio Grupal E-203",
      tipo: "sala",
      capacidad: 8,
      sedeId: "sede_central",
      pabellon: "Pabellón E",
      ubicacion: "Pabellón E",
      equipamiento: ["Pizarra"],
      estado: "disponible",
      reservasVigentes: 3
    },
    {
      id: "esp_012",
      codigo: "H-306",
      nombre: "Laboratorio de Cómputo H-306",
      tipo: "laboratorio",
      capacidad: 30,
      sedeId: "sede_central",
      pabellon: "Ed. de Ingeniería",
      ubicacion: "Edificio de Ingeniería, piso 3",
      equipamiento: ["Computadoras", "Proyector"],
      estado: "disponible",
      reservasVigentes: 8
    },
  ],
  bloquesHorarios: [
    {
      id: "bloque_001",
      horaInicio: "08:00",
      horaFin: "09:00",
      etiqueta: "08:00 AM - 09:00 AM"
    },
    {
      id: "bloque_002",
      horaInicio: "09:00",
      horaFin: "10:00",
      etiqueta: "09:00 AM - 10:00 PM"
    },
    {
      id: "bloque_003",
      horaInicio: "10:00",
      horaFin: "11:00",
      etiqueta: "10:00 AM - 11:00 AM"
    },
    {
      id: "bloque_004",
      horaInicio: "11:00",
      horaFin: "12:00",
      etiqueta: "11:00 AM - 12:00 PM"
    }
  ],
  reservas: [...reservasSemilla, ...reservasOperacion], // HU-4 + jornada de prueba de la HU-5
  bloqueos: [], // HU-5: bloqueos por mantenimiento (forma en services/blockService.js)
  incidencias: []
};

export default initialDb;

/*
#####Importación directa (Solo lectura / Mocks simples)######

import initialDb from '@/data/db.js';

console.log(initialDb.usuarios);
*/
