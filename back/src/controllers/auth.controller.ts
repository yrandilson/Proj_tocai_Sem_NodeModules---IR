import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';
import { UnauthorizedError } from '../errors/http-errors';

export class AuthController {
  private userService = new UserService();
  private authService = new AuthService();

  public register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { nome, email, senha } = req.body;
      const result = await this.authService.register(nome, email, senha);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, senha } = req.body;
      const result = await this.authService.login(email, senha);
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        const message = error.message === 'Usuário bloqueado.'
          ? 'Usuário bloqueado.'
          : 'Credenciais inválidas.';
        res.status(401).json({ error: message });
        return;
      }
      next(error);
    }
  };

  public getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // A propriedade userId é adicionada à requisição pelo authMiddleware
      const userId = (req as any).userId;
      const user = await this.userService.findById(userId);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  };
}