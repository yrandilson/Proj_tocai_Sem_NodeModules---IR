<!-- DOC-META: status=ativo; ultima_revisao=2026-04-10; proxima_revisao=trimestral -->
# ?? GUIA COMPLETO: Criar TrocaAi do Zero - PARTE 2

## Continua��o: Backend - Features Principais

---

## 5. Backend - Features Principais (Items, Proposals, Chat)

### Passo 5.1: Criar `ItemService` (`backend/src/services/item.service.ts`)

Este arquivo j� foi explicado anteriormente. Crie conforme o c�digo no reposit�rio.

### Passo 5.2: Criar `ItemController` (`backend/src/controllers/item.controller.ts`)

```typescript
import { Request, Response } from 'express';
import { ItemService } from '../services/item.service';
import { AuthRequest, ItemFilters } from '../types';

export class ItemController {
  private itemService = new ItemService();

  create = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { userId } = req;
      const { titulo, descricao, categoria, latitude, longitude, cidade, estado, cep, bairro } = req.body;

      if (!userId) {
        res.status(401).json({ error: 'N�o autenticado' });
        return;
      }

      // Pega arquivos do Multer
      const files = (req as any).files as Express.Multer.File[];
      const imagens = files ? files.map(f => f.filename) : [];

      const item = await this.itemService.create(
        titulo,
        descricao,
        categoria,
        userId,
        imagens,
        { latitude, longitude, cidade, estado, cep, bairro }
      );

      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Erro ao criar item'
      });
    }
  };

  findAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const filters: ItemFilters = {
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        category: req.query.category as string,
        search: req.query.search as string,
        status: req.query.status as any
      };

      const result = await this.itemService.findAll(filters);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Erro ao listar items'
      });
    }
  };

  findById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const item = await this.itemService.findById(Number(id));
      res.status(200).json(item);
    } catch (error) {
      res.status(404).json({
        error: error instanceof Error ? error.message : 'Item n�o encontrado'
      });
    }
  };

  findMyItems = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req as AuthRequest;
      if (!userId) {
        res.status(401).json({ error: 'N�o autenticado' });
        return;
      }

      const items = await this.itemService.findByOwner(userId);
      res.status(200).json(items);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Erro ao buscar items'
      });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { userId } = req as AuthRequest;

      if (!userId) {
        res.status(401).json({ error: 'N�o autenticado' });
        return;
      }

      const files = (req as any).files as Express.Multer.File[];
      const novasImagens = files ? files.map(f => f.filename) : undefined;

      const item = await this.itemService.update(Number(id), req.body, userId, novasImagens);
      res.status(200).json(item);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Erro ao atualizar item'
      });
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { userId } = req as AuthRequest;

      if (!userId) {
        res.status(401).json({ error: 'N�o autenticado' });
        return;
      }

      // Busca role do usu�rio para passar ao service
      const authHeader = req.headers.authorization;
      const token = authHeader?.replace('Bearer ', '');
      const jwt = require('jsonwebtoken');
      const { getJwtSecret } = require('../config/jwt');
      const decoded = jwt.verify(token, getJwtSecret());

      await this.itemService.delete(Number(id), userId, decoded.role);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Erro ao deletar item'
      });
    }
  };

  updateStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const { userId } = req as AuthRequest;

      if (!userId) {
        res.status(401).json({ error: 'N�o autenticado' });
        return;
      }

      const item = await this.itemService.updateStatus(Number(id), status, userId);
      res.status(200).json(item);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Erro ao atualizar status'
      });
    }
  };

  getCategories = async (req: Request, res: Response): Promise<void> => {
    try {
      const categories = await this.itemService.getCategories();
      res.status(200).json(categories);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Erro ao buscar categorias'
      });
    }
  };
}
```

### Passo 5.3: Criar `ProposalService` (`backend/src/services/proposal.service.ts`)

```typescript
import { AppDataSource } from '../config/database';
import { Proposal } from '../entities/Proposal';
import { Item } from '../entities/Item';
import { NotificationService } from './notification.service';
import { ProposalStatus, ItemStatus, NotificationType } from '../types';

export class ProposalService {
  private proposalRepository = AppDataSource.getRepository(Proposal);
  private itemRepository = AppDataSource.getRepository(Item);
  private notificationService = new NotificationService();

  async create(itemId: number, proposerId: number, mensagem: string) {
    // Busca item
    const item = await this.itemRepository.findOne({
      where: { id: itemId },
      relations: ['owner']
    });

    if (!item) {
      throw new Error('Item n�o encontrado');
    }

    if (item.status !== ItemStatus.DISPONIVEL) {
      throw new Error('Item n�o est� dispon�vel');
    }

    if (item.ownerId === proposerId) {
      throw new Error('Voc� n�o pode fazer proposta no seu pr�prio item');
    }

    // Cria proposta
    const proposal = this.proposalRepository.create({
      itemId,
      proposerId,
      mensagem,
      status: ProposalStatus.PENDENTE
    });

    await this.proposalRepository.save(proposal);

    // Cria notifica��o para dono do item
    await this.notificationService.create({
      userId: item.ownerId,
      type: NotificationType.NEW_PROPOSAL,
      title: 'Nova Proposta!',
      message: `Voc� recebeu uma proposta para o item "${item.titulo}"`,
      link: `/proposals/received`
    });

    return this.findById(proposal.id);
  }

  async findById(id: number) {
    const proposal = await this.proposalRepository.findOne({
      where: { id },
      relations: ['item', 'item.owner', 'proposer']
    });

    if (!proposal) {
      throw new Error('Proposta n�o encontrada');
    }

    return proposal;
  }

  async findByUser(userId: number) {
    return await this.proposalRepository.find({
      where: { proposerId: userId },
      relations: ['item', 'item.owner'],
      order: { createdAt: 'DESC' }
    });
  }

  async findReceivedByUser(userId: number) {
    return await this.proposalRepository
      .createQueryBuilder('proposal')
      .leftJoinAndSelect('proposal.item', 'item')
      .leftJoinAndSelect('proposal.proposer', 'proposer')
      .where('item.ownerId = :userId', { userId })
      .orderBy('proposal.createdAt', 'DESC')
      .getMany();
  }

  async updateStatus(id: number, status: ProposalStatus, userId: number) {
    const proposal = await this.findById(id);

    // Verifica se usu�rio � dono do item
    if (proposal.item.ownerId !== userId) {
      throw new Error('Apenas o dono do item pode aceitar/recusar propostas');
    }

    proposal.status = status;
    await this.proposalRepository.save(proposal);

    // Se aceita, atualiza item para em_negociacao
    if (status === ProposalStatus.ACEITA) {
      await this.itemRepository.update(proposal.itemId, {
        status: ItemStatus.EM_NEGOCIACAO
      });

      // Notifica proposer
      await this.notificationService.create({
        userId: proposal.proposerId,
        type: NotificationType.PROPOSAL_ACCEPTED,
        title: 'Proposta Aceita!',
        message: `Sua proposta para "${proposal.item.titulo}" foi aceita!`,
        link: `/items/${proposal.itemId}`
      });
    } else if (status === ProposalStatus.RECUSADA) {
      await this.notificationService.create({
        userId: proposal.proposerId,
        type: NotificationType.PROPOSAL_REJECTED,
        title: 'Proposta Recusada',
        message: `Sua proposta para "${proposal.item.titulo}" foi recusada.`,
        link: `/proposals/sent`
      });
    }

    return this.findById(id);
  }

  async delete(id: number, userId: number) {
    const proposal = await this.findById(id);

    if (proposal.proposerId !== userId) {
      throw new Error('Apenas o autor pode deletar a proposta');
    }

    await this.proposalRepository.delete(id);
  }
}
```

### Passo 5.4: Criar `ProposalController` (`backend/src/controllers/proposal.controller.ts`)

```typescript
import { Request, Response } from 'express';
import { ProposalService } from '../services/proposal.service';
import { AuthRequest } from '../types';

export class ProposalController {
  private proposalService = new ProposalService();

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req as AuthRequest;
      const { itemId, mensagem } = req.body;

      if (!userId) {
        res.status(401).json({ error: 'N�o autenticado' });
        return;
      }

      const proposal = await this.proposalService.create(itemId, userId, mensagem);
      res.status(201).json(proposal);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Erro ao criar proposta'
      });
    }
  };

  findSent = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req as AuthRequest;

      if (!userId) {
        res.status(401).json({ error: 'N�o autenticado' });
        return;
      }

      const proposals = await this.proposalService.findByUser(userId);
      res.status(200).json(proposals);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Erro ao buscar propostas'
      });
    }
  };

  findReceived = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req as AuthRequest;

      if (!userId) {
        res.status(401).json({ error: 'N�o autenticado' });
        return;
      }

      const proposals = await this.proposalService.findReceivedByUser(userId);
      res.status(200).json(proposals);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Erro ao buscar propostas'
      });
    }
  };

  updateStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const { userId } = req as AuthRequest;

      if (!userId) {
        res.status(401).json({ error: 'N�o autenticado' });
        return;
      }

      const proposal = await this.proposalService.updateStatus(Number(id), status, userId);
      res.status(200).json(proposal);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Erro ao atualizar proposta'
      });
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { userId } = req as AuthRequest;

      if (!userId) {
        res.status(401).json({ error: 'N�o autenticado' });
        return;
      }

      await this.proposalService.delete(Number(id), userId);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Erro ao deletar proposta'
      });
    }
  };
}
```

### Passo 5.5: Criar `ChatService` (`backend/src/services/chat.service.ts`)

```typescript
import { AppDataSource } from '../config/database';
import { ChatMessage } from '../entities/ChatMessage';
import { NotificationService } from './notification.service';
import { NotificationType } from '../types';

export class ChatService {
  private messageRepository = AppDataSource.getRepository(ChatMessage);
  private notificationService = new NotificationService();

  async createMessage(
    senderId: number,
    receiverId: number,
    itemId: number,
    conteudo: string
  ) {
    const message = this.messageRepository.create({
      senderId,
      receiverId,
      itemId,
      conteudo,
      lida: false
    });

    await this.messageRepository.save(message);

    // Cria notifica��o
    await this.notificationService.create({
      userId: receiverId,
      type: NotificationType.NEW_MESSAGE,
      title: 'Nova Mensagem',
      message: 'Voc� recebeu uma nova mensagem',
      link: `/chat`
    });

    return message;
  }

  async getConversations(userId: number) {
    // Busca todas as mensagens onde userId � sender OU receiver
    const messages = await this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoinAndSelect('message.receiver', 'receiver')
      .leftJoinAndSelect('message.item', 'item')
      .where('message.senderId = :userId OR message.receiverId = :userId', { userId })
      .orderBy('message.createdAt', 'DESC')
      .getMany();

    // Agrupa por (otherUserId, itemId)
    const conversationsMap = new Map<string, any>();

    for (const msg of messages) {
      const otherUserId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      const key = `${otherUserId}-${msg.itemId}`;

      if (!conversationsMap.has(key)) {
        const unreadCount = await this.messageRepository.count({
          where: {
            senderId: otherUserId,
            receiverId: userId,
            itemId: msg.itemId,
            lida: false
          }
        });

        conversationsMap.set(key, {
          otherUserId,
          otherUserName: msg.senderId === userId ? msg.receiver.nome : msg.sender.nome,
          itemId: msg.itemId,
          itemTitle: msg.item.titulo,
          lastMessage: msg.conteudo,
          lastMessageAt: msg.createdAt,
          unreadCount
        });
      }
    }

    return Array.from(conversationsMap.values());
  }

  async getMessages(userId: number, otherUserId: number, itemId: number) {
    return await this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoinAndSelect('message.receiver', 'receiver')
      .where('message.itemId = :itemId', { itemId })
      .andWhere(
        '(message.senderId = :userId AND message.receiverId = :otherUserId) OR (message.senderId = :otherUserId AND message.receiverId = :userId)',
        { userId, otherUserId }
      )
      .orderBy('message.createdAt', 'ASC')
      .getMany();
  }

  async markAsRead(userId: number, otherUserId: number, itemId: number) {
    await this.messageRepository
      .createQueryBuilder()
      .update(ChatMessage)
      .set({ lida: true })
      .where('receiverId = :userId', { userId })
      .andWhere('senderId = :otherUserId', { otherUserId })
      .andWhere('itemId = :itemId', { itemId })
      .andWhere('lida = :lida', { lida: false })
      .execute();
  }

  async countUnread(userId: number) {
    return await this.messageRepository.count({
      where: {
        receiverId: userId,
        lida: false
      }
    });
  }

  async deleteConversation(userId: number, otherUserId: number, itemId: number) {
    await this.messageRepository
      .createQueryBuilder()
      .delete()
      .from(ChatMessage)
      .where('itemId = :itemId', { itemId })
      .andWhere(
        '(senderId = :userId AND receiverId = :otherUserId) OR (senderId = :otherUserId AND receiverId = :userId)',
        { userId, otherUserId }
      )
      .execute();
  }
}
```

### Passo 5.6: Criar `ChatController` (`backend/src/controllers/chat.controller.ts`)

```typescript
import { Request, Response } from 'express';
import { ChatService } from '../services/chat.service';
import { AuthRequest } from '../types';

export class ChatController {
  private chatService = new ChatService();

  getConversations = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req as AuthRequest;

      if (!userId) {
        res.status(401).json({ error: 'N�o autenticado' });
        return;
      }

      const conversations = await this.chatService.getConversations(userId);
      res.status(200).json(conversations);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Erro ao buscar conversas'
      });
    }
  };

  getMessages = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req as AuthRequest;
      const { otherUserId, itemId } = req.params;

      if (!userId) {
        res.status(401).json({ error: 'N�o autenticado' });
        return;
      }

      const messages = await this.chatService.getMessages(
        userId,
        Number(otherUserId),
        Number(itemId)
      );

      res.status(200).json(messages);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Erro ao buscar mensagens'
      });
    }
  };

  markAsRead = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req as AuthRequest;
      const { otherUserId, itemId } = req.body;

      if (!userId) {
        res.status(401).json({ error: 'N�o autenticado' });
        return;
      }

      await this.chatService.markAsRead(userId, otherUserId, itemId);
      res.status(200).json({ message: 'Mensagens marcadas como lidas' });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Erro ao marcar mensagens'
      });
    }
  };

  getUnreadCount = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req as AuthRequest;

      if (!userId) {
        res.status(401).json({ error: 'N�o autenticado' });
        return;
      }

      const count = await this.chatService.countUnread(userId);
      res.status(200).json({ count });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Erro ao contar mensagens'
      });
    }
  };

  deleteConversation = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req as AuthRequest;
      const { otherUserId, itemId } = req.params;

      if (!userId) {
        res.status(401).json({ error: 'N�o autenticado' });
        return;
      }

      await this.chatService.deleteConversation(
        userId,
        Number(otherUserId),
        Number(itemId)
      );

      res.status(200).json({ message: 'Conversa deletada' });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Erro ao deletar conversa'
      });
    }
  };
}
```

### Passo 5.7: Criar Services e Controllers restantes

De forma similar, crie:
- `NotificationService` e `NotificationController`
- `RatingService` e `RatingController`
- `ReportService` e `ReportController`

(Siga o mesmo padr�o dos exemplos acima)

---

## 6. Backend - WebSocket

### Passo 6.1: Criar `ChatSocketHandler` (`backend/src/websocket/chat.socket.ts`)

O c�digo completo j� foi mostrado anteriormente. Use o arquivo do reposit�rio.

---

## 7. Backend - Rotas e Server

### Passo 7.1: Criar `backend/src/routes/index.ts`

```typescript
import { Router } from 'express';
import express from 'express';
import path from 'path';
import { UserController } from '../controllers/user.controller';
import { ItemController } from '../controllers/item.controller';
import { ProposalController } from '../controllers/proposal.controller';
import { ChatController } from '../controllers/chat.controller';
import { RatingController } from '../controllers/rating.controller';
import { NotificationController } from '../controllers/notification.controller';
import { ReportController } from '../controllers/report.controller';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware';
import { validateDTO } from '../middlewares/validation.middleware';
import { upload, handleUploadError } from '../config/upload';
import {
  CreateUserDTO,
  LoginUserDTO,
  UpdateUserDTO,
  UpdateUserRoleDTO,
  CreateItemDTO,
  UpdateItemDTO,
  UpdateItemStatusDTO,
  CreateProposalDTO,
  UpdateProposalStatusDTO,
  CreateRatingDTO,
  CreateReportDTO,
  UpdateReportStatusDTO
} from '../dtos';
import { UserRole } from '../types';

const router = Router();

// Inst�ncias dos controllers
const userController = new UserController();
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
// ROTAS DE AUTENTICA��O
// ========================================
router.post('/auth/register', validateDTO(CreateUserDTO), userController.register);
router.post('/auth/login', validateDTO(LoginUserDTO), userController.login);
router.get('/auth/me', authMiddleware, userController.getMe);

// ========================================
// ROTAS DE USU�RIOS
// ========================================
router.get('/users', authMiddleware, roleMiddleware([UserRole.ADMIN]), userController.findAll);
router.get('/users/:id', userController.findById);
router.put('/users/:id', authMiddleware, validateDTO(UpdateUserDTO), userController.update);
router.delete('/users/:id', authMiddleware, roleMiddleware([UserRole.ADMIN]), userController.delete);
router.patch('/users/:id/role', authMiddleware, roleMiddleware([UserRole.ADMIN]), validateDTO(UpdateUserRoleDTO), userController.updateRole);

// ========================================
// ROTAS DE ITEMS
// ========================================
router.get('/items/categories', itemController.getCategories);
router.get('/items/my', authMiddleware, itemController.findMyItems);
router.get('/items', itemController.findAll);
router.get('/items/:id', itemController.findById);
router.post('/items', authMiddleware, upload.array('imagens', 5), handleUploadError, validateDTO(CreateItemDTO), itemController.create);
router.put('/items/:id', authMiddleware, upload.array('imagens', 5), handleUploadError, validateDTO(UpdateItemDTO), itemController.update);
router.delete('/items/:id', authMiddleware, itemController.delete);
router.patch('/items/:id/status', authMiddleware, validateDTO(UpdateItemStatusDTO), itemController.updateStatus);

// ========================================
// ROTAS DE PROPOSTAS
// ========================================
router.post('/proposals', authMiddleware, validateDTO(CreateProposalDTO), proposalController.create);
router.get('/proposals/sent', authMiddleware, proposalController.findSent);
router.get('/proposals/received', authMiddleware, proposalController.findReceived);
router.patch('/proposals/:id/status', authMiddleware, validateDTO(UpdateProposalStatusDTO), proposalController.updateStatus);
router.delete('/proposals/:id', authMiddleware, proposalController.delete);

// ========================================
// ROTAS DE CHAT
// ========================================
router.get('/chat/conversations', authMiddleware, chatController.getConversations);
router.get('/chat/unread-count', authMiddleware, chatController.getUnreadCount);
router.get('/chat/messages/:otherUserId/:itemId', authMiddleware, chatController.getMessages);
router.post('/chat/read', authMiddleware, chatController.markAsRead);
router.delete('/chat/conversation/:otherUserId/:itemId', authMiddleware, chatController.deleteConversation);

// ========================================
// ROTAS DE AVALIA��ES
// ========================================
router.post('/ratings', authMiddleware, validateDTO(CreateRatingDTO), ratingController.create);
router.get('/ratings/user/:userId', ratingController.findByUser);

// ========================================
// ROTAS DE NOTIFICA��ES
// ========================================
router.get('/notifications', authMiddleware, notificationController.findByUser);
router.patch('/notifications/:id/read', authMiddleware, notificationController.markAsRead);

// ========================================
// ROTAS DE DEN�NCIAS
// ========================================
router.post('/reports', authMiddleware, validateDTO(CreateReportDTO), reportController.create);
router.get('/reports', authMiddleware, roleMiddleware([UserRole.ADMIN]), reportController.findAll);
router.patch('/reports/:id/status', authMiddleware, roleMiddleware([UserRole.ADMIN]), validateDTO(UpdateReportStatusDTO), reportController.updateStatus);

export default router;
```

### Passo 7.2: Criar `backend/src/server.ts`

```typescript
import 'reflect-metadata';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { initializeDatabase } from './config/database';
import routes from './routes';
import { ChatSocketHandler } from './websocket/chat.socket';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = Number(process.env.PORT) || 3000;

// Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: true,
    credentials: true
  }
});

// Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Rotas
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api', routes);

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Rota n�o encontrada', path: req.path });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('? Erro n�o tratado:', err);
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Inicializa WebSocket
ChatSocketHandler.getInstance(io);

// Inicia servidor
const startServer = async () => {
  try {
    await initializeDatabase();
    const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
    httpServer.listen(PORT, host, () => {
      console.log('??????????????????????????????????????');
      console.log(`?? Servidor HTTP/WebSocket rodando na porta ${PORT}`);
      console.log(`?? API dispon�vel em: http://${host}:${PORT}`);
      console.log('??????????????????????????????????????');
    });
  } catch (error) {
    console.error('? Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

startServer();

process.on('SIGINT', () => {
  console.log('\n?? Encerrando servidor...');
  process.exit(0);
});
process.on('SIGTERM', () => {
  console.log('\n?? Encerrando servidor...');
  process.exit(0);
});
```

---

**Backend completo! ?**

Pr�ximo: Frontend (Parte 3)




