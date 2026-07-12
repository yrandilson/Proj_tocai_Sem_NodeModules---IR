import { AppDataSource } from '../config/database';
import { Item } from '../entities/Item';
import { Image } from '../entities/image.entity';
import { TradePreference } from '../entities/TradePreference';
import { User } from '../entities/User';
import { Favorite } from '../entities/Favorite';
import { ItemStatus, ItemFilters, PaginatedResponse, UserRole, NotificationType } from '../types';
import { IsNull } from 'typeorm';
import { NotificationService } from './notification.service';
import { BadRequestError, ForbiddenError, NotFoundError } from '../errors/http-errors';
import logger from '../config/logger';

/**
 * Service responsável pela lógica de negócio relacionada a itens
 */
export class ItemService {
  private itemRepository = AppDataSource.getRepository(Item);
  private preferenceRepository = AppDataSource.getRepository(TradePreference);
  private imageRepository = AppDataSource.getRepository(Image);
  private userRepository = AppDataSource.getRepository(User);
  private favoriteRepository = AppDataSource.getRepository(Favorite);
  private notificationService = new NotificationService();

  /**
   * Cria um novo item
   */
  async create(
    titulo: string,
    descricao: string,
    categoria: string,
    ownerId: number,
    imagens?: string[],
    localizacao?: { cidade?: string; estado?: string; latitude?: number; longitude?: number; cep?: string; bairro?: string },
    preferredItemTitles?: string[]
  ): Promise<Item> {
    if (!titulo || titulo.length < 3) {
      throw new BadRequestError('O título deve ter pelo menos 3 caracteres.');
    }
    if (!descricao || descricao.length < 10) {
      throw new BadRequestError('A descrição deve ter pelo menos 10 caracteres.');
    }
    if (!categoria) {
      throw new BadRequestError('A categoria é obrigatória.');
    }

    logger.info(`[ItemService] Criando item "${titulo}" para owner ${ownerId}`);

    const item = this.itemRepository.create({
      titulo,
      descricao,
      categoria,
      ownerId,
      status: ItemStatus.DISPONIVEL,
      ...localizacao,
    });

    await this.itemRepository.save(item);

    if (!item.id) {
      throw new Error('Erro crítico: Item foi salvo mas não recebeu um ID!');
    }

    logger.debug(`[ItemService] Item salvo com ID: ${item.id}`);

    if (imagens && imagens.length > 0) {
      const imageEntities = imagens.map(url => this.imageRepository.create({ url, itemId: item.id }));
      await this.imageRepository.save(imageEntities);
      logger.debug(`[ItemService] ${imageEntities.length} imagem(ns) salva(s) para item ${item.id}`);
    }

    if (preferredItemTitles && preferredItemTitles.length > 0) {
      const preferenceEntities = preferredItemTitles.map(title =>
        this.preferenceRepository.create({ titulo: title, itemId: item.id })
      );
      await this.preferenceRepository.save(preferenceEntities);
      logger.debug(`[ItemService] ${preferenceEntities.length} preferência(s) salva(s) para item ${item.id}`);
    }

    const savedItem = await this.itemRepository.findOne({
      where: { id: item.id },
      relations: ['owner', 'tradePreferences', 'imagens'],
    });

    if (!savedItem) {
      throw new Error('Erro ao recarregar o item após criação');
    }

    // Notifica o admin
    try {
      const adminUser = await this.userRepository.findOne({ where: { role: UserRole.ADMIN } });
      if (adminUser) {
        await this.notificationService.createNotification(
          adminUser.id,
          NotificationType.ITEM_CREATED,
          savedItem.titulo,
          `Novo item "${savedItem.titulo}" cadastrado por ${savedItem.ownerId}.`
        );
      }
    } catch (err) {
      logger.warn(`[ItemService] Erro ao notificar admin sobre novo item: ${(err as Error).message}`);
    }

    // Dispara a busca por matches de forma assíncrona (não bloqueia a resposta)
    setImmediate(() => {
      this.findMatchesAndNotify(savedItem).catch(err => {
        logger.error(`[Matchmaking] Erro ao processar matches para item ${savedItem.id}: ${(err as Error).message}`);
      });
    });

    return savedItem;
  }

  /**
   * Encontra usuários que desejam o item recém-criado e os notifica.
   */
  private async findMatchesAndNotify(newItem: Item): Promise<void> {
    if (!newItem.titulo || !newItem.id) {
      logger.warn('[Matchmaking] Item inválido recebido — falta título ou ID');
      return;
    }

    logger.info(`[Matchmaking] Buscando matches para item "${newItem.titulo}" (ID: ${newItem.id})`);

    try {
      const offeringItems = await this.itemRepository
        .createQueryBuilder('item')
        .innerJoinAndSelect('item.tradePreferences', 'preference')
        .innerJoinAndSelect('item.owner', 'owner')
        .where('preference.titulo = :newItemTitle', { newItemTitle: newItem.titulo })
        .andWhere('item.deletedAt IS NULL')
        .andWhere('item.status = :status', { status: ItemStatus.DISPONIVEL })
        .getMany();

      logger.info(`[Matchmaking] ${offeringItems.length} match(es) encontrado(s) para "${newItem.titulo}"`);

      for (const offeringItem of offeringItems) {
        if (offeringItem.ownerId === newItem.ownerId) continue;

        const isBidirectionalMatch = newItem.tradePreferences?.some(
          (pref: TradePreference) => pref.titulo === offeringItem.titulo
        );

        const notificationTitle = isBidirectionalMatch
          ? '✨ Match Perfeito Encontrado! ✨'
          : '🎉 Match Encontrado!';

        const notificationMessage = isBidirectionalMatch
          ? `Seu item "${offeringItem.titulo}" é desejado por alguém que oferece um "${newItem.titulo}", e ele também deseja o seu item!`
          : `Seu item "${offeringItem.titulo}" é desejado por alguém que oferece um "${newItem.titulo}"!`;

        try {
          await this.notificationService.createNotification(
            offeringItem.ownerId,
            NotificationType.MATCH_FOUND,
            notificationTitle,
            notificationMessage,
            `/items/${newItem.id}`,
            { itemId: newItem.id, isBidirectional: isBidirectionalMatch }
          );

          if (isBidirectionalMatch) {
            await this.notificationService.createNotification(
              newItem.ownerId,
              NotificationType.MATCH_FOUND,
              notificationTitle,
              `Seu item "${newItem.titulo}" é desejado por alguém que oferece um "${offeringItem.titulo}"!`,
              `/items/${offeringItem.id}`,
              { itemId: offeringItem.id, isBidirectional: true }
            );
          }
        } catch (notifErr) {
          logger.error(`[Matchmaking] Erro ao notificar usuário ${offeringItem.ownerId}: ${(notifErr as Error).message}`);
        }
      }
    } catch (err) {
      logger.error(`[Matchmaking] Erro crítico na busca de matches: ${(err as Error).message}`);
      throw err;
    }
  }

  /**
   * Notifica usuários que favoritaram um item quando ele volta a ficar disponível
   */
  private async notifyFavoritedUsers(item: Item): Promise<void> {
    try {
      const favorites = await this.favoriteRepository.find({
        where: { item: { id: item.id } },
        relations: ['user', 'item'],
      });

      for (const favorite of favorites) {
        if (favorite.user?.id === item.ownerId) continue;

        await this.notificationService.createNotification(
          favorite.user.id,
          NotificationType.ITEM_AVAILABLE,
          'Item Favorito Disponível!',
          `O item "${item.titulo}" que você favoritou está novamente disponível!`,
          `/items/${item.id}`,
          { itemId: item.id }
        );
      }

      logger.debug(`[ItemService] ${favorites.length} usuário(s) notificado(s) sobre disponibilidade do item ${item.id}`);
    } catch (err) {
      logger.warn(`[ItemService] Erro ao notificar favoritos do item ${item.id}: ${(err as Error).message}`);
    }
  }

  /**
   * Lista itens com filtros e paginação
   */
  async findAll(filters: ItemFilters): Promise<PaginatedResponse<Item>> {
    const page = filters.page || 1;
    const limit = filters.limit || 12;
    const skip = (page - 1) * limit;

    const queryBuilder = this.itemRepository
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.owner', 'owner')
      .leftJoinAndSelect('item.imagens', 'imagens')
      .where('item.deletedAt IS NULL')
      .select([
        'item',
        'owner.id',
        'owner.nome',
        'owner.email',
        'owner.role',
        'imagens.id',
        'imagens.url',
      ]);

    if (filters.category) {
      queryBuilder.andWhere('item.categoria = :category', { category: filters.category });
    }

    if (filters.search) {
      queryBuilder.andWhere(
        '(item.titulo LIKE :search OR item.descricao LIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    if (filters.status) {
      queryBuilder.andWhere('item.status = :status', { status: filters.status });
    }

    if (filters.ownerId) {
      queryBuilder.andWhere('item.ownerId = :ownerId', { ownerId: filters.ownerId });
    }

    if (filters.location) {
      const { latitude, longitude, raio } = filters.location;
      const earthRadius = 6371;
      const haversineFormula = `
        (${earthRadius} * acos(
          cos(radians(:latitude)) * cos(radians(item.latitude)) * cos(radians(item.longitude) - radians(:longitude))
          + sin(radians(:latitude)) * sin(radians(item.latitude))
        ))
      `;
      queryBuilder
        .andWhere('item.latitude IS NOT NULL AND item.longitude IS NOT NULL')
        .andWhere(`${haversineFormula} <= :raio`, { latitude, longitude, raio });
    }

    const total = await queryBuilder.getCount();
    const items = await queryBuilder
      .orderBy('item.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getMany();

    return {
      data: items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Busca um item por ID
   */
  async findById(id: number | string): Promise<Item> {
    const numericId = Number(id);
    const item = await this.itemRepository
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.owner', 'owner')
      .leftJoinAndSelect('item.tradePreferences', 'tradePreferences')
      .leftJoinAndSelect('item.imagens', 'imagens')
      .where('item.id = :id', { id: numericId })
      .andWhere('item.deletedAt IS NULL')
      .select([
        'item',
        'owner.id',
        'owner.nome',
        'owner.email',
        'owner.role',
        'tradePreferences.id',
        'tradePreferences.titulo',
        'imagens.id',
        'imagens.url',
      ])
      .getOne();

    if (!item) {
      throw new NotFoundError('Item não encontrado');
    }

    return item;
  }

  /**
   * Busca um item por ID, incluindo os que foram soft-deleted.
   */
  private async findByIdWithDeleted(id: number | string): Promise<Item> {
    const numericId = Number(id);
    const item = await this.itemRepository
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.owner', 'owner')
      .where('item.id = :id', { id: numericId })
      .withDeleted()
      .getOne();

    if (!item) {
      throw new NotFoundError('Item não encontrado');
    }

    return item;
  }

  /**
   * Busca itens de um usuário específico
   */
  async findByOwner(ownerId: number | string): Promise<Item[]> {
    return await this.itemRepository.find({
      where: { ownerId: Number(ownerId), deletedAt: IsNull() },
      relations: ['owner', 'tradePreferences', 'imagens'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Atualiza um item
   */
  async update(
    id: number | string,
    dados: Partial<Item>,
    userId: number,
    novasImagens?: string[],
    preferredItemTitles?: string[]
  ): Promise<Item> {
    const item = await this.itemRepository.findOne({
      where: { id: Number(id) },
      relations: ['imagens', 'tradePreferences'],
    });

    if (!item) throw new NotFoundError('Item não encontrado para atualização.');
    if (item.ownerId !== userId) throw new ForbiddenError('Você não tem permissão para editar este item');

    delete dados.ownerId;
    this.itemRepository.merge(item, dados);
    await this.itemRepository.save(item);

    if (novasImagens !== undefined) {
      if (item.imagens?.length > 0) await this.imageRepository.remove(item.imagens);
      if (novasImagens.length > 0) {
        const imageEntities = novasImagens.map(url => this.imageRepository.create({ url, itemId: item.id }));
        await this.imageRepository.save(imageEntities);
      }
    }

    if (preferredItemTitles !== undefined) {
      if (item.tradePreferences?.length > 0) await this.preferenceRepository.remove(item.tradePreferences);
      if (preferredItemTitles.length > 0) {
        const preferenceEntities = preferredItemTitles.map(title =>
          this.preferenceRepository.create({ titulo: title, itemId: item.id })
        );
        await this.preferenceRepository.save(preferenceEntities);
      }
    }

    const updatedItem = await this.findById(item.id);

    try {
      const adminUser = await this.userRepository.findOne({ where: { role: UserRole.ADMIN } });
      if (adminUser) {
        await this.notificationService.createNotification(
          adminUser.id,
          NotificationType.ITEM_UPDATED,
          updatedItem.titulo,
          `Item "${updatedItem.titulo}" (ID: ${updatedItem.id}) atualizado por ${updatedItem.ownerId}.`
        );
      }
    } catch (err) {
      logger.warn(`[ItemService] Erro ao notificar admin sobre atualização: ${(err as Error).message}`);
    }

    return updatedItem;
  }

  /**
   * Deleta um item (soft delete)
   */
  async delete(id: number | string, userId: number, userRole: UserRole): Promise<void> {
    const item = await this.findByIdWithDeleted(id);

    if (item.deletedAt) return;

    if (item.ownerId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenError('Você não tem permissão para deletar este item');
    }

    await this.itemRepository.softRemove(item);

    if (item.ownerId !== userId) {
      await this.notificationService.notifyItemDeletedByAdmin(item.ownerId, item.titulo);
    } else {
      await this.notificationService.notifyItemDeleted(item.ownerId, item.titulo);
    }
  }

  /**
   * Atualiza o status de um item e notifica interessados
   */
  async updateStatus(id: number | string, status: ItemStatus, userId: number): Promise<Item> {
    const item = await this.findById(id);

    if (item.ownerId !== userId) {
      throw new ForbiddenError('Você não tem permissão para alterar o status deste item');
    }
    if (!Object.values(ItemStatus).includes(status)) {
      throw new BadRequestError('Status inválido');
    }

    item.status = status;
    await this.itemRepository.save(item);

    if (status === ItemStatus.DISPONIVEL) {
      const updatedItem = await this.findById(item.id);
      logger.info(`[ItemService] Item ${item.id} voltou a ficar disponível — buscando matches e notificando favoritos`);
      await this.findMatchesAndNotify(updatedItem);
      await this.notifyFavoritedUsers(updatedItem);
      return updatedItem;
    }

    return await this.findById(item.id);
  }

  /**
   * Busca categorias únicas
   */
  async getCategories(): Promise<string[]> {
    const result = await this.itemRepository
      .createQueryBuilder('item')
      .select('DISTINCT item.categoria', 'categoria')
      .getRawMany();
    return result.map(r => r.categoria);
  }

  /**
   * Restaura um item soft-deleted
   */
  async restore(id: number | string, userId: number): Promise<Item> {
    const item = await this.findByIdWithDeleted(id);

    if (item.ownerId !== userId) {
      throw new ForbiddenError('Você não tem permissão para restaurar este item');
    }
    if (!item.deletedAt) {
      throw new BadRequestError('Este item não está deletado e não pode ser restaurado.');
    }

    await this.itemRepository.recover(item);
    return await this.findById(item.id);
  }
}
