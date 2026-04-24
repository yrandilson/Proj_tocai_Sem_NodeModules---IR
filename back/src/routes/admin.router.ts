import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { UserRole } from '../types';

const router = Router();
const adminController = new AdminController();

router.use(authMiddleware, roleMiddleware([UserRole.ADMIN])); // Todas as rotas de admin exigem autenticação e role ADMIN

router.get('/stats', adminController.getStats);
router.get('/top-categories', adminController.getTopCategories);
router.get('/recent-activity', adminController.getRecentActivity);
router.get('/growth-data', adminController.getGrowthData);

export default router;