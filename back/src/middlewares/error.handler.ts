import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../errors/http-errors';
import logger from '../config/logger';

/**
 * Middleware de tratamento de erros global.
 * Deve ser o último middleware adicionado ao Express.
 */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Loga o erro completo no console do servidor para depuração.
  logger.error(`${error.name}: ${error.message} em ${req.method} ${req.originalUrl}`, { stack: error.stack });

  // Se for um erro HTTP customizado (como BadRequestError, NotFoundError),
  // usa o status e a mensagem definidos nele.
  if (error instanceof HttpError) {
    return res.status(error.statusCode).json({
      message: error.message,
    });
  }

  // Para qualquer outro tipo de erro não previsto, retorna um erro 500 genérico
  // para não expor detalhes da implementação ao cliente.
  return res.status(500).json({
    error: 'InternalServerError',
    message: 'Ocorreu um erro inesperado no servidor.',
  });
};