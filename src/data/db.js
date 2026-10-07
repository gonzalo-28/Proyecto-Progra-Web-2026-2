// src/data/db.js

export const initialDb = {
  usuarios: [
    {
      id: "usr_101",
      nombres: "Ana",
      apellidos: "Gómez",
      correo: "agomez@universidad.edu.pe",
      contrasena: "123456",
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
      correo: "cruiz@universidad.edu.pe",
      contrasena: "123456",
      rol: "encargado",
      carrera: null,
      ciclo: null,
      sedeAsignadaId: "sede_central",
      estado: "activo"
    }
  ],
  espacios: [
    {
      id: "esp_001",
      nombre: "Laboratorio de Cómputo L1",
      tipo: "laboratorio",
      capacidad: 30,
      sedeId: "sede_central",
      ubicacion: "Piso 2 - Pabellón A",
      equipamiento: ["Proyector", "30 PCs", "Aire acondicionado"],
      estado: "disponible"
    }
  ],
  bloquesHorarios: [
    {
      id: "bloque_001",
      horaInicio: "08:00",
      horaFin: "10:00",
      etiqueta: "08:00 AM - 10:00 AM"
    },
    {
      id: "bloque_002",
      horaInicio: "10:00",
      horaFin: "12:00",
      etiqueta: "10:00 AM - 12:00 PM"
    }
  ],
  reservas: [],
  incidencias: []
};

export default initialDb;

/*
#####Importación directa (Solo lectura / Mocks simples)######

import initialDb from '@/data/db.js';

console.log(initialDb.usuarios);
*/