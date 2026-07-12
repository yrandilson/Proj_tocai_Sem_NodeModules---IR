import { AppDataSource } from '../config/database';
import { Rating } from '../entities/Rating';
import { User } from '../entities/User';
import { Proposal } from '../entities/Proposal';
import { BadRequestError, NotFoundError } from '../errors/http-errors';
import { ProposalStatus } from '../types';

export class RatingService {
  private ratingRepository = AppDataSource.getRepository(Rating);
  private userRepository = AppDataSource.getRepository(User);
  private proposalRepository = AppDataSource.getRepository(Proposal);

  /**
   * Cria uma nova avaliação para um usuário após uma troca.
   * @param fromUserId - ID do usuário que está avaliando.
   * @param toUserId - ID do usuário que está sendo avaliado.
   * @param proposalId - ID da proposta que originou a troca.
   * @param value - A nota da avaliaçao (ex: 1 a 5).
   * @param comment - O comentário da avaliação.
   */
  async create(
    fromUserId: number, 
    toUserId: number, 
    proposalId: number, 
    value: number, 
    comment: string,
    itemConformeDescricao?: boolean,
    comunicacaoClara?: boolean,
    prazoCumprido?: boolean,
    recomendariaUsuario?: boolean
  ) {
    // 👇 VALIDAÇÕES BÁSICAS
    if (fromUserId === toUserId) {
      throw new BadRequestError('Você não pode avaliar a si mesmo.');
    }

    // 👇 VALIDAR USUÁRIOS EXISTEM
    const fromUser = await this.userRepository.findOneBy({ id: fromUserId });
    const toUser = await this.userRepository.findOneBy({ id: toUserId });
    if (!fromUser || !toUser) {
      throw new NotFoundError('Usuário não encontrado.');
    }

    // 👇 BUSCAR PROPOSTA ACEITA COM RELAÇÕES
    const proposal = await this.proposalRepository.findOne({
      where: { id: proposalId },
      relations: ['proposer', 'item', 'item.owner'],
    });

    if (!proposal) {
      throw new NotFoundError('Proposta não encontrada.');
    }

    // 👇 CORREÇÃO: Verificar se proposta foi ACEITA
    if (proposal.status !== ProposalStatus.ACEITA) {
      throw new BadRequestError('Você só pode avaliar uma proposta que foi aceita.');
    }

    // 👇 VERIFICAR SE JÁ AVALIOU ESTA PROPOSTA
    const existingRating = await this.ratingRepository.findOne({
      where: { 
        proposal: { id: proposalId }, 
        fromUser: { id: fromUserId } 
      }
    });
    
    if (existingRating) {
      throw new BadRequestError('Você já avaliou esta proposta.');
    }

    // 👇 VALIDAR SE FAZ PARTE DA TROCA
    const isProposer = proposal.proposer.id === fromUserId;
    const isOwner = proposal.item.owner.id === fromUserId;
    
    // Verifica se o avaliador faz parte da proposta
    if (!isProposer && !isOwner) {
      throw new BadRequestError('Você não faz parte desta troca.');
    }

    // 👇 VALIDAR SE ESTÁ AVALIANDO A PESSOA CORRETA
    const isEvaluatingCorrectPerson = 
      (isProposer && toUserId === proposal.item.owner.id) || 
      (isOwner && toUserId === proposal.proposer.id);

    if (!isEvaluatingCorrectPerson) {
      throw new BadRequestError('Você só pode avaliar o outro participante desta troca.');
    }

    // CRIAR E SALVAR AVALIAÇÃO
    const rating = this.ratingRepository.create({
      value,
      comment,
      fromUser,
      toUser,
      proposal,
      itemConformeDescricao,
      comunicacaoClara,
      prazoCumprido,
      recomendariaUsuario,
    });

    const saved = await this.ratingRepository.save(rating);

    // Recarrega com relações para retornar objeto completo ao controller
    const fullRating = await this.ratingRepository.findOne({
      where: { id: saved.id },
      relations: ['fromUser', 'toUser', 'proposal'],
    });

    return fullRating!;
  }

  /**
   * Busca todas as avaliações recebidas por um usuário.
   * @param userId - O ID do usuário.
   */
  async findByUserId(userId: number) {
    return this.ratingRepository.find({
      where: { toUser: { id: userId } },
      relations: ['fromUser'], // Inclui os dados de quem avaliou
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Busca todas as avaliações do sistema (para admin).
   */
  async findAll() {
    return this.ratingRepository.find({
      relations: {
        fromUser: true,
        toUser: true,
        proposal: { proposer: true }, // Inclui a proposta e o usuário que a fez
      },
      order: { createdAt: 'DESC' },
    });
  }
}