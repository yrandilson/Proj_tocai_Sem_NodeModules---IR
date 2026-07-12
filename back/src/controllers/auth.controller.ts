import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';
import { UnauthorizedError } from '../errors/http-errors';
import { REFRESH_TOKEN_CONFIG } from '../config/jwt';

const COOKIE_OPTIONS = {
  httpOnly: true,                                     // não acessível via JS
  secure: process.env.NODE_ENV === 'production',      // HTTPS em produção
  sameSite: 'lax' as const,                           // proteção básica CSRF
  maxAge: 7 * 24 * 60 * 60 * 1000,                   // 7 dias em ms
  path: '/api/auth',                                  // só enviado para rotas de auth
};

export class AuthController {
  private userService = new UserService();
  private authService = new AuthService();

  public register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { nome, email, senha } = req.body;
      const { user, accessToken, refreshToken } = await this.authService.register(nome, email, senha);

      res.cookie(REFRESH_TOKEN_CONFIG.cookieName, refreshToken, COOKIE_OPTIONS);
      res.status(201).json({ user, token: accessToken });
    } catch (error) {
      next(error);
    }
  };

  public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, senha } = req.body;
      const { user, accessToken, refreshToken } = await this.authService.login(email, senha);

      res.cookie(REFRESH_TOKEN_CONFIG.cookieName, refreshToken, COOKIE_OPTIONS);
      // Mantém `token` na resposta para compatibilidade com o frontend existente
      res.status(200).json({ user, token: accessToken });
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

  /**
   * POST /api/auth/refresh
   * Lê o refresh token do cookie, valida e emite novos tokens.
   */
  public refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rawToken = req.cookies?.[REFRESH_TOKEN_CONFIG.cookieName];

      if (!rawToken) {
        res.status(401).json({ error: 'Refresh token não encontrado.' });
        return;
      }

      const { accessToken, refreshToken } = await this.authService.refreshTokens(rawToken);

      res.cookie(REFRESH_TOKEN_CONFIG.cookieName, refreshToken, COOKIE_OPTIONS);
      res.status(200).json({ token: accessToken });
    } catch (error) {
      // Limpa o cookie inválido
      res.clearCookie(REFRESH_TOKEN_CONFIG.cookieName, { path: '/api/auth' });
      if (error instanceof UnauthorizedError) {
        res.status(401).json({ error: error.message });
        return;
      }
      next(error);
    }
  };

  /**
   * POST /api/auth/logout
   * Revoga todos os refresh tokens do usuário e limpa o cookie.
   */
  public logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rawToken = req.cookies?.[REFRESH_TOKEN_CONFIG.cookieName];

      if (rawToken) {
        // Busca o userId a partir do token para revogar todos os tokens dele
        try {
          const { accessToken } = await this.authService.refreshTokens(rawToken);
          // Se chegou aqui, temos o userId — revoga imediatamente
          // Decodifica para pegar o userId (sem verificar expiração para logout)
          const jwt = require('jsonwebtoken');
          const decoded = jwt.decode(accessToken) as { userId: number } | null;
          if (decoded?.userId) {
            await this.authService.revokeAllTokens(decoded.userId);
          }
        } catch {
          // Token já expirado ou inválido — tudo bem, só limpa o cookie
        }
      }

      res.clearCookie(REFRESH_TOKEN_CONFIG.cookieName, { path: '/api/auth' });
      res.status(200).json({ message: 'Logout realizado com sucesso.' });
    } catch (error) {
      next(error);
    }
  };

  public getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).userId;
      const user = await this.userService.findById(userId);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  };
}
