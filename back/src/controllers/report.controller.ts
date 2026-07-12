import { Response, NextFunction } from 'express';
import { ReportService } from '../services/report.service';
import { AuthRequest, UserRole } from '../types'; // Certifique-se que UserRole está importado
import { BadRequestError } from '../errors/http-errors'; // Importe BadRequestError

export class ReportController {
  private reportService = new ReportService();

  public create = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const reporterId = req.userId!;
      // Aceita reportedId (do teste) ou reportedUserId
      const { reportedUserId, reportedId, reason, description, reportedItemId } = req.body;

      const report = await this.reportService.createReport(
        reporterId,
        reportedUserId ?? reportedId, // Usa reportedUserId ou reportedId se o primeiro for undefined
        reason,
        description,
        reportedItemId
      );

      res.status(201).json(report);
    } catch (error) {
      next(error);
    }
  };

  public findAll = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const reports = await this.reportService.findAll();
      res.status(200).json(reports);
    } catch (error) {
      next(error);
    }
  };

  public findById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      console.log(`[CONTROLLER DEBUG] findById - Recebido ID: ${id}`); // << LOG ADICIONADO

      const numericId = parseInt(id, 10); // Use parseInt para garantir número
      if (isNaN(numericId)) {
        throw new BadRequestError('ID da denúncia inválido.'); // Lança erro se não for número
      }

      const report = await this.reportService.findById(numericId); // Passa ID numérico

      console.log(`[CONTROLLER DEBUG] findById - Report encontrado pelo serviço:`, report ? `ID ${report.id}` : 'NÃO ENCONTRADO'); // << LOG ADICIONADO

      res.status(200).json(report);
    } catch (error) {
      console.log(`[CONTROLLER DEBUG] findById - Erro capturado:`, (error as Error).message); // << LOG ADICIONADO
      next(error);
    }
  };

  public updateStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { status, actionTaken } = req.body;
      const changedByUserId = req.userId!;

      const numericId = parseInt(id, 10);
      if (isNaN(numericId)) {
        throw new BadRequestError('ID da denúncia inválido.');
      }

      const report = await this.reportService.updateStatus(numericId, status, actionTaken, changedByUserId);
      res.status(200).json(report);
    } catch (error) {
      next(error);
    }
  };
}