import { Request, Response, NextFunction } from 'express';
import { UserRole, AuthRequest } from '../types';

/**
 * Middleware para autorizar acesso baseado no papel (role) do usuário.
 * @param allowedRoles Array de roles permitidas para acessar a rota.
 */
export const roleMiddleware = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { userRole } = req as AuthRequest;
    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({ error: 'Acesso negado. Permissões insuficientes.' });
    }
    next();
  };
};