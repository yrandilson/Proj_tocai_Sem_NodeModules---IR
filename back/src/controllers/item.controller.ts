import { Request, Response, NextFunction } from 'express';
import { ItemService } from '../services/item.service';
import { AuthRequest, ItemFilters, ItemStatus, LocationFilter } from '../types';
import { validate } from 'class-validator';
import { CreateItemDTO, UpdateItemDTO, UpdateItemStatusDTO } from '../dtos';
import { BadRequestError } from '../errors/http-errors';
/**
 * Controller responsável por gerenciar requisições relacionadas a itens
 */
export class ItemController {
  private itemService = new ItemService();

  /**
   * Cria um novo item
   * POST /api/items
   */
  create = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req as AuthRequest;
      const { latitude, longitude } = req.body;

      // 1. Validação do corpo da requisição com DTO
      const createItemDto = new CreateItemDTO();
      Object.assign(createItemDto, req.body);
      const errors = await validate(createItemDto);
      if (errors.length > 0) {
        const validationErrors = errors.map(error => Object.values(error.constraints || {})).flat().join(', ');
        throw new BadRequestError(`Dados de entrada inválidos: ${validationErrors}`);
      }

      // Pega as imagens do upload se houver
      const files = (req as any).files as Express.Multer.File[];
      const imagens = files ? files.map(f => f.filename) : [];

      const { titulo, descricao, categoria } = createItemDto;

      const item = await this.itemService.create(titulo, descricao, categoria, userId!, imagens, { latitude, longitude });

      res.status(201).json(item);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Lista itens com filtros e paginação
   * GET /api/items?page=1&limit=12&category=eletronicos&search=livro&status=disponivel&latitude=-23.5505&longitude=-46.6333&raio=10
   */
  findAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // 2. Validação e sanitização dos parâmetros de consulta (query)
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 12;
      const status = req.query.status as ItemStatus;

      if (isNaN(page) || page < 1) throw new BadRequestError('Parâmetro "page" inválido.');
      if (isNaN(limit) || limit < 1) throw new BadRequestError('Parâmetro "limit" inválido.');
      if (status && !Object.values(ItemStatus).includes(status)) {
        throw new BadRequestError('Parâmetro "status" inválido.');
      }

      // Validação dos parâmetros de localização
      const { latitude, longitude, raio } = req.query;
      let locationFilter: LocationFilter | undefined;
      if (latitude && longitude && raio) {
        const lat = parseFloat(latitude as string);
        const lon = parseFloat(longitude as string);
        const r = parseFloat(raio as string);

        if (isNaN(lat) || isNaN(lon) || isNaN(r) || r <= 0) {
          throw new BadRequestError('Parâmetros de localização (latitude, longitude, raio) inválidos.');
        }
        locationFilter = { latitude: lat, longitude: lon, raio: r };
      }

      const filters: ItemFilters = {
        page,
        limit,
        category: req.query.category as string,
        search: req.query.search as string,
        status,
        location: locationFilter,
      };

      const result = await this.itemService.findAll(filters);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Busca um item por ID
   * GET /api/items/:id
   */
  findById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      // 3. Validação do parâmetro de rota
      const numericId = parseInt(id, 10);
      if (isNaN(numericId)) {
        throw new BadRequestError('ID do item deve ser um número.');
      }

      const item = await this.itemService.findById(numericId);

      res.status(200).json(item);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Busca itens do usuário logado
   * GET /api/items/my
   */
  findMyItems = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req as AuthRequest;
      const items = await this.itemService.findByOwner(userId!);

      res.status(200).json(items);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Atualiza um item
   * PUT /api/items/:id
   */
  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const numericId = parseInt(id, 10);
      if (isNaN(numericId)) {
        throw new BadRequestError('ID do item deve ser um número.');
      }

      const { userId } = req as AuthRequest;

      // 4. Validação do corpo da requisição com DTO
      const updateItemDto = new UpdateItemDTO();
      Object.assign(updateItemDto, req.body);
      const errors = await validate(updateItemDto);
      if (errors.length > 0) {
        const validationErrors = errors.map(error => Object.values(error.constraints || {})).flat().join(', ');
        throw new BadRequestError(`Dados de entrada inválidos: ${validationErrors}`);
      }

      // Pega novas imagens se houver
      const files = (req as any).files as Express.Multer.File[];
      const novasImagens = files && files.length > 0 ? files.map(f => f.filename) : undefined;

      const item = await this.itemService.update(numericId, updateItemDto, userId!, novasImagens);

      res.status(200).json(item);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Deleta um item
   * DELETE /api/items/:id
   */
  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const numericId = parseInt(id, 10);
      if (isNaN(numericId)) {
        throw new BadRequestError('ID do item deve ser um número.');
      }

      const { userId, userRole } = req as AuthRequest;
      await this.itemService.delete(numericId, userId!, userRole!);

      res.status(200).json({ message: 'Item deletado com sucesso' });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Atualiza o status de um item
   * PATCH /api/items/:id/status
   */
  updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const numericId = parseInt(id, 10);
      if (isNaN(numericId)) {
        throw new BadRequestError('ID do item deve ser um número.');
      }

      const { userId } = req as AuthRequest;

      // 5. Validação do corpo da requisição com DTO
      const updateStatusDto = new UpdateItemStatusDTO();
      updateStatusDto.status = req.body.status;
      const errors = await validate(updateStatusDto);
      if (errors.length > 0) {
        const validationErrors = errors.map(error => Object.values(error.constraints || {})).flat().join(', ');
        throw new BadRequestError(`Status inválido: ${validationErrors}`);
      }

      const item = await this.itemService.updateStatus(numericId, updateStatusDto.status, userId!);
      res.status(200).json(item);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Busca categorias disponíveis
   * GET /api/items/categories
   */
  getCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categories = await this.itemService.getCategories();

      res.status(200).json(categories);
    } catch (error) {
      next(error);
    }
  };
}
