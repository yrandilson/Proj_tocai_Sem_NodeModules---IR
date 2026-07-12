// backend/src/controllers/chat.controller.ts
import { Request, Response, NextFunction } from 'express';
import { ChatService } from '../services/chat.service';
import { AuthRequest } from '../types';
import { BadRequestError } from '../errors/http-errors';

export class ChatController {
  private chatService = new ChatService();

  /**
   * Envia uma nova mensagem
   * POST /api/chat/messages
   */
  sendMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req as AuthRequest;
      const { receiverId, itemId, content } = req.body;

      if (!receiverId || !itemId || !content) {
        throw new BadRequestError('receiverId, itemId e content são obrigatórios');
      }

      const message = await this.chatService.createMessage(
        userId!,
        Number(receiverId),
        Number(itemId),
        content
      );

      res.status(201).json(message);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Busca todas as conversas do usuário
   * GET /api/chat/conversations
   */
  getConversations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req as AuthRequest;
      const conversations = await this.chatService.getConversations(userId!);
      res.status(200).json(conversations);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Busca mensagens de uma conversa específica
   * GET /api/chat/messages/:otherUserId/:itemId
   */
  getMessages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req as AuthRequest;
      const { otherUserId, itemId } = req.params;

      const numericOtherUserId = Number(otherUserId);
      if (isNaN(numericOtherUserId)) {
        throw new BadRequestError('ID do outro usuário inválido.');
      }

      const numericItemId = itemId ? Number(itemId) : undefined;
      if (itemId && isNaN(numericItemId!)) {
        throw new BadRequestError('ID do item inválido.');
      }

      const messages = await this.chatService.getMessages(userId!, numericOtherUserId, numericItemId);
      res.status(200).json(messages);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Marca mensagens como lidas
   * POST /api/chat/read
   */
  markAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req as AuthRequest;
      const { otherUserId } = req.body;
      await this.chatService.markAsRead(userId!, otherUserId);
      res.status(200).json({ message: 'Mensagens marcadas como lidas' });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Conta mensagens não lidas
   * GET /api/chat/unread-count
   */
  getUnreadCount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req as AuthRequest;
      const count = await this.chatService.countUnread(userId!);
      res.status(200).json({ count });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Deleta uma conversa
   * DELETE /api/chat/conversation/:otherUserId/:itemId
   */
  deleteConversation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req as AuthRequest;
      const { otherUserId, itemId } = req.params;

      await this.chatService.deleteConversation(
        userId!,
        Number(otherUserId),
        Number(itemId)
      );

      res.status(200).json({ message: 'Conversa deletada com sucesso' });
    } catch (error) {
      next(error);
    }
  };
}
