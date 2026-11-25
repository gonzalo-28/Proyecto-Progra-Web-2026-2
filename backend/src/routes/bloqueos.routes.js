import express from 'express';
import controller from '../controllers/bloqueos.controller.js';

const router = express.Router();

router.get('/', controller.findVigentes);       // GET    /bloqueos?sedeId=1
router.get('/preview', controller.preview);     // GET    /bloqueos/preview?espacioId=3&desde=…&hasta=…&bloqueIds=4,5
router.get('/:id', controller.findOne);         // GET    /bloqueos/1   (va DESPUÉS de /preview)
router.post('/', controller.create);            // POST   /bloqueos
router.delete('/:id', controller.remove);       // DELETE /bloqueos/1?encargadoId=2

export default router;
