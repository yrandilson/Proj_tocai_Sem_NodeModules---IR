import { AppDataSource } from '../config/database';
import { Item } from '../entities/Item';
import { Image } from '../entities/image.entity';
import { TradePreference } from '../entities/TradePreference';
import { User } from '../entities/User';
import { Favorite } from '../entities/Favorite'; // 👈 NOVO IMPORT
import { ItemStatus, ItemFilters, PaginatedResponse, UserRole, NotificationType } from '../types';
import { In, IsNull } from 'typeorm';
import { NotificationService } from './notification.service';
import { BadRequestError, ForbiddenError, NotFoundError } from '../errors/http-errors';

/**
 * Service responsável pela lógica de negócio relacionada a itens
 */
export class ItemService {
  private itemRepository = AppDataSource.getRepository(Item);
  private preferenceRepository = AppDataSource.getRepository(TradePreference);
  private imageRepository = AppDataSource.getRepository(Image);
  private userRepository = AppDataSource.getRepository(User);
  private favoriteRepository = AppDataSource.getRepository(Favorite); // 👈 NOVO REPOSITORY
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
  // Validações
  if (!titulo || titulo.length < 3) {
    throw new BadRequestError('O título deve ter pelo menos 3 caracteres.');
  }

  if (!descricao || descricao.length < 10) {
    throw new BadRequestError('A descrição deve ter pelo menos 10 caracteres.');
  }

  if (!categoria) {
    throw new BadRequestError('A categoria é obrigatória.');
  }

  console.log(`\n========================================`);
  console.log(`[ItemService] 🆕 CRIANDO NOVO ITEM`);
  console.log(`[ItemService] Título: "${titulo}"`);
  console.log(`[ItemService] Categoria: "${categoria}"`);
  console.log(`[ItemService] Dono: ${ownerId}`);
  console.log(`[ItemService] Imagens: ${imagens?.length || 0}`);
  console.log(`[ItemService] Preferências recebidas: ${preferredItemTitles?.length || 0}`);
  
  if (preferredItemTitles && preferredItemTitles.length > 0) {
    console.log(`[ItemService] 📋 Preferências:`, preferredItemTitles);
  } else {
    console.log(`[ItemService] ⚠️ ALERTA: Nenhuma preferência recebida!`);
  }
  console.log(`========================================\n`);

  // 🔴 CORREÇÃO CRÍTICA - ETAPA 1: Criar o item SEM as relações primeiro
  const item = this.itemRepository.create({
    titulo,
    descricao,
    categoria,
    ownerId: ownerId,
    status: ItemStatus.DISPONIVEL,
    ...localizacao,
  });

  // Salva o item no banco de dados
  await this.itemRepository.save(item);
  console.log(`[ItemService] ✅ Item salvo com ID: ${item.id}`);
  
  // 🔴 CORREÇÃO CRÍTICA: Verificar se o ID foi gerado
  if (!item.id) {
    throw new Error('Erro crítico: Item foi salvo mas não recebeu um ID!');
  }
  console.log(`[ItemService] ✓ ID confirmado: ${item.id}\n`);

  // 🔴 ETAPA 2: Criar e salvar as IMAGENS com o itemId
  if (imagens && imagens.length > 0) {
    const imageEntities = imagens.map(url => {
      return this.imageRepository.create({ 
        url,
        itemId: item.id
      });
    });
    await this.imageRepository.save(imageEntities);
    console.log(`[ItemService] ✅ ${imageEntities.length} imagem(ns) salva(s)\n`);
  }

  // 🔴 ETAPA 3: Criar e salvar as PREFERÊNCIAS com o itemId
  if (preferredItemTitles && preferredItemTitles.length > 0) {
    console.log(`[ItemService] 🔧 Criando ${preferredItemTitles.length} preferência(s)...`);
    
    const preferenceEntities = preferredItemTitles.map(title => {
      const pref = this.preferenceRepository.create({ 
        titulo: title,
        itemId: item.id
      });
      console.log(`[ItemService]   - Criando preferência: "${title}" para item ${item.id}`);
      return pref;
    });
    
    const savedPreferences = await this.preferenceRepository.save(preferenceEntities);
    console.log(`[ItemService] ✅ ${savedPreferences.length} preferência(s) salva(s)!`);
    
    // 🔴 VERIFICAÇÃO: Confirmar que foram salvas no banco
    const verifyPrefs = await this.preferenceRepository.find({ 
      where: { itemId: item.id } 
    });
    console.log(`[ItemService] 🔍 Verificação no banco: ${verifyPrefs.length} preferência(s) encontrada(s)`);
    verifyPrefs.forEach(p => {
      console.log(`[ItemService]   ✓ ID: ${p.id}, Título: "${p.titulo}", ItemId: ${p.itemId}`);
    });
    console.log('');
  } else {
    console.log(`[ItemService] ⚠️ Nenhuma preferência para salvar\n`);
  }

  // 🔴 ETAPA 4: Recarrega o item com TODAS as relações
  const savedItem = await this.itemRepository.findOne({
    where: { id: item.id },
    relations: ['owner', 'tradePreferences', 'imagens']
  });

  if (!savedItem) {
    throw new Error('Erro ao recarregar o item após criação');
  }

  console.log(`[ItemService] ✅ Item recarregado com:`);
  console.log(`  - ${savedItem.tradePreferences?.length || 0} preferência(s)`);
  console.log(`  - ${savedItem.imagens?.length || 0} imagem(ns)`);
  
  if (savedItem.tradePreferences && savedItem.tradePreferences.length > 0) {
    console.log(`[ItemService] 📋 Preferências carregadas:`);
    savedItem.tradePreferences.forEach((p: TradePreference) => {
      console.log(`[ItemService]   - "${p.titulo}"`);
    });
  }
  console.log('');

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
    console.error('[ItemService] ⚠️ Erro ao notificar admin:', err);
  }

  // 🔴 ETAPA 5: Dispara a busca por matches
  console.log(`[ItemService] 🚀 Iniciando busca de matches...\n`);
  setImmediate(() => {
    this.findMatchesAndNotify(savedItem).catch(err => {
      console.error(`[Matchmaking] ❌ Erro ao processar matches para o item ${savedItem.id}:`, err);
    });
  });

  return savedItem;
}

  /**
   * Encontra usuários que desejam o item recém-criado e os notifica.
   */
  private async findMatchesAndNotify(newItem: Item): Promise<void> {
    if (!newItem.titulo || !newItem.id) {
      console.error('[Matchmaking] ❌ Item inválido - falta título ou ID');
      return;
    }

    console.log(`\n========================================`);
    console.log(`[Matchmaking] 🔍 INICIANDO BUSCA DE MATCHES`);
    console.log(`[Matchmaking] Item novo: "${newItem.titulo}" (ID: ${newItem.id})`);
    console.log(`[Matchmaking] Dono: ${newItem.ownerId}`);
    console.log(`========================================\n`);

    try {
      // 🔴 Query para encontrar itens que desejam o novo item
      const query = this.itemRepository
        .createQueryBuilder('item')
        .innerJoinAndSelect('item.tradePreferences', 'preference')
        .innerJoinAndSelect('item.owner', 'owner')
        .where('preference.titulo = :newItemTitle', { newItemTitle: newItem.titulo })
        .andWhere('item.deletedAt IS NULL')
        .andWhere('item.status = :status', { status: ItemStatus.DISPONIVEL });

      // Log da query SQL para debug
      const sql = query.getSql();
      console.log(`[Matchmaking] 📋 SQL Query:\n${sql}`);
      console.log(`[Matchmaking] Parâmetros:`);
      console.log(`  - newItemTitle: "${newItem.titulo}"`);
      console.log(`  - status: "${ItemStatus.DISPONIVEL}"\n`);

      const offeringItems = await query.getMany();

      console.log(`[Matchmaking] ✅ Encontrados ${offeringItems.length} item(ns) que desejam "${newItem.titulo}"\n`);

      if (offeringItems.length === 0) {
        console.log(`[Matchmaking] ❌ Nenhum match encontrado. Busca finalizada.\n`);
        
        // DEBUG EXTRA: Verifica TODAS as preferências no banco
        const allPreferences = await this.preferenceRepository.find();
        console.log(`[Matchmaking] 📋 DEBUG - Total de preferências no banco: ${allPreferences.length}`);
        if (allPreferences.length > 0) {
          console.log(`[Matchmaking] 📋 Preferências existentes:`);
          allPreferences.forEach(pref => {
            console.log(`   - ID: ${pref.id}, Título: "${pref.titulo}", ItemId: ${pref.itemId}`);
          });
        }
        console.log('\n========================================\n');
        return;
      }

      // Processa cada match encontrado
      for (const offeringItem of offeringItems) {
        const preferencesStr = offeringItem.tradePreferences
          ?.map((p: TradePreference) => `"${p.titulo}"`)
          .join(', ') || 'nenhuma';
        
        console.log(`[Matchmaking] 🎯 MATCH ENCONTRADO!`);
        console.log(`   Item que deseja: "${offeringItem.titulo}" (ID: ${offeringItem.id})`);
        console.log(`   Dono: ${offeringItem.ownerId} (${offeringItem.owner?.nome || 'nome não carregado'})`);
        console.log(`   Preferências: ${preferencesStr}\n`);
        
        // Evita notificar o usuário sobre seu próprio item
        if (offeringItem.ownerId === newItem.ownerId) {
          console.log(`[Matchmaking] ⚠️  IGNORADO: Usuário ${offeringItem.ownerId} é o dono de ambos os itens\n`);
          continue;
        }
        
        // 🔴 NOVA FUNCIONALIDADE: VERIFICAÇÃO DE MATCH BIDIRECIONAL
        const isBidirectionalMatch = newItem.tradePreferences?.some(
          (pref: TradePreference) => pref.titulo === offeringItem.titulo
        );

        const notificationTitle = isBidirectionalMatch 
          ? '✨ Match Perfeito Encontrado! ✨' 
          : '🎉 Match Encontrado!';
        
        const notificationMessage = isBidirectionalMatch
          ? `Seu item "${offeringItem.titulo}" é desejado por alguém que oferece um "${newItem.titulo}", E ELE TAMBÉM DESEJA O SEU ITEM! Corre lá!`
          : `Seu item "${offeringItem.titulo}" é desejado por alguém que oferece um "${newItem.titulo}"!`;

        const link = `/items/${newItem.id}`;
        const metadata = { itemId: newItem.id, isBidirectional: isBidirectionalMatch };

        try {
          // Notificação para o dono do item existente (offeringItem)
          await this.notificationService.createNotification(
            offeringItem.ownerId,
            NotificationType.MATCH_FOUND,
            notificationTitle,
            notificationMessage,
            link,
            metadata
          );
          console.log(`[Matchmaking] ✉️  Notificação enviada para o usuário ${offeringItem.ownerId}. Bidirecional: ${isBidirectionalMatch}\n`);
          
          // Se for bidirecional, notifica o dono do item novo (newItem) também
          if (isBidirectionalMatch) {
            await this.notificationService.createNotification(
              newItem.ownerId,
              NotificationType.MATCH_FOUND,
              notificationTitle,
              `Seu item "${newItem.titulo}" é desejado por alguém que oferece um "${offeringItem.titulo}"! Corre lá!`,
              `/items/${offeringItem.id}`,
              { itemId: offeringItem.id, isBidirectional: true }
            );
            console.log(`[Matchmaking] ✉️  Notificação bidirecional enviada para o novo dono ${newItem.ownerId}\n`);
          }

        } catch (notifErr) {
          console.error(`[Matchmaking] ❌ Erro ao enviar notificação para usuário ${offeringItem.ownerId}:`, notifErr);
        }
      }

      console.log(`========================================`);
      console.log(`[Matchmaking] ✅ BUSCA FINALIZADA`);
      console.log(`========================================\n`);
    } catch (err) {
      console.error('[Matchmaking] ❌ ERRO CRÍTICO na query de busca de matches:', err);
      throw err;
    }
  }

  /**
   * 👇 NOVO MÉTODO: Notifica usuários que favoritaram um item quando ele volta a ficar disponível
   */
  private async notifyFavoritedUsers(item: Item): Promise<void> {
    try {
      console.log(`[ItemService] 🔔 Buscando usuários que favoritaram o item ${item.id}...`);
      
      // Busca todos os favoritos deste item
      const favorites = await this.favoriteRepository.find({
        where: { item: { id: item.id } },
        relations: ['user', 'item']
      });

      console.log(`[ItemService] Encontrados ${favorites.length} favorito(s)`);

      if (favorites.length === 0) {
        return;
      }

      // Envia notificação para cada usuário que favoritou
      for (const favorite of favorites) {
        // Evita notificar o próprio dono
        if (favorite.user?.id === item.ownerId) {
          continue;
        }

        await this.notificationService.createNotification(
          favorite.user.id,
          NotificationType.ITEM_AVAILABLE,
          'Item Favorito Disponível!',
          `O item "${item.titulo}" que você favoritou está novamente disponível!`,
          `/items/${item.id}`,
          { itemId: item.id }
        );

        console.log(`[ItemService] ✅ Notificação de favorito enviada para usuário ${favorite.user?.id}`);
      }
    } catch (err) {
      console.error('[ItemService] Erro ao notificar usuários de favoritos:', err);
    }
  }

  /**
   * Lista itens com filtros e paginação
   */
  async findAll(filters: ItemFilters): Promise<PaginatedResponse<Item>> {
    const page = filters.page || 1;
    const limit = filters.limit || 12;
    const skip = (page - 1) * limit;

    // Constrói a query com filtros
    const queryBuilder = this.itemRepository
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.owner', 'owner')
      .where('item.deletedAt IS NULL')
      .select([
        'item',
        'owner.id',
        'owner.nome',
        'owner.email',
        'owner.role'
      ]);

    // Filtro por categoria
    if (filters.category) {
      queryBuilder.andWhere('item.categoria = :category', { 
        category: filters.category 
      });
    }

    // Otimização de Busca (Full-Text Search - P3)
    if (filters.search) {
      queryBuilder.andWhere(
        '(item.titulo LIKE :search OR item.descricao LIKE :search)', 
        { 
          search: `%${filters.search}%` 
        }
      );
    }

    // Filtro por status
    if (filters.status) {
      queryBuilder.andWhere('item.status = :status', { 
        status: filters.status 
      });
    }

    // Filtro por dono
    if (filters.ownerId) {
      queryBuilder.andWhere('item.ownerId = :ownerId', { 
        ownerId: filters.ownerId 
      });
    }

    // Filtro por localização (Raio) - Fórmula de Haversine
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
        .andWhere(`item.latitude IS NOT NULL AND item.longitude IS NOT NULL`)
        .andWhere(`${haversineFormula} <= :raio`, { 
          latitude, 
          longitude, 
          raio 
        });
    }

    // Conta o total
    const total = await queryBuilder.getCount();

    // Busca os itens paginados
    const items = await queryBuilder
      .orderBy('item.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getMany();

    return {
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
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
        'owner.email', 'owner.role',
        'tradePreferences.id',
        'tradePreferences.titulo',
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
      order: { createdAt: 'DESC' }
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

    if (!item) {
      throw new NotFoundError('Item não encontrado para atualização.');
    }

    if (item.ownerId !== userId) {
      throw new ForbiddenError('Você não tem permissão para editar este item');
    }

    delete dados.ownerId;

    this.itemRepository.merge(item, dados);
    await this.itemRepository.save(item);

    // Atualiza imagens
    if (novasImagens !== undefined) {
      if (item.imagens && item.imagens.length > 0) {
        await this.imageRepository.remove(item.imagens);
      }
      if (novasImagens.length > 0) {
        const imageEntities = novasImagens.map(url => {
          return this.imageRepository.create({ url, itemId: item.id });
        });
        await this.imageRepository.save(imageEntities);
      }
    }

    // Atualiza preferências
    if (preferredItemTitles !== undefined) {
      if (item.tradePreferences && item.tradePreferences.length > 0) {
        await this.preferenceRepository.remove(item.tradePreferences);
      }
      if (preferredItemTitles.length > 0) {
        const preferenceEntities = preferredItemTitles.map(title => {
          return this.preferenceRepository.create({ titulo: title, itemId: item.id });
        });
        await this.preferenceRepository.save(preferenceEntities);
      }
    }

    const updatedItem = await this.findById(item.id);

    // Notifica o admin
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
      console.error('[ItemService] Erro ao notificar admin:', err);
    }
    return updatedItem;
  }

  /**
   * Deleta um item
   */
  async delete(id: number | string, userId: number, userRole: UserRole): Promise<void> {
    const item = await this.findByIdWithDeleted(id);

    if (item.deletedAt) {
      return;
    }

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
   * 👇 MODIFICADO: Atualiza o status de um item + notifica favoritos
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

    // 👇 NOVA FUNCIONALIDADE: Notifica quando item volta a ficar disponível
    // DEPOIS (com await direto):
	if (status === ItemStatus.DISPONIVEL) {
	  const updatedItem = await this.findById(item.id);
	  
	  console.log(`[ItemService] 🚀 Item ${item.id} voltou a ficar DISPONÍVEL...`);
	  
	  // Aguarda as notificações terminarem
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