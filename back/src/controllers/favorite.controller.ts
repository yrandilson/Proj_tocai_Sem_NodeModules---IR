import { Request, Response, NextFunction } from 'express';
import { FavoriteService } from '../services/favorite.service';
import { AuthRequest } from '../types';
import { BadRequestError } from '../errors/http-errors';

export class FavoriteController {
  private favoriteService = new FavoriteService();

  // Adicionar um favorito
  addFavorite = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { itemId: itemIdStr } = req.params;
      const { userId } = req as AuthRequest;

      if (!userId) {
        throw new BadRequestError('Usuário não autenticado.');
      }

      const itemId = Number(itemIdStr);
      if (isNaN(itemId)) {
        throw new BadRequestError('O ID do item deve ser um número.');
      }

      const favorite = await this.favoriteService.add(userId, itemId);
      res.status(201).json(favorite);
    } catch (error) {
      next(error);
    }
  };

  // Remover um favorito
removeFavorite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { itemId: itemIdStr } = req.params;
    const { userId } = req as AuthRequest;

    if (!userId) {
      throw new BadRequestError('Usuário não autenticado.');
    }

    const itemId = Number(itemIdStr);
    if (isNaN(itemId)) {
      throw new BadRequestError('O ID do item deve ser um número.');
    }

    await this.favoriteService.remove(userId, itemId);
    res.status(200).json({ message: 'Favorito removido com sucesso' }); // ← MUDAR de 204
  } catch (error) {
    next(error);
  }
};

  // Listar favoritos do usuário logado
listMyFavorites = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as AuthRequest).userId!;
    const favorites = await this.favoriteService.findByUser(userId);

    // MUDAR: retornar os favoritos completos, não só os items
    res.status(200).json(favorites); // ← ERA: res.status(200).json(items);
  } catch (error) {
    next(error);
  }
};
}