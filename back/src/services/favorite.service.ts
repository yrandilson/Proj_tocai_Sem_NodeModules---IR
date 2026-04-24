import { AppDataSource } from '../config/database';
import { Favorite } from '../entities/Favorite';
import { User } from '../entities/User';
import { Item } from '../entities/Item';
import { NotFoundError, BadRequestError } from '../errors/http-errors';

export class FavoriteService {
  private favoriteRepository = AppDataSource.getRepository(Favorite);
  private userRepository = AppDataSource.getRepository(User);
  private itemRepository = AppDataSource.getRepository(Item);

  /**
   * Adiciona um item aos favoritos de um usuário.
   * @param userId - ID do usuário.
   * @param itemId - ID do item a ser favoritado.
   * @returns A entidade Favorite criada.
   */
  async add(userId: number, itemId: number): Promise<Favorite> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundError('Usuário não encontrado.');
    }

    const item = await this.itemRepository.findOneBy({ id: itemId });
    if (!item) {
      throw new NotFoundError('Item não encontrado.');
    }

    const existingFavorite = await this.favoriteRepository.findOne({
      where: { user: { id: userId }, item: { id: itemId } },
    });

    if (existingFavorite) {
      throw new BadRequestError('Este item já está nos seus favoritos.');
    }

    const favorite = this.favoriteRepository.create({
      user: { id: userId },
      item: { id: itemId },
    });

    return this.favoriteRepository.save(favorite);
  }

  /**
   * Remove um item dos favoritos de um usuário.
   * @param userId - ID do usuário.
   * @param itemId - ID do item a ser removido.
   */
  async remove(userId: number, itemId: number): Promise<void> {
    const favorite = await this.favoriteRepository.findOne({
      where: { user: { id: userId }, item: { id: itemId } },
    });

    if (!favorite) {
      throw new NotFoundError('Item não encontrado nos favoritos.');
    }

    await this.favoriteRepository.remove(favorite);
  }

  /**
   * Lista todos os itens favoritos de um usuário.
   * @param userId - ID do usuário.
   * @returns Uma lista de entidades Favorite, com os itens populados.
   */
  async findByUser(userId: number): Promise<Favorite[]> {
    return this.favoriteRepository.find({
      where: { user: { id: userId } },
      relations: ['item', 'item.owner', 'item.imagens', 'item.tradePreferences'], // Popula o item, o dono do item, as imagens e as preferências de troca do item
      order: {
        createdAt: 'DESC',
      },
    });
  }
}