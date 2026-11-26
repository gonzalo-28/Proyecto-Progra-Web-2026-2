import Sequelize from 'sequelize'
import pg from 'pg'

// En la NUBE (Vercel + Neon) la conexión llega en la variable de entorno DATABASE_URL,
// que Vercel agrega sola al conectar la base al proyecto. Esas bases exigen SSL.
// En LOCAL, si no hay DATABASE_URL, se usa tu PostgreSQL con los datos de abajo
// (cambia la contraseña por la de TU PostgreSQL).
const hostname = 'localhost'; //127.0.0.1
const username = 'postgres';
const password = 'pg4dm1n$';
const database = 'reservauldb';
const port = 5432;
const dialect = 'postgres';

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect,
      dialectModule: pg,          // necesario en Vercel para que incluya el driver
      dialectOptions: {
        ssl: { require: true, rejectUnauthorized: false }
      },
      logging: false
    })
  : new Sequelize(database, username, password, {
      host: hostname,
      port,
      dialect,
      dialectModule: pg
    });

export default sequelize;
