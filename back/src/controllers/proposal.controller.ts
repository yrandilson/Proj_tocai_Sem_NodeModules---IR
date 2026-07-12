import { Request, Response, NextFunction } from 'express';
import { ProposalService } from '../services/proposal.service';
import { AuthRequest } from '../types';

/**
 * Controller responsável por gerenciar requisições relacionadas a propostas
 */
export class ProposalController {
  private proposalService = new ProposalService();

  /**
   * Cria uma nova proposta
   * POST /api/proposals
   */
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req as AuthRequest;
      const { itemId, mensagem } = req.body;
      const proposal = await this.proposalService.create(itemId, userId!, mensagem);
      res.status(201).json(proposal);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Busca propostas enviadas pelo usuário
   * GET /api/proposals/sent
   */
  findSent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req as AuthRequest;
      const proposals = await this.proposalService.findSentProposals(userId!);
      res.status(200).json(proposals);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Busca propostas recebidas (nos itens do usuário)
   * GET /api/proposals/received
   */
  findReceived = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req as AuthRequest;
      const proposals = await this.proposalService.findReceivedProposals(userId!);
      res.status(200).json(proposals);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Lista todas as propostas (Admin)
   * GET /api/proposals/all
   */
  findAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = {
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
      };
      const result = await this.proposalService.findAll(filters);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Busca propostas de um item específico
   * GET /api/proposals/item/:itemId
   */
  findByItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { itemId } = req.params;
      const proposals = await this.proposalService.findByItem(Number(itemId));
      res.status(200).json(proposals);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Atualiza o status de uma proposta (aceitar/recusar)
   * PATCH /api/proposals/:id/status
   */
  updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { userId } = req as AuthRequest;
      const { status } = req.body;
      const proposal = await this.proposalService.updateStatus(Number(id), status, userId!);
      res.status(200).json(proposal);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Deleta uma proposta
   * DELETE /api/proposals/:id
   */
  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { userId } = req as AuthRequest;
      await this.proposalService.delete(Number(id), userId!);
      res.status(200).json({ message: 'Proposta deletada com sucesso' });
    } catch (error) {
      next(error);
    }
  };
}
