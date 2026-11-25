# Backend de Reserva UL

Express + Sequelize + PostgreSQL, con la misma estructura que la práctica 19 del profesor.

## Cómo levantarlo (la primera vez)
1. En pgAdmin crea la base **reservauldb** (Databases → Create → Database).
2. En `src/config/database.js` pon la contraseña de TU PostgreSQL.
3. En esta carpeta:
   ```
   npm install
   npm run init     ← crea (o vuelve a crear) todas las tablas: sync({ force: true })
   npm run dev      ← las siguientes veces (no borra datos)
   ```
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
src/data/                      semilla.js (pendiente, como migrate-juegos.js)
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
