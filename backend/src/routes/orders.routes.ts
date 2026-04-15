import { Router } from 'express';
import { OrderController } from '../controllers/OrderController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
const orderController = new OrderController();

// A porta blindada novamente!
router.post('/', authMiddleware, orderController.create);
router.get('/', authMiddleware, orderController.list);
router.put('/:id', authMiddleware, orderController.update);
router.delete('/:id', authMiddleware, orderController.delete);

export default router;