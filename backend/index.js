import app from './app.js'
import sequelize from './src/config/database.js';
import './src/models/relaciones.js'; // registra TODOS los modelos antes del sync (si no, sync no crea las tablas)

async function main() {

  try {
      const init = process.argv[2];

      if (init) 
        await sequelize.sync({ force: true});   // node index.js init → borra y vuelve a crear las tablas
      else
        await sequelize.sync({ force: false});  // node index.js      → solo crea las que falten

      console.log('Base de datos sincronizada!')

      const PORT = 3005;

      app.listen(PORT, () => {
        console.log('Aplicación ejecutándose en el puerto ' + PORT);
      })
  } catch (error) {
    console.log(error)
  }

}

main();
