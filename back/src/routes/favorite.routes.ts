import { Router } from 'express';
import { FavoriteController } from '../controllers/favorite.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const favoriteController = new FavoriteController();

// Middleware de autenticação para todas as rotas de favoritos
router.use(authMiddleware);

// Rota para listar os favoritos do usuário logado
router.get('/', favoriteController.listMyFavorites);

// Rotas para adicionar e remover um item específico dos favoritos
router.post('/:itemId', favoriteController.addFavorite); // Já está protegida pelo router.use(authMiddleware)
router.delete('/:itemId', favoriteController.removeFavorite); // Já está protegida pelo router.use(authMiddleware)

export default router;