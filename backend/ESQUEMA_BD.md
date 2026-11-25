# Esquema de la base de datos: Reserva UL (backend con Express + Sequelize + PostgreSQL)

Sale de `frontend/src/data/db.js`, de las semillas y de los servicios del frontend.
Está implementado en `backend/src/models/` (14 modelos + `relaciones.js`). Si cambias un modelo, actualiza también este archivo.

## Convenciones
- **`id` INTEGER autoIncrement** en todas las tablas (Sequelize lo crea solo).
- Los códigos legibles van en una columna aparte, con `unique: true`: `espacios.codigo` "H-304", `reservas.codigo` "RSV-2026-0473", `incidencias.codigo` "INC-…".
- Las claves foráneas terminan en `Id` y se crean en `relaciones.js` con `foreignKey`. **No** se escriben en el modelo.
- `createdAt`/`updatedAt` de Sequelize reemplazan a `creadaEn`, `creadoEn` y `actualizadoEn`.
- **Lista dentro de un registro → tabla hija** (`hasMany` con `onDelete: 'CASCADE'`, como detalleOrden en la clase 18).
  **Objeto único** (la cancelación de una reserva) → columnas en la misma tabla.
- **Lo que se calcula no se guarda:** `reservasVigentes` (se cuentan), `en_curso` (solo de presentación, ver `utils/reglas.js`), `reservasCanceladas` de un bloqueo (se cuentan con `reservas.bloqueoId`) y el nombre del autor (se obtiene con `include` de Usuario).
- Fechas: `DATEONLY` para días ('2026-11-25'), `DATE` para fecha y hora, `STRING` 'HH:mm' para horas sueltas.
- Cada modelo lleva `tableName` explícito (como `detalles_orden` del profesor) y nombre de modelo en camelCase (`bloqueHorario`), que es la clave con la que sale en el JSON de un `include` sin `as`.

## Lo que cambia en el frontend
- Los ids que vienen de la URL (`useParams`) o de un `<select>` llegan como texto. Compáralos con `Number(id)` o `String(...)`.
- `'sede_central'` pasa a ser `sedeId: 1` (el texto se conserva en `sedes.codigo`).
- Los ids que hoy se generan en los servicios (`usr_${Date.now()}`, etc.) desaparecen: los pone la base de datos.

## Tablas

### 1. sedes (HU-1/HU-2)
| columna | tipo | nota |
|---|---|---|
| id | INTEGER PK | |
| codigo | STRING unique | 'sede_central' (compatibilidad con el frontend actual) |
| nombre | STRING | 'Campus Monterrico' |

### 2. usuarios (HU-1)
| columna | tipo | nota |
|---|---|---|
| id | INTEGER PK | |
| codigo | STRING null | código de alumno (propuesto por la HU-5, mockup 5.3) |
| nombres, apellidos | STRING | |
| correo | STRING unique, not null | @ulima.edu.pe |
| contrasena | STRING | |
| rol | STRING | 'estudiante' \| 'encargado' |
| carrera | STRING null | solo estudiantes |
| ciclo | INTEGER null | solo estudiantes |
| sedeAsignadaId | FK → sedes, null | solo encargados |
| estado | STRING | 'activo' … |
| intentosFallidos | INTEGER default 0 | opcional: límite de intentos de login (hoy en localStorage) |
| bloqueadoHasta | DATE null | opcional, ídem |

### 3. tokens_recuperacion (HU-1, opcional)
id · usuarioId FK → usuarios (CASCADE) · token STRING unique · expiraEn DATE

### 4. espacios (HU-2)
| columna | tipo | nota |
|---|---|---|
| id | INTEGER PK | |
| codigo | STRING unique | 'H-304' |
| nombre | STRING | |
| tipo | STRING | laboratorio \| sala \| sala_reuniones \| cabina \| auditorio |
| capacidad | INTEGER | |
| sedeId | FK → sedes | |
| pabellon | STRING null | |
| piso | INTEGER null | |
| ubicacion | STRING null | |
| estado | STRING | disponible \| mantenimiento \| baja |
| motivoEstado | STRING null | |
| duracionBloque | INTEGER default 60 | del horario de atención |
| foto | TEXT null | foto propia del espacio (PR #16 de HU-2). Si es null, el frontend usa la ilustración por tipo (`utils/imagenEspacio.js`) |

### 5. equipamientos (hija de espacios, HU-2)
id · espacioId FK (CASCADE) · nombre STRING · cantidad INTEGER

### 6. horarios_atencion (hija de espacios, HU-2)
id · espacioId FK (CASCADE) · dia STRING ('lunes'…'domingo') · apertura STRING 'HH:mm' null · cierre STRING null · habilitado BOOLEAN

### 7. bloques_horarios (HU-3/4/5)
id · horaInicio STRING 'HH:mm' · horaFin STRING · etiqueta STRING
(Ojo: en la semilla, bloque_002 dice "09:00 AM - 10:00 PM". Debería decir AM.)

### 8. reservas (HU-4 y HU-5)
| columna | tipo | nota |
|---|---|---|
| id | INTEGER PK | |
| codigo | STRING unique | 'RSV-2026-0473' (las URLs usan esto) |
| usuarioId | FK → usuarios | quien reserva |
| espacioId | FK → espacios | |
| bloqueId | FK → bloques_horarios | |
| fecha | DATEONLY | |
| motivo | STRING | |
| asistentes | INTEGER | |
| estado | STRING | confirmada \| atendida \| inasistencia \| cancelada |
| llegadaRegistradaEn | DATE null | HU-5 |
| canceladaEn | DATE null | ─┐ |
| canceladaPorId | FK → usuarios, null | │ |
| canceladaPorRol | STRING null | │ antes era el objeto |
| motivoCancelacion | STRING null | │ `cancelacion` (1 a 1 → |
| motivoCodigo | STRING null | │ columnas) |
| detalleCancelacion | STRING null | │ |
| bloqueoId | FK → bloqueos, null | │ si la canceló un bloqueo |
| cancelacionTardia | BOOLEAN default false | ─┘ |

### 9. invitados (hija de reservas, HU-4)
id · reservaId FK (CASCADE) · nombre STRING · correo STRING

### 10. eventos_reserva (historial, hija de reservas, HU-4/HU-5)
id · reservaId FK (CASCADE) · tipo STRING (creada \| invitados_notificados \| confirmada \| llegada_registrada \| inasistencia_marcada \| cancelada) · fecha DATE · actor STRING ('Ana Gómez' o 'Sistema'; es texto porque 'Sistema' no es un usuario)

### 11. bloqueos (HU-5)
id · espacioId FK · tipo STRING (mantenimiento \| evento) · desde DATEONLY · hasta DATEONLY · motivo STRING · creadoPorId FK → usuarios

### 12. bloqueo_bloques (hija de bloqueos, HU-5)
id · bloqueoId FK (CASCADE) · bloqueId FK → bloques_horarios
Si un bloqueo no tiene filas, es de **todo el día** (alcance completo).
Funciona como detalleOrden: une bloqueos con bloques_horarios (relación N a N con tabla intermedia propia).

### 13. incidencias (HU-6)
| columna | tipo | nota |
|---|---|---|
| id | INTEGER PK | |
| codigo | STRING unique | 'INC-…' |
| usuarioId | FK → usuarios | estudiante que reporta |
| espacioId | FK → espacios | |
| tipo | STRING | equipamiento \| infraestructura \| limpieza \| seguridad \| otro |
| descripcion | TEXT | mín. 10 caracteres |
| equipamientoAfectado | STRING null | |
| detectadaEn | DATE | |
| estado | STRING | recibida \| en_atencion \| resuelta \| desestimada |
| solucion | TEXT default '' | |

### 14. comentarios_incidencia (hija de incidencias, HU-6)
id · incidenciaId FK (CASCADE) · autorId FK → usuarios · tipo STRING (reporte \| seguimiento \| estado \| solucion) · texto TEXT · fecha DATE

**No van en la base de datos:** carreras y ciclos. Son listas fijas de `catalogService.js` ("no forman parte del contrato de datos").

## relaciones.js
El código completo está en `src/models/relaciones.js`. Resumen:

| Relación | foreignKey | as |
|---|---|---|
| sedes 1 → N usuarios | sedeAsignadaId | |
| usuarios 1 → N tokens_recuperacion (CASCADE) | usuarioId | |
| sedes 1 → N espacios | sedeId | |
| espacios 1 → N equipamientos (CASCADE) | espacioId | `equipamiento` |
| espacios 1 → N horarios_atencion (CASCADE) | espacioId | `horario` |
| usuarios 1 → N reservas | usuarioId | |
| espacios 1 → N reservas | espacioId | |
| bloques_horarios 1 → N reservas | bloqueId | |
| reservas 1 → N invitados (CASCADE) | reservaId | `invitados` |
| reservas 1 → N eventos_reserva (CASCADE) | reservaId | `historial` |
| usuarios 1 → N reservas (quién canceló) | canceladaPorId | `canceladaPor` / `cancelacionesHechas` |
| espacios 1 → N bloqueos | espacioId | |
| usuarios 1 → N bloqueos | creadoPorId | `creadoPor` |
| bloqueos 1 → N bloqueo_bloques (CASCADE) | bloqueoId | `bloques` |
| bloques_horarios 1 → N bloqueo_bloques | bloqueId | |
| bloqueos 1 → N reservas (las que canceló) | bloqueoId | |
| usuarios 1 → N incidencias | usuarioId | |
| espacios 1 → N incidencias | espacioId | |
| incidencias 1 → N comentarios_incidencia (CASCADE) | incidenciaId | `comentarios` |
| usuarios 1 → N comentarios_incidencia | autorId | `autor` |

Los `as` hacen que el JSON salga con los mismos nombres que ya usa el frontend:
`espacio.equipamiento`, `reserva.invitados`, `reserva.historial`, `incidencia.comentarios`.
Cuando una relación tiene `as`, el `include` también debe llevarlo: `include: { model: Invitado, as: 'invitados' }`.

**Importante:** `index.js` hace `import './src/models/relaciones.js'` antes del `sync`. Sin ese import, `sync` no conoce los modelos (mientras no haya rutas que los importen) y no crea ninguna tabla.

## Reparto por HU
Cada uno hace las tablas y los endpoints de su HU.

| HU | Tablas | Endpoints principales (desde los servicios del frontend) |
|---|---|---|
| HU-1 | sedes, usuarios, tokens_recuperacion | POST /usuarios/login, POST /usuarios (registro), PUT /usuarios (perfil y contraseña), recuperación |
| HU-2 | espacios, equipamientos, horarios_atencion | CRUD /espacios con include de equipamiento y horario, cambio de estado |
| HU-3 | (lee espacios, reservas y bloqueos) | GET /espacios/buscar, GET /espacios/:id/disponibilidad?semana= |
| HU-4 | bloques_horarios, reservas, invitados, eventos_reserva | POST /reservas (con invitados, en transacción), GET /reservas/usuario/:id, GET /reservas/codigo/:codigo, cancelar |
| HU-5 | bloqueos, bloqueo_bloques (+ columnas de llegada y cancelación en reservas) | /bloqueos (listar, preview, crear, eliminar) y /operacion (bandeja, llegada, inasistencia, cancelar, búsqueda). Ver la tabla de endpoints de LEEME.md |
| HU-6 | incidencias, comentarios_incidencia | POST /incidencias, GET /incidencias/usuario/:id, GET /incidencias, POST comentario, PUT estado |

**Orden de creación**, por las claves foráneas: sedes → usuarios → espacios (+ hijas) → bloques_horarios → bloqueos → reservas (+ hijas) → incidencias (+ comentarios).
Para la semilla, un script `src/data/semilla.js` como `migrate-juegos.js` del profesor, con los datos de `frontend/src/data/db.js` y los ids numéricos.
