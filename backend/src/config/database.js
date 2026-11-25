import Sequelize from 'sequelize'
import pg from 'pg'

// Cada integrante cambia la contraseña por la de SU PostgreSQL (no subir la tuya si es distinta).
// La base 'reservauldb' se crea antes a mano en pgAdmin: Databases → Create → Database.
const hostname = 'localhost'; //127.0.0.1
const username = 'postgres';
const password = 'pg4dm1n$';
const database = 'reservauldb';
const port = 5432;
const dialect = 'postgres';

const sequelize = new Sequelize(database, username, password, {
  host: hostname,
  port,
  dialect,
  dialectModule: pg
});

export default sequelize;
