import { AppDataSource } from '../config/database';
import { Notification } from '../entities/Notification';
import { User } from '../entities/User';
import { NotificationType } from '../types';
import { ChatSocketHandler } from '../websocket/chat.socket';
import { NotFoundError } from '../errors/http-errors';

/**
 * Service para gerenciar notificações
 */
export class NotificationService {
  private notificationRepository = AppDataSource.getRepository(Notification);
  private userRepository = AppDataSource.getRepository(User);
  private socketHandler: ChatSocketHandler | undefined;

  constructor(socketHandler?: ChatSocketHandler) {
    this.socketHandler = socketHandler;
  }

  /**
   * 🔧 CORRIGIDO: Cria uma nova notificação para um usuário.
   */
  async createNotification(
    userId: number,
    type: NotificationType,
    title: string,
    message: string,
    link?: string,
    metadata?: Record<string, any>
  ): Promise<Notification> {
    
	const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundError('Usuário não encontrado para criar notificação.');
    }

    // ✅ CORREÇÃO CRÍTICA: Usar a entidade User COMPLETA, não apenas { id: userId }
    const notification = this.notificationRepository.create({
      user,
      type,
      title,
      message,
      link,
      metadata,
      read: false,
    });

    // Salvar e retornar a notificação salva
    const savedNotification = await this.notificationRepository.save(notification);

    // Envia notificação em tempo real via WebSocket
    if (this.socketHandler) {
      this.socketHandler.sendNotification(userId, 'notification:new', savedNotification);
    }

    return savedNotification;
  }

  /**
   * Busca todas as notificações de um usuário.
   */
  async findByUser(userId: number): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  /**
   * Marca uma notificação como lida.
   */
  async markAsRead(notificationId: number, userId: number): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, user: { id: userId } },
    });

    if (!notification) {
      throw new NotFoundError('Notificação não encontrada ou não pertence ao usuário.');
    }

    notification.read = true;
    return await this.notificationRepository.save(notification);
  }

  // Métodos específicos para tipos de notificação

  async notifyNewProposal(ownerId: number, itemTitle: string, proposerName: string) {
    await this.createNotification(
      ownerId,
      NotificationType.NEW_PROPOSAL,
      'Nova Proposta Recebida',
      `${proposerName} fez uma proposta para seu item "${itemTitle}".`
    );
  }

  async notifyProposalAccepted(proposerId: number, itemTitle: string) {
    await this.createNotification(
      proposerId,
      NotificationType.PROPOSAL_ACCEPTED,
      'Proposta Aceita!',
      `Sua proposta para o item "${itemTitle}" foi aceita.`
    );
  }

  async notifyProposalRejected(proposerId: number, itemTitle: string) {
    await this.createNotification(
      proposerId,
      NotificationType.PROPOSAL_REJECTED,
      'Proposta Recusada',
      `Sua proposta para o item "${itemTitle}" foi recusada.`
    );
  }

  async notifyItemDeleted(ownerId: number, itemTitle: string) {
    await this.createNotification(
      ownerId,
      NotificationType.ITEM_DELETED,
      'Item Deletado',
      `Seu item "${itemTitle}" foi deletado com sucesso.`
    );
  }

  async notifyItemDeletedByAdmin(ownerId: number, itemTitle: string) {
    await this.createNotification(
      ownerId,
      NotificationType.ITEM_DELETED_BY_ADMIN,
      'Item Removido pelo Administrador',
      `Seu item "${itemTitle}" foi removido por violar as regras da plataforma.`
    );
  }

  async notifyMatchFound(userId: number, newItemTitle: string, offeringItemTitle: string) {
    await this.createNotification(
      userId,
      NotificationType.MATCH_FOUND,
      '🎉 Match Encontrado!',
      `Seu item "${offeringItemTitle}" é desejado por alguém que oferece um "${newItemTitle}"!`,
      '/proposals/received'
    );
  }
}