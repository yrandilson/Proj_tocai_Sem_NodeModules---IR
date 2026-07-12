import webpush from 'web-push';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';

export class PushNotificationService {
  private userRepository = AppDataSource.getRepository(User);

  constructor() {
    if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY && process.env.VAPID_SUBJECT) {
      webpush.setVapidDetails(
        process.env.VAPID_SUBJECT,
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
      );
    } else {
      console.warn('⚠️ Chaves VAPID não configuradas. Notificações push estarão desativadas.');
    }
  }

  async sendNotification(userId: number, payload: object): Promise<void> {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });

      if (!user || !user.pushSubscription) {
        console.log(`Usuário ${userId} não tem inscrição para push ou não foi encontrado.`);
        return;
      }

      const subscription = JSON.parse(user.pushSubscription);
      const payloadString = JSON.stringify(payload);

      await webpush.sendNotification(subscription, payloadString);
      console.log(`✅ Notificação push enviada para o usuário ${userId}.`);
    } catch (error: any) {
      console.error(`❌ Erro ao enviar notificação push para o usuário ${userId}:`, error.message);
      // Se a inscrição for inválida (ex: 410 Gone), devemos removê-la do banco
      if (error.statusCode === 410 || error.statusCode === 404) {
        console.log(`Removendo inscrição inválida para o usuário ${userId}.`);
        await this.userRepository.update({ id: userId }, { pushSubscription: null });
      }
    }
  }

  async saveSubscription(userId: number, subscription: object): Promise<void> {
    await this.userRepository.update({ id: userId }, { pushSubscription: JSON.stringify(subscription) });
  }

  async deleteSubscription(userId: number): Promise<void> {
    await this.userRepository.update({ id: userId }, { pushSubscription: null });
  }
}