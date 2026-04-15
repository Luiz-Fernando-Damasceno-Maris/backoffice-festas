import { Router } from 'express';
import { ItemController } from '../controllers/ItemController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
const itemController = new ItemController();

router.post('/', authMiddleware, itemController.create);
router.get('/', authMiddleware, itemController.list);
router.put('/:id', authMiddleware, itemController.update);
router.delete('/:id', authMiddleware, itemController.delete);

export default router;