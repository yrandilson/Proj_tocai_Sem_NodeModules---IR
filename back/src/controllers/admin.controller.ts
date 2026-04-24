import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/admin.service';

export class AdminController {
  private adminService = new AdminService();

  /**
   * Busca as estatísticas consolidadas para o dashboard.
   */
  getStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.adminService.getDashboardStats();
      res.status(200).json(stats);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Busca as categorias mais populares.
   */
  getTopCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categories = await this.adminService.getTopCategories();
      res.status(200).json(categories);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Busca as atividades mais recentes da plataforma.
   */
  getRecentActivity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const activity = await this.adminService.getRecentActivity();
      res.status(200).json(activity);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Busca dados para o gráfico de crescimento.
   */
  getGrowthData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const growthData = await this.adminService.getGrowthData();
      res.status(200).json(growthData);
    } catch (error) {
      next(error);
    }
  };
}