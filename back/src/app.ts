import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mainRouter from './routes';
import adminRouter from './routes/admin.router';
import ratingRouter from './routes/rating.router';
import favoriteRouter from './routes/favorite.routes';
import { errorHandler } from './middlewares/error.handler';

export async function createApp(): Promise<Express> {
  const app = express();
  const isTestEnv = process.env.NODE_ENV === 'test';
  const defaultDevOrigins = ['http://localhost:5173', 'http://localhost:5174'];
  const configuredOrigins = (process.env.FRONTEND_URL || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  const allowedOrigins = [...new Set([...defaultDevOrigins, ...configuredOrigins])];

  app.use(helmet());
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: isTestEnv ? 10000 : 300,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        callback(new Error('Origem não permitida pelo CORS'));
      },
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use('/uploads', express.static('uploads'));

  app.use('/api', mainRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/ratings', ratingRouter);
  app.use('/api/favorites', favoriteRouter);

  app.use(errorHandler);

  return app;
}
