import { Request, Response, NextFunction } from 'express';
import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';

/**
 * Middleware de validação usando class-validator
 * Valida automaticamente os dados de entrada contra um DTO
 */
export const validateDTO = (dtoClass: any) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Transforma o body em uma instância da classe DTO
      const dtoInstance = plainToClass(dtoClass, req.body);

      // Valida a instância
      const errors: ValidationError[] = await validate(dtoInstance);

      if (errors.length > 0) {
        // Formata os erros para uma resposta legível
        const formattedErrors = errors.map(error => ({
          field: error.property,
          errors: Object.values(error.constraints || {})
        }));

        res.status(400).json({
          error: 'Dados inválidos',
          details: formattedErrors
        });
        return;
      }

      // Se passou na validação, substitui o body pela instância validada
      req.body = dtoInstance;
      next();
    } catch (error) {
      res.status(500).json({
        error: 'Erro ao validar dados',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  };
};
