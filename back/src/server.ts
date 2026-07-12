import 'reflect-metadata';
import 'dotenv/config';
// Valida env vars imediatamente — falha rápido se algo estiver faltando
import './config/env';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { AppDataSource } from './config/database';
import { ChatSocketHandler } from './websocket/chat.socket';
import logger from './config/logger';
import { seedAdmin } from './scripts/seedAdmin';
import { createApp } from './app';

/**
 * Tenta conectar ao banco com retry.
 * Útil em Docker onde o MySQL demora alguns segundos para aceitar conexões
 * mesmo depois do healthcheck passar.
 */
async function connectWithRetry(retries = 10, delayMs = 3000): Promise<void> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await AppDataSource.initialize();
      logger.info('✅ Fonte de dados inicializada com sucesso!');
      return;
    } catch (err) {
      const isLast = attempt === retries;
      logger.warn(`⏳ Banco não disponível (tentativa ${attempt}/${retries})${isLast ? ' — desistindo.' : ` — aguardando ${delayMs / 1000}s...`}`);
      if (isLast) throw err;
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
}

export async function startServer() {
  try {
    await connectWithRetry();

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

    return app;
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
