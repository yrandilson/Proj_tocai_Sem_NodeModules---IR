import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { AuthController } from '../controllers/auth.controller';
import { ItemController } from '../controllers/item.controller';
import { ProposalController } from '../controllers/proposal.controller';
import { ChatController } from '../controllers/chat.controller';
import { RatingController } from '../controllers/rating.controller';
import { NotificationController } from '../controllers/notification.controller';
import { ReportController } from '../controllers/report.controller';


import { validateDTO } from '../middlewares/validation.middleware';
import { 
  CreateUserDTO, LoginUserDTO, UpdateUserDTO, UpdateUserRoleDTO, 
  CreateItemDTO, UpdateItemDTO, UpdateItemStatusDTO, 
  CreateProposalDTO, UpdateProposalStatusDTO,
  CreateReportDTO, UpdateReportStatusDTO,
  CreateRatingDTO, // Adicionado DTO de Avaliação
  BlockUserDTO // Adicionado DTO de Bloqueio
} from '../dtos';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware';
import { UserRole } from '../types';
import { upload, handleUploadError } from '../config/upload';
import express from 'express';
import path from 'path';

const router = Router();

// Instância dos controllers
const userController = new UserController();
const authController = new AuthController();
const itemController = new ItemController();
const proposalController = new ProposalController();
const chatController = new ChatController();
const ratingController = new RatingController();
const notificationController = new NotificationController();
const reportController = new ReportController();

// ========================================
// ROTA PARA SERVIR IMAGENS
// ========================================
router.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// ========================================
// ROTAS DE AUTENTICAÇÃO (públicas)
// ========================================
router.post('/auth/register', validateDTO(CreateUserDTO), authController.register);
router.post('/auth/login', validateDTO(LoginUserDTO), authController.login);
router.post('/auth/refresh', authController.refresh);
router.post('/auth/logout', authController.logout);
router.get('/auth/me', authMiddleware, authController.getMe);

// ========================================
// ROTAS DE USUÁRIOS
// ========================================
router.get(
  '/users',
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  userController.findAll
);
router.get('/users/:id', userController.findById);
router.put('/users/:id', authMiddleware, validateDTO(UpdateUserDTO), userController.update);
router.delete(
  '/users/:id',
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  userController.delete
);
router.patch(
  '/users/:id/role',
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  validateDTO(UpdateUserRoleDTO),
  userController.updateRole
);

// Verificação de Identidade (P2)
router.patch(
  '/users/:id/verify',
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  userController.verifyUser
);

// Bloqueio de Usuário (P2)
router.patch(
  '/users/:id/block',
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  validateDTO(BlockUserDTO),
  userController.blockUser
);

// ========================================
// ROTAS DE ITENS
// IMPORTANTE: Rotas específicas DEVEM vir ANTES de rotas com parâmetros dinâmicos
// ========================================

// 1️⃣ ROTAS ESPECÍFICAS PRIMEIRO (ordem crítica!)
router.get('/items/categories', itemController.getCategories);
router.get('/items/my', authMiddleware, itemController.findMyItems);

// 2️⃣ ROTA DE LISTAGEM GERAL
router.get('/items', itemController.findAll);

// 3️⃣ ROTAS COM PARÂMETROS POR ÚLTIMO
router.get('/items/:id', itemController.findById);

// 4️⃣ ROTAS DE MODIFICAÇÃO
router.post(
  '/items',
  authMiddleware,
  upload.array('imagens', 5),
  handleUploadError,
  validateDTO(CreateItemDTO),
  itemController.create
);

router.put(
  '/items/:id',
  authMiddleware,
  upload.array('imagens', 5),
  handleUploadError,
  validateDTO(UpdateItemDTO),
  itemController.update
);

router.delete('/items/:id', authMiddleware, itemController.delete);

router.patch(
  '/items/:id/status', 
  authMiddleware, 
  validateDTO(UpdateItemStatusDTO), 
  itemController.updateStatus
);

// ========================================
// ROTAS DE PROPOSTAS
// ========================================
router.post('/proposals', authMiddleware, validateDTO(CreateProposalDTO), proposalController.create);

// Rotas específicas ANTES de rotas com parâmetros
router.get('/proposals/sent', authMiddleware, proposalController.findSent);
router.get('/proposals/received', authMiddleware, proposalController.findReceived);
router.get(
  '/proposals/all',
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  proposalController.findAll
);

// Rotas com parâmetros POR ÚLTIMO
router.get('/proposals/item/:itemId', proposalController.findByItem);
router.patch('/proposals/:id/status', authMiddleware, validateDTO(UpdateProposalStatusDTO), proposalController.updateStatus);
router.delete('/proposals/:id', authMiddleware, proposalController.delete);

// ========================================
// ROTAS DE CHAT
// ========================================
router.post('/chat/messages', authMiddleware, chatController.sendMessage); 
router.get('/chat/conversations', authMiddleware, chatController.getConversations);
router.get('/chat/unread-count', authMiddleware, chatController.getUnreadCount);
router.get('/chat/messages/:otherUserId', authMiddleware, chatController.getMessages);
router.post('/chat/read', authMiddleware, chatController.markAsRead);
router.delete('/chat/conversations/:otherUserId/:itemId', authMiddleware, chatController.deleteConversation);


// ========================================
// ROTAS DE AVALIAÇÃO (RATINGS)
// ========================================
router.post('/ratings', authMiddleware, validateDTO(CreateRatingDTO), ratingController.create);
router.get('/ratings', authMiddleware, roleMiddleware([UserRole.ADMIN]), ratingController.getAll);
router.get('/ratings/:userId', ratingController.getByUserId);

// ========================================
router.get('/notifications', authMiddleware, notificationController.findByUser);
router.patch('/notifications/:id/read', authMiddleware, notificationController.markAsRead);

// ========================================
// ROTAS DE DENÚNCIA (REPORTS)
// ========================================
router.post(
  '/reports',
  authMiddleware,
  validateDTO(CreateReportDTO),
  reportController.create
);
router.get(
  '/reports',
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  reportController.findAll
);
router.get(
  '/reports/:id',
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  reportController.findById
);
router.patch(
  '/reports/:id/status',
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  validateDTO(UpdateReportStatusDTO),
  reportController.updateStatus
);

// ========================================
// ROTAS DE ADMIN (adicionadas aqui)
// ========================================



export default router;
