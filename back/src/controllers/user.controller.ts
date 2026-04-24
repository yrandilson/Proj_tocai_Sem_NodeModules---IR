// backend/src/controllers/user.controller.ts
import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { AuthRequest, UserRole } from '../types';
import { BadRequestError } from '../errors/http-errors';

export class UserController {
  private userService = new UserService();

  findAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const users = await this.userService.findAll();
      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const numericId = parseInt(id, 10);
      if (isNaN(numericId)) {
        throw new BadRequestError('ID de usuário inválido.');
      }
      const user = await this.userService.findById(numericId);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { userId, userRole } = req as AuthRequest;
      const dados = req.body;
      const user = await this.userService.update(Number(id), dados, userId!, userRole!);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const numericId = parseInt(id, 10);
      if (isNaN(numericId)) {
        throw new BadRequestError('ID de usuário inválido.');
      }
      await this.userService.delete(numericId, req as AuthRequest); // Agora a chamada está correta
      
      res.status(200).json({ 
        message: 'Usuário deletado com sucesso',
        deletedUserId: numericId
      });
      
    } catch (error) {
      next(error);
    }
  };

  updateRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const numericId = parseInt(id, 10);
      if (isNaN(numericId)) {
        throw new BadRequestError('ID de usuário inválido.');
      }
      const { role } = req.body;
      const user = await this.userService.updateRole(numericId, role as UserRole);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  };

  verifyUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const numericId = parseInt(id, 10);
      if (isNaN(numericId)) {
        throw new BadRequestError('ID de usuário inválido.');
      }
      const user = await this.userService.updateRole(numericId, UserRole.VERIFIED);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  };

  blockUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const numericId = parseInt(id, 10);
      if (isNaN(numericId)) {
        throw new BadRequestError('ID de usuário inválido.');
      }
      const { isBlocked } = req.body;
      const user = await this.userService.blockUser(numericId, isBlocked);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  };
}
