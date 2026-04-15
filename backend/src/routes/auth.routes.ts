import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';

const router = Router();
const authController = new AuthController();

// Define que quando houver um POST em /login, a função do controller é chamada
router.post('/login', authController.login);

export default router;