import { Router } from 'express';
import { KitController } from '../controllers/KitController';
import { authMiddleware } from '../middlewares/authMiddleware';
import upload from '../config/multer';

const router = Router();
const kitController = new KitController();

// 🌐 Rota PÚBLICA — Vitrine Virtual (sem autenticação)
router.get('/public', kitController.listPublic);

// 🔒 Rotas PROTEGIDAS — Backoffice (com autenticação)
router.post('/', authMiddleware, upload.single('image'), kitController.create);
router.get('/', authMiddleware, kitController.list);
router.put('/:id', authMiddleware, upload.single('image'), kitController.update);
router.delete('/:id', authMiddleware, kitController.delete);

export default router;