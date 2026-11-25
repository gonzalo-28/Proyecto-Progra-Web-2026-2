import express from 'express'
import bodyParser from 'body-parser';
import cors from 'cors';

// Un router por entidad. Se agregan a medida que cada HU tenga sus rutas:
// import usuariosRouter from './src/routes/usuarios.routes.js'      // HU-1
// import espaciosRouter from './src/routes/espacios.routes.js'      // HU-2 / HU-3
// import reservasRouter from './src/routes/reservas.routes.js'      // HU-4 / HU-5
import bloqueosRouter from './src/routes/bloqueos.routes.js'         // HU-5
import operacionRouter from './src/routes/operacion.routes.js'       // HU-5
// import incidenciasRouter from './src/routes/incidencias.routes.js' // HU-6

const app = express();
app.use(bodyParser.json({ limit: '5mb' })); // 5mb porque la foto de un espacio puede viajar en base64
app.use(cors());

app.get('/', (req, resp) => {
  return resp.json({ message: "HEALTHY", code: 200})
})

// app.use('/usuarios', usuariosRouter);
// app.use('/espacios', espaciosRouter);
// app.use('/reservas', reservasRouter);
app.use('/bloqueos', bloqueosRouter);
app.use('/operacion', operacionRouter);
// app.use('/incidencias', incidenciasRouter);

export default app;
