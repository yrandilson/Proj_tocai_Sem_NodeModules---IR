import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateDTO } from '../middlewares/validation.middleware';
import { RegisterUserDto, LoginUserDto } from '../dtos/auth.dto';
import { AuthController } from '../controllers/auth.controller';

const router = Router();
const authController = new AuthController();

/**
 * POST /api/auth/register
 * Registra um novo usuário
 */
router.post('/register', validateDTO(RegisterUserDto), authController.register);

/**
 * POST /api/auth/login
 * Faz login de um usuário
 */
router.post('/login', validateDTO(LoginUserDto), authController.login);

/**
 * GET /api/auth/me
 * Retorna dados do usuário autenticado
 */
router.get('/me', authMiddleware, authController.getMe);

export default router;
