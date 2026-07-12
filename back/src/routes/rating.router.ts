import { Router } from 'express';
import { RatingController } from '../controllers/rating.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { UserRole } from '../types';

const router = Router();
const ratingController = new RatingController();

/**
 * POST /api/ratings
 * Cria uma nova avaliação (requer autenticação)
 */
router.post('/', authMiddleware, ratingController.create);

/**
 * GET /api/ratings/user/:userId
 * Busca todas as avaliações recebidas por um usuário
 */
router.get('/user/:userId', ratingController.getByUserId);

/**
 * GET /api/ratings
 * Lista todas as avaliações (Admin apenas)
 */
router.get('/', authMiddleware, roleMiddleware([UserRole.ADMIN]), ratingController.getAll);

export default router;