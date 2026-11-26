# Reserva UL · API

API REST de Reserva UL (reservas de espacios de la Universidad de Lima).
Express + Sequelize + PostgreSQL, con la misma estructura que la práctica 19 del profesor.
Proyecto del curso Programación Web · Universidad de Lima · 2026-2 · Grupo 4.
El aplicativo web (React + Vite) está en su propio repositorio.

## Cómo levantarlo en local (la primera vez)
1. En pgAdmin crea la base **reservauldb** (Databases → Create → Database).
2. En `src/config/database.js` pon la contraseña de TU PostgreSQL.
3. En esta carpeta:
   ```
   npm install
   npm run semilla  ← crea las tablas desde cero y carga los datos de prueba
   npm run dev      ← levanta el servidor (no borra datos)
   ```
   `npm run init` también recrea las tablas, pero las deja vacías.
   La semilla lee `src/data/datosIniciales/` y sus fechas son relativas al día en que se corre:
   si quieres que la bandeja de la HU-5 muestre "hoy", vuelve a correr `npm run semilla`.
4. Abre `src/tests/pruebas.http` (extensión REST Client) y prueba `GET http://localhost:3005/` → `HEALTHY`.

## Estructura
```
index.js                       sync + listen 3005 (importa relaciones.js para registrar los modelos)
app.js                         express, bodyParser, cors y un app.use por router
src/config/database.js         conexión a PostgreSQL
src/models/*.js                un sequelize.define por tabla (14 tablas)
src/models/relaciones.js       hasMany / belongsTo: aquí nacen las claves foráneas (…Id)
src/repositories/RepositoryBase.js   CRUD genérico del profesor. NO se modifica
src/repositories, services, controllers, routes   ← cada HU agrega los suyos
src/data/semilla.js            datos de prueba (como migrate-juegos.js): npm run semilla
src/tests/pruebas.http         pruebas con REST Client
```

## Modelos por HU
| HU | Modelos |
|---|---|
| HU-1 | sede, usuario, tokenRecuperacion |
| HU-2 | espacio (+ foto), equipamiento, horarioAtencion |
| HU-4 | bloqueHorario, reserva, invitado, eventoReserva |
| HU-5 | bloqueo, bloqueoBloque + columnas de llegada y cancelación de reserva |
| HU-6 | incidencia, comentarioIncidencia |

El detalle de cada tabla, las relaciones y el reparto por HU están en [`ESQUEMA_BD.md`](ESQUEMA_BD.md).

## Endpoints disponibles
Cada HU agrega aquí los suyos. Las pruebas de cada HU van en su propio archivo `src/tests/<entidad>.http`.

| HU | Método y ruta | Qué hace |
|---|---|---|
| HU-5 | `GET /bloqueos?sedeId=1` | Bloqueos vigentes (terminan hoy o después), con espacio, bloques y reservas canceladas |
| HU-5 | `GET /bloqueos/preview?espacioId&desde&hasta&bloqueIds=4,5` | Reservas confirmadas que el bloqueo cancelaría |
| HU-5 | `GET /bloqueos/:id` | Un bloqueo |
| HU-5 | `POST /bloqueos` | Crea el bloqueo y cancela las reservas afectadas en una transacción |
| HU-5 | `DELETE /bloqueos/:id?encargadoId=2` | Elimina el bloqueo (las reservas canceladas no se reactivan) |
| HU-5 | `GET /operacion/bandeja?sedeId=1&fecha=2026-11-25` | Bandeja del día: contadores, reservas agrupadas por espacio e historial de la operación |
| HU-5 | `PUT /operacion/reservas/:id/llegada` | Registra la llegada (body: `encargadoId`) |
| HU-5 | `PUT /operacion/reservas/:id/inasistencia` | Marca la inasistencia, vencida la tolerancia de 15 min |
| HU-5 | `PUT /operacion/reservas/:id/cancelar` | Cancela como encargado (body: `encargadoId`, `motivo`, `detalle`) |
| HU-5 | `GET /operacion/reservas?sedeId=1&texto=&espacioId=&estado=` | Búsqueda por código, estudiante, correo o código de alumno |
| HU-5 | `GET /operacion/espacios?sedeId=1` | Espacios de la sede para el filtro de la búsqueda |

En los `PUT` de `/operacion` se puede mandar `"hora": "10:05"` para simular la hora actual al probar
(como `?hora=10:08` en la bandeja del frontend).

## Capas y errores
`routes` → `controllers` (recibe y responde) → `services` (reglas de negocio) → `repositories` (Sequelize).
Para una entidad con solo CRUD basta el patrón del profesor (controller + RepositoryBase).

Cuando una regla falla, el servicio lanza `crearError(status, mensaje, { code, campos })` (`src/utils/errores.js`)
y el controlador responde con `responderError`. El frontend recibe siempre la misma forma:
```json
{ "success": false, "message": "Revisa los campos marcados.", "code": "VALIDACION", "campos": { "motivo": "…" } }
```
400 datos inválidos · 403 sin permiso · 404 no existe · 409 choca con otro registro · 500 error interno.

## Despliegue en Vercel
1. **Base de datos:** en Vercel → Storage → Create Database → **Neon** (Postgres). Conéctala al proyecto de la API:
   Vercel agrega sola la variable `DATABASE_URL` y `src/config/database.js` la usa.
2. **Cargar los datos en la nube:** copia `.env.example` como `.env`, pega la `DATABASE_URL` de Neon y corre
   `npm run semilla:nube`. (`.env` no se sube a GitHub.)
3. **API:** en Vercel → Add New → Project → importa este repositorio. Vercel detecta Express por `app.js`
   (que hace `export default app`); no hay que configurar build ni puerto.
4. Prueba `GET https://<tu-api>.vercel.app/` → `HEALTHY`. Esa URL es la que usa el frontend (`VITE_API_URL`).
