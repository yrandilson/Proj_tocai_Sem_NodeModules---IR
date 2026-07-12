import 'dotenv/config';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { Item } from '../entities/Item';
import { Image } from '../entities/image.entity';
import { Proposal } from '../entities/Proposal';
import { Notification } from '../entities/Notification';
import { Rating } from '../entities/Rating';
import { ChatMessage } from '../entities/ChatMessage';
import { TradePreference } from '../entities/TradePreference';
import { Report } from '../entities/Report';
import { Favorite } from '../entities/Favorite'; 
import { ReportHistory } from '../entities/ReportHistory';
import { RefreshToken } from '../entities/RefreshToken';

// Sua lista de entidades (parece correta)
export const entities = [
  User,
  Item,
  Image,
  Proposal,
  Notification,
  Rating,
  ChatMessage,
  TradePreference,
  Report,
  Favorite, 
  ReportHistory,
  RefreshToken,
];

// synchronize apenas em development — NUNCA em produção ou staging (risco de perda de dados)
const shouldSynchronize = process.env.NODE_ENV === 'development';
const dbType = (process.env.DB_TYPE || 'sqlite').toLowerCase();
const isDevelopment = process.env.NODE_ENV === 'development';

export const AppDataSource =
  dbType === 'mysql'
    ? new DataSource({
        type: 'mysql',
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT || 3306),
        username: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || '',
        database: process.env.DB_NAME || 'trocaai_dev',
        synchronize: shouldSynchronize,
        logging: isDevelopment ? ['query', 'error'] : ['error'],
        entities,
        migrations: [__dirname + '/../migrations/*{.ts,.js}'],
        subscribers: [],
        charset: 'utf8mb4_unicode_ci',
      })
    : new DataSource({
        type: 'sqlite',
        database: process.env.DB_DATABASE || 'database.sqlite',
        synchronize: shouldSynchronize,
        logging: isDevelopment ? ['query', 'error'] : ['error'],
        entities,
        migrations: [__dirname + '/../migrations/*{.ts,.js}'],
        subscribers: [],
      });