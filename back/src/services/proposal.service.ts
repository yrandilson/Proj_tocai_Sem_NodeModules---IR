import { AppDataSource } from '../config/database';
import { Proposal } from '../entities/Proposal';
import { Item } from '../entities/Item';
import { User } from '../entities/User';
import { ProposalStatus, ItemStatus } from '../types';
import { ChatService } from './chat.service';
import { ChatSocketHandler } from '../websocket/chat.socket';
import { NotificationService } from './notification.service';
import { PaginatedResponse } from '../types';
import { BadRequestError, ForbiddenError, NotFoundError } from '../errors/http-errors';
import logger from '../config/logger';

export class ProposalService {
  private proposalRepository = AppDataSource.getRepository(Proposal);
  private itemRepository = AppDataSource.getRepository(Item);
  private userRepository = AppDataSource.getRepository(User);
  private _chatService: ChatService | undefined;
  private _notificationService: NotificationService | undefined;
  private _socketHandler: ChatSocketHandler | undefined;

  // Usamos getters para inicializar os serviços na primeira vez que são acessados.
  private get chatService(): ChatService {
    if (!this._chatService) this._chatService = new ChatService();
    return this._chatService;
  }
  
  private get notificationService(): NotificationService {
    if (!this._notificationService) this._notificationService = new NotificationService(this.socketHandler);
    return this._notificationService;
  }

  private get socketHandler(): ChatSocketHandler | undefined {
    if (!this._socketHandler) this._socketHandler = ChatSocketHandler.getInstance();
    return this._socketHandler;
  }

  async create(
    itemId: number,
    proposerId: number,
    mensagem: string
  ): Promise<Proposal> {
    // 👇 VALIDAÇÃO DA MENSAGEM
    if (!mensagem || mensagem.length < 10) {
      throw new BadRequestError('A mensagem deve ter pelo menos 10 caracteres.');
    }

    // 👇 BUSCAR ITEM COM RELAÇÕES
    const item = await this.itemRepository.findOne({ 
      where: { id: itemId },
      relations: ['owner']
    });
    
    if (!item) {
      throw new NotFoundError('Item não encontrado.');
    }

    // 👇 CORREÇÃO: Verificar se item foi deletado (soft delete)
    if (item.deletedAt !== null) {
      throw new BadRequestError('Este item não está mais disponível.');
    }

    // 👇 VALIDAÇÃO: Não pode propor para próprio item
    if (item.ownerId === proposerId) {
      throw new BadRequestError('Você não pode fazer uma proposta para seu próprio item.');
    }

    // 👇 CORREÇÃO: Verificar status ANTES de qualquer operação
    if (item.status === ItemStatus.TROCADO) {
      throw new BadRequestError('Este item já foi trocado.');
    }

    // 👇 BUSCAR PROPOSER
    const proposer = await this.userRepository.findOne({ where: { id: proposerId } });
    if (!proposer) {
      throw new NotFoundError('Usuário proponente não encontrado.');
    }

    // 👇 Só mudar status se estiver DISPONIVEL
    if (item.status === ItemStatus.DISPONIVEL) {
      item.status = ItemStatus.EM_NEGOCIACAO;
      await this.itemRepository.save(item);
    }

    // 👇 CRIAR PROPOSTA
    const proposal = this.proposalRepository.create({
      itemId,
      proposerId,
      mensagem,
      status: ProposalStatus.PENDENTE
    });
    await this.proposalRepository.save(proposal);

    // 👇 NOTIFICAÇÕES
    await this.notificationService.notifyNewProposal(item.ownerId, item.titulo, proposer.nome);

    this.socketHandler?.sendNotification(item.ownerId, 'proposal:new', {
      message: `Você recebeu uma nova proposta para "${item.titulo}"`,
      proposalId: proposal.id,
    });

    return await this.findById(proposal.id);
  }

  /**
   * Lista todas as propostas com paginação (Admin)
   */
  async findAll(filters: { page?: number, limit?: number }): Promise<PaginatedResponse<Proposal>> {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const [proposals, total] = await this.proposalRepository.findAndCount({
      relations: ['proposer', 'item', 'item.owner'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data: proposals,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: number): Promise<Proposal> {
    const proposal = await this.proposalRepository.findOne({
      where: { id },
      relations: ['proposer', 'item', 'item.owner', 'ratings', 'ratings.fromUser', 'ratings.toUser'],
    });
    if (!proposal) {
      throw new NotFoundError('Proposta não encontrada');
    }
    return proposal;
  }
  
  /**
   * Busca propostas de um item específico
   * @param itemId O ID do item
   */
  async findByItem(itemId: number): Promise<Proposal[]> {
    const proposals = await this.proposalRepository.find({
      where: { itemId: itemId },
      relations: ['proposer', 'item'],
      order: { createdAt: 'DESC' },
    });

    return proposals;
  }

  async updateStatus(
    id: number,
    status: ProposalStatus,
    userId: number
  ): Promise<Proposal> {
    const proposal = await this.findById(id);
    if (proposal.item.ownerId !== userId) {
      throw new ForbiddenError('Você não tem permissão para alterar esta proposta.');
    }
    if (proposal.status !== ProposalStatus.PENDENTE) {
      throw new BadRequestError('Esta proposta já foi respondida.');
    }

    // Usar uma transação para garantir a consistência dos dados
    return await AppDataSource.transaction(async (transactionalEntityManager) => {
      proposal.status = status;
      await transactionalEntityManager.save(proposal);

      const item = await transactionalEntityManager.findOneBy(Item, { id: proposal.itemId });
      if (!item) throw new NotFoundError('Item da proposta não encontrado');

      if (status === ProposalStatus.ACEITA) {
        item.status = ItemStatus.TROCADO;
        
        const welcomeMessage = `Olá! Sua proposta para o item "${item.titulo}" foi aceita. Podemos combinar os detalhes da troca por aqui.`;
        await this.chatService.createMessage(userId, proposal.proposerId, item.id, welcomeMessage);

        await this.notificationService.notifyProposalAccepted(proposal.proposerId, item.titulo);
        
        this.socketHandler?.sendNotification(proposal.proposerId, 'proposal:accepted', {
          message: `Sua proposta para "${item.titulo}" foi aceita!`,
          itemId: item.id,
        });

        await this.rejectOtherProposals(transactionalEntityManager, proposal.itemId, proposal.id);
      } else if (status === ProposalStatus.RECUSADA) {
        const pendingProposals = await transactionalEntityManager.count(Proposal, {
          where: { itemId: proposal.itemId, status: ProposalStatus.PENDENTE }
        });

        if (pendingProposals === 0) {
          item.status = ItemStatus.DISPONIVEL;
        }
        
        await this.notificationService.notifyProposalRejected(proposal.proposerId, item.titulo);
        
        this.socketHandler?.sendNotification(proposal.proposerId, 'proposal:rejected', {
          message: `Sua proposta para "${item.titulo}" foi recusada.`,
          itemId: item.id,
        });
      }
      
      await transactionalEntityManager.save(item);
      
      // Recarrega a proposta com todas as relações para o retorno
      return await transactionalEntityManager.findOneOrFail(Proposal, {
        where: { id: proposal.id },
        relations: ['proposer', 'item', 'item.owner', 'ratings', 'ratings.fromUser', 'ratings.toUser'],
      });
    });
  }
  
  async findSentProposals(userId: number): Promise<Proposal[]> {
    return this.proposalRepository.find({
      where: { proposerId: userId },
      relations: ['item', 'item.owner', 'proposer', 'ratings', 'ratings.fromUser', 'ratings.toUser'],
      order: { createdAt: 'DESC' }
    });
  }

  async findReceivedProposals(userId: number) {
    return this.proposalRepository.find({
      where: { item: { ownerId: userId } },
      relations: ['item', 'item.owner', 'proposer', 'ratings', 'ratings.fromUser', 'ratings.toUser'],
      order: { createdAt: 'DESC' }
    });
  }

  private async rejectOtherProposals(transactionalEntityManager: any, itemId: number, acceptedProposalId: number): Promise<void> {
    const proposalRepo = transactionalEntityManager.getRepository(Proposal);
    const otherProposals = await proposalRepo.find({
      where: { itemId, status: ProposalStatus.PENDENTE },
      relations: ['item'], // carrega item para acessar item.titulo no socket
    });
    
    for (const p of otherProposals) {
      if (p.id !== acceptedProposalId) {
        p.status = ProposalStatus.RECUSADA;
        await proposalRepo.save(p);
        const itemTitulo = p.item?.titulo ?? 'item';
        this.socketHandler?.sendNotification(p.proposerId, 'proposal:rejected', {
          message: `Uma outra proposta para "${itemTitulo}" foi aceita.`,
          itemId: p.itemId,
        });
      }
    }
  }
  
  async delete(id: number, userId: number): Promise<void> {
    const proposal = await this.findById(id);
    if (proposal.proposerId !== userId) {
      throw new ForbiddenError('Você não tem permissão para deletar esta proposta.');
    }
    await this.proposalRepository.remove(proposal);
  }
}