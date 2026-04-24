import 'reflect-metadata';
import 'dotenv/config';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { AppDataSource } from './config/database';
import { ChatSocketHandler } from './websocket/chat.socket';
import logger from './config/logger';
import { seedAdmin } from './scripts/seedAdmin';
import { createApp } from './app'; // <-- importa a função nova

export async function startServer() {
  try {
    await AppDataSource.initialize();
    logger.info('✅ Fonte de dados inicializada com sucesso!');

    await seedAdmin(AppDataSource);

    const app = await createApp();
    const port = process.env.PORT || 3000;

    const httpServer = createServer(app);
    const io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
      },
    });

    ChatSocketHandler.getInstance(io);
    logger.info('🔌 WebSocket Handler inicializado.');

    httpServer.listen(port, () => {
      logger.info(`🚀 Servidor rodando na porta ${port}`);
    });

    return app; // <-- importante para testes (opcional)
  } catch (error) {
    logger.error('❌ Erro fatal durante inicialização:', error);
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
  }
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}
