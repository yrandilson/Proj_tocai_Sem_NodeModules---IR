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
import { Favorite } from '../entities/Favorite'; // Importe a nova entidade
import { ReportHistory } from '../entities/ReportHistory';

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
  Favorite, // Adicione a nova entidade
  ReportHistory, // Adicione a nova entidade
];

export const AppDataSource = new DataSource({
  type: 'sqlite',
  // O banco de dados será um arquivo chamado 'database.sqlite' na raiz do backend.
  database: process.env.DB_DATABASE || 'database.sqlite',
  // 🔴 CORREÇÃO: Desativar synchronize para evitar que o banco de dados seja apagado a cada reinicialização.
  // Isso é crucial para que os dados persistam entre os testes.
  // Se precisar recriar o banco, delete o arquivo 'database.sqlite' manualmente.
  synchronize: true,
  logging: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
  entities: entities,
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  subscribers: [],
});