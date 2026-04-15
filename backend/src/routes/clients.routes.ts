import { Router } from 'express';
import { ClientController } from '../controllers/ClientController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
const clientController = new ClientController();

// Repare que colocamos o 'authMiddleware' no meio, trancando essas portas!
router.post('/', authMiddleware, clientController.create);
router.get('/', authMiddleware, clientController.list);
router.put('/:id', authMiddleware, clientController.update);
router.delete('/:id', authMiddleware, clientController.delete);

export default router;