// HU-5 · Operación diaria del encargado. Va en /operacion (y no en /reservas)
// para no compartir archivo con el router de reservas de la HU-4.
import express from 'express';
import controller from '../controllers/operacion.controller.js';

const router = express.Router();

router.get('/bandeja', controller.bandeja);                         // GET /operacion/bandeja?sedeId=1&fecha=2026-11-25
router.get('/espacios', controller.espacios);                       // GET /operacion/espacios?sedeId=1
router.get('/reservas', controller.buscar);                         // GET /operacion/reservas?sedeId=1&texto=…&espacioId=&estado=
router.put('/reservas/:id/llegada', controller.llegada);            // PUT /operacion/reservas/17/llegada
router.put('/reservas/:id/inasistencia', controller.inasistencia);  // PUT /operacion/reservas/18/inasistencia
router.put('/reservas/:id/cancelar', controller.cancelar);          // PUT /operacion/reservas/22/cancelar

export default router;
