import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWTPayload, AuthRequest, UserRole } from '../types';
import { getJWTSecret } from '../config/jwt';

/**
 * Middleware de autenticação
 * Verifica se o token JWT é válido e adiciona userId e userRole ao request
 */
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Pega o token do header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({ error: 'Token não fornecido' });
      return;
    }

    // Formato esperado: "Bearer TOKEN"
    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      res.status(401).json({ error: 'Formato de token inválido' });
      return;
    }

    const token = parts[1];

    // Verifica e decodifica o token
    const decoded = jwt.verify(
      token,
      getJWTSecret()
    ) as JWTPayload;

    // Valida se o payload decodificado tem a estrutura esperada
    if (typeof decoded !== 'object' || !decoded.userId || !decoded.role) {
      res.status(401).json({ error: 'Payload do token inválido' });
      return;
    }

    // Adiciona os dados do usuário ao request
    const payload = decoded as JWTPayload;
    (req as AuthRequest).userId = payload.userId;
    (req as AuthRequest).userRole = payload.role;
    (req as AuthRequest).user = {
      id: payload.userId,
      role: payload.role
    };

    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido ou expirado' });
  }
};

/**
 * Middleware de autorização por role
 * Verifica se o usuário tem uma das roles permitidas
 * DEVE ser usado APÓS o authMiddleware
 */
export const roleMiddleware = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const authReq = req as AuthRequest;

      // Verifica se o authMiddleware foi executado antes
      if (!authReq.userRole) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
      }

      // Verifica se o role do usuário está na lista de roles permitidas
      if (!allowedRoles.includes(authReq.userRole)) {
        res.status(403).json({ 
          error: 'Acesso negado', 
          message: 'Você não tem permissão para acessar este recurso' 
        });
        return;
      }

      next();
    } catch (error) {
      res.status(403).json({ error: 'Erro ao verificar permissões' });
    }
  };
};