import { Router } from 'express';
import { KitController } from '../controllers/KitController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
const kitController = new KitController();

router.post('/', authMiddleware, kitController.create);
router.get('/', authMiddleware, kitController.list);
router.put('/:id', authMiddleware, kitController.update);
router.delete('/:id', authMiddleware, kitController.delete);

export default router;