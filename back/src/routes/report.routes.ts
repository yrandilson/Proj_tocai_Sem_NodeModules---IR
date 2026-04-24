import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { UserRole } from '../types';

const router = Router();
const reportController = new ReportController();

// Rota para criar uma nova denúncia (requer autenticação)
router.post('/', authMiddleware, reportController.create);

// Rota para listar todas as denúncias (requer autenticação e role de admin)
router.get(
  '/',
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  reportController.findAll
);

// Rota para buscar um report por ID (requer autenticação e role de admin)
router.get(
  '/:id',
  (req, res, next) => { // << ADICIONADO Middleware de log
    console.log(`[ROUTE DEBUG] GET /api/reports/${req.params.id} - Rota atingida.`);
    next();
  },
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  reportController.findById
);

// Rota para atualizar o status de uma denúncia (requer autenticação e role de admin)
router.patch('/:id/status', authMiddleware, roleMiddleware([UserRole.ADMIN]), reportController.updateStatus);

export default router;