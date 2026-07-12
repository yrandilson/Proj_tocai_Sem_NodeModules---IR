// backend/src/routes/userRoutes.ts
import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { UserRole } from '../types';

const router = Router();
const userController = new UserController();

/**
 * GET /api/users
 * Lista todos os usuários (Admin)
 */
router.get(
  '/',
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  userController.findAll
);

/**
 * GET /api/users/:id
 * Busca um usuário por ID
 */
router.get('/:id', authMiddleware, userController.findById);

/**
 * PUT /api/users/:id
 * Atualiza dados de um usuário
 */
router.put('/:id', authMiddleware, userController.update);

/**
 * DELETE /api/users/:id
 * Deleta um usuário (Admin)
 */
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  userController.delete
);

/**
 * PATCH /api/users/:id/role
 * Altera o role de um usuário (Admin)
 */
router.patch(
  '/:id/role',
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  userController.updateRole
);

export default router;
