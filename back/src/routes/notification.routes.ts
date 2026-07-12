import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { PushNotificationService } from '../services/push-notification.service';
import { AuthRequest } from '../types';

const router = Router();
const pushService = new PushNotificationService();

// Middleware de autenticação para todas as rotas de notificação
router.use(authMiddleware);

router.get('/vapid-public-key', (req, res) => {
  if (!process.env.VAPID_PUBLIC_KEY) {
    return res.status(500).json({ error: 'Chave VAPID pública não configurada no servidor.' });
  }
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
});

router.post('/subscribe', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const subscription = req.body.subscription;
    await pushService.saveSubscription(userId, subscription);
    res.status(201).json({ message: 'Inscrição salva com sucesso.' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao salvar inscrição.' });
  }
});

router.post('/unsubscribe', async (req: AuthRequest, res) => {
  try {
    await pushService.deleteSubscription(req.userId!);
    res.status(200).json({ message: 'Inscrição removida com sucesso.' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover inscrição.' });
  }
});

export default router;