import { Response, NextFunction } from 'express';
import { NotificationService } from '../services/notification.service';
import { AuthRequest } from '../types';
import { BadRequestError } from '../errors/http-errors';

export class NotificationController {
  private notificationService = new NotificationService();

  public findByUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const notifications = await this.notificationService.findByUser(userId);
      res.status(200).json(notifications);
    } catch (error) {
      next(error);
    }
  };

  public markAsRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const notificationId = parseInt(req.params.id, 10);

      if (isNaN(notificationId)) {
        throw new BadRequestError('ID da notificação inválido.');
      }

      await this.notificationService.markAsRead(notificationId, userId);
      res.status(204).send(); // 204 No Content
    } catch (error) {
      next(error);
    }
  };

  public getUnreadCount = async (req: AuthRequest, res: Response, next: NextFunction) => {
    // This is handled by the chatStore in the frontend for now, but could be a backend endpoint.
    res.status(200).json({ count: 0 });
  };
}