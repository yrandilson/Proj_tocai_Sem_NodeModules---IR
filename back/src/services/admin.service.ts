import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { Item } from '../entities/Item';
import { Proposal } from '../entities/Proposal';
import { ChatMessage } from '../entities/ChatMessage';
import { Notification } from '../entities/Notification';
import { ItemStatus, ProposalStatus, NotificationType } from '../types';
import { In, MoreThanOrEqual, IsNull } from 'typeorm';

export class AdminService {
  private userRepository = AppDataSource.getRepository(User);
  private itemRepository = AppDataSource.getRepository(Item);
  private proposalRepository = AppDataSource.getRepository(Proposal);
  private messageRepository = AppDataSource.getRepository(ChatMessage);
  private notificationRepository = AppDataSource.getRepository(Notification);

  async getDashboardStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Garante que é o início da semana (domingo)

    const [
      totalUsers,
      newUsersThisMonth,
      totalItems,
      itemsThisMonth, // Adicionado para contagem
      itemsDisponiveis,
      itemsTrocados,
      totalProposals,
      acceptedProposals,
      totalMessages,
      messagesToday,
      activeUsers,
    ] = await Promise.all([
      // User stats
      this.userRepository.count({ where: { deletedAt: IsNull() } }),
      this.userRepository.count({ where: { createdAt: MoreThanOrEqual(startOfMonth), deletedAt: IsNull() } }),
      // Item stats
      this.itemRepository.count(),
      this.itemRepository.count({ where: { createdAt: MoreThanOrEqual(startOfMonth) } }),
      this.itemRepository.count({ where: { status: ItemStatus.DISPONIVEL } }),
      this.itemRepository.count({ where: { status: ItemStatus.TROCADO } }),
      // Proposal stats
      this.proposalRepository.count(),
      this.proposalRepository.count({ where: { status: ProposalStatus.ACEITA } }),
      // Message stats
      this.messageRepository.count({ where: { deletedAt: IsNull() } }),
      this.messageRepository.count({ where: { createdAt: MoreThanOrEqual(today), deletedAt: IsNull() } }),
      // Active Users (e.g., performed action in last 7 days)
      this.userRepository.createQueryBuilder("user")
        .where("user.updatedAt >= :date", { date: startOfWeek })
        .getCount(),
    ]);

    const acceptanceRate = totalProposals > 0 ? (acceptedProposals / totalProposals) * 100 : 0;

    // O cálculo da média pode permanecer aqui, pois depende de um valor já buscado.
    const daysSinceStart = Math.ceil((new Date().getTime() - new Date(2023, 0, 1).getTime()) / (1000 * 60 * 60 * 24));
    const averageMessagesPerDay = totalMessages > 0 && daysSinceStart > 0 ? totalMessages / daysSinceStart : 0;

    return {
      totalUsers,
      newUsersThisMonth,
      activeUsers,
      totalItems,
      itemsThisMonth,
      itemsDisponiveis,
      itemsTrocados,
      totalProposals,
      acceptanceRate: parseFloat(acceptanceRate.toFixed(1)),
      totalMessages,
      messagesToday,
      averageMessagesPerDay: parseFloat(averageMessagesPerDay.toFixed(1)),
    };
  }

  async getTopCategories() {
    const topCategories = await this.itemRepository.createQueryBuilder("item")
      .select("item.categoria", "categoria")
      .addSelect("COUNT(item.id)", "count")
      .groupBy("item.categoria")
      .orderBy("count", "DESC")
      .limit(5)
      .getRawMany();

    // Adicionar um 'trend' simulado por enquanto, pois o cálculo real é complexo
    return topCategories.map((cat, index) => ({
      name: cat.categoria,
      count: parseInt(cat.count, 10),
      trend: [15, 8, -3, 12, 5][index] || 0, // Valores simulados
    }));
  }

  async getRecentActivity() {
    // Busca as 5 notificações mais recentes que representam ações de usuários,
    // como novas propostas, em vez de notificações de status.
    const activityTypes = [
      NotificationType.NEW_PROPOSAL,
      NotificationType.PROPOSAL_ACCEPTED,
      NotificationType.MATCH_FOUND, // CORREÇÃO: Inclui "matches" na atividade recente
      // Adicionados para um log de atividades completo
      NotificationType.ITEM_CREATED,
      NotificationType.ITEM_UPDATED,
      NotificationType.USER_REGISTERED,
    ];
    const recentNotifications = await this.notificationRepository.find({
      where: { type: In(activityTypes) },
      order: { createdAt: 'DESC' },
      take: 5,
      relations: { user: true }, // Garante que a relação com o usuário seja sempre carregada
    });

    // Mapear para um formato mais amigável para o frontend
    return recentNotifications.map(notif => {
      let icon = '🔔'; // Default icon
      let action = notif.message; // Use a mensagem da notificação
      let user = notif.user ? notif.user.nome : 'Usuário';

      // Inferir o ícone pelo tipo da notificação para maior precisão
      if (notif.type === NotificationType.NEW_PROPOSAL) {
        icon = '📨';
        action = `fez uma proposta para um item.`; // Mensagem padronizada
      } else if (notif.type === NotificationType.PROPOSAL_ACCEPTED) {
        icon = '🤝';
        action = `concluiu uma troca.`; // Mensagem padronizada
      } else if (notif.type === NotificationType.MATCH_FOUND) {
        icon = '🎯';
        action = `recebeu uma notificação de "match" para o item "${notif.title}".`;
      } else if (notif.type === NotificationType.ITEM_CREATED) {
        icon = '✨';
        action = `cadastrou um novo item.`;
      } else if (notif.type === NotificationType.ITEM_UPDATED) {
        icon = '📝';
        action = `atualizou o item "${notif.title}".`;
      } else if (notif.type === NotificationType.USER_REGISTERED) {
        icon = '👤';
        action = `registrou-se na plataforma.`;
      }

      return {
        type: 'notification', // Ou inferir um tipo mais específico
        user: user,
        action: action,
        time: this.formatTimeAgo(notif.createdAt),
        icon: icon,
      };
    });
  }

  async getGrowthData() {
    // Dados simulados para o gráfico de crescimento
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set'];
    return months.map((month, index) => ({
      month,
      users: 20 + index * 15,
      items: 30 + index * 20,
      proposals: 15 + index * 10
    }));
  }

  private formatTimeAgo(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds} seg atrás`; // Mantido
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min atrás`; // Mantido
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} horas atrás`;
    const days = Math.floor(hours / 24);
    return days === 1 ? `1 dia atrás` : `${days} dias atrás`;
  }
}
