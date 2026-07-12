import { Request, Response, NextFunction } from 'express';
import { RatingService } from '../services/rating.service';
import { AuthRequest } from '../types';
import { BadRequestError } from '../errors/http-errors';

export class RatingController {
  private ratingService = new RatingService();

  public create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const fromUserId = (req as AuthRequest).user!.id;
      const { 
        toUserId, 
        proposalId, 
        value,
        comment, 
        itemConformeDescricao, 
        comunicacaoClara, 
        prazoCumprido, 
        recomendariaUsuario 
      } = req.body;
      
      // Validação básica para garantir que os campos obrigatórios estão presentes.
      // A validação completa é feita pelo DTO e class-validator.
      if (!toUserId || !proposalId || value === undefined || value === null) {
        throw new BadRequestError('Campos obrigatórios ausentes: toUserId, proposalId, value');
      }

      const rating = await this.ratingService.create(
        fromUserId,
        toUserId,
        proposalId,
        value,
        comment,
        itemConformeDescricao, 
        comunicacaoClara, 
        prazoCumprido, 
        recomendariaUsuario
      );

      if (!rating) {
        throw new Error('Falha ao recuperar a avaliação após a criação.');
      }

      console.log('✅ Controller - Avaliação criada:', rating.id);

      res.status(201).json(rating);
    } catch (error) {
      console.error('❌ Erro ao criar avaliação:', error);
      next(error);
    }
  };

  public getByUserId = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const numericId = parseInt(req.params.userId, 10);
      if (isNaN(numericId)) {
        throw new BadRequestError('O ID do usuário deve ser um número.');
      }
      const ratings = await this.ratingService.findByUserId(numericId);
      res.status(200).json(ratings);
    } catch (error) {
      next(error);
    }
  };

  public getAll = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      console.log('🔍 AdminController - getAll: Buscando todas as avaliações...');
      const ratings = await this.ratingService.findAll();
      res.status(200).json(ratings);
    } catch (error) {
      next(error);
    }
  };
}