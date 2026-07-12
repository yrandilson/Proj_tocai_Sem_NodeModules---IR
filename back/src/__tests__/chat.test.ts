import request from 'supertest';
import { app } from './setup';
import { AppDataSource } from '../config/database';
import { ItemStatus } from '../types';

// Variáveis de autenticação e dados de teste
let tokenUserG: string;
let tokenUserH: string;
let userGId: number;
let userHId: number;
let itemGId: number;

// Dados de teste
const userGData = { nome: 'User Chat G', email: 'chatg@test.com', senha: 'password' };
const userHData = { nome: 'User Chat H', email: 'chath@test.com', senha: 'password' };

const itemGData = {
  titulo: 'Item para Chat',
  descricao: 'Descrição do Item G',
  categoria: 'Livros',
};

beforeAll(async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  
  // 1. Criar usuários
  await request(app).post('/api/auth/register').send(userGData);
  await request(app).post('/api/auth/register').send(userHData);
  
  // 2. Logar e obter tokens
  const resLoginG = await request(app).post('/api/auth/login').send(userGData);
  tokenUserG = resLoginG.body.token;
  userGId = resLoginG.body.user.id;
  
  const resLoginH = await request(app).post('/api/auth/login').send(userHData);
  tokenUserH = resLoginH.body.token;
  userHId = resLoginH.body.user.id;

  // 3. Criar Item G (do User G)
  const resItemG = await request(app)
    .post('/api/items')
    .set('Authorization', `Bearer ${tokenUserG}`)
    .field('titulo', itemGData.titulo)
    .field('descricao', itemGData.descricao)
    .field('categoria', itemGData.categoria)
    .field('status', ItemStatus.DISPONIVEL)
    .field('tradePreferences', 'Jogos')
    .expect(201);
  itemGId = resItemG.body.id;
});

afterAll(async () => {
  // Limpeza do banco de dados de teste é feita no setup.ts
});

describe('Chat Functionalities', () => {
  
  it('should allow a user to send a message and create a conversation', async () => {
    const messageContent = 'Olá, tenho interesse no seu item!';
    
    const res = await request(app)
      .post('/api/chat/messages')
      .set('Authorization', `Bearer ${tokenUserH}`) // User H envia para User G
      .send({ receiverId: userGId, itemId: itemGId, content: messageContent })
      .expect(201);

    expect(res.body.content).toBe(messageContent);
    expect(res.body.senderId).toBe(userHId);
    expect(res.body.receiverId).toBe(userGId);
  });
  
  it('should list the new conversation for both users', async () => {
    // 1. Verificar lista de conversas do User H
    const resH = await request(app)
      .get('/api/chat/conversations')
      .set('Authorization', `Bearer ${tokenUserH}`)
      .expect(200);

    expect(resH.body.length).toBe(1);
    expect(resH.body[0].otherUser.id).toBe(userGId);
    expect(resH.body[0].item.id).toBe(itemGId);
    
    // 2. Verificar lista de conversas do User G
    const resG = await request(app)
      .get('/api/chat/conversations')
      .set('Authorization', `Bearer ${tokenUserG}`)
      .expect(200);

    expect(resG.body.length).toBe(1);
    expect(resG.body[0].otherUser.id).toBe(userHId);
    expect(resG.body[0].item.id).toBe(itemGId);
  });
  
  it('should list all messages in a conversation', async () => {
    // User G responde
    await request(app)
      .post('/api/chat/messages')
      .set('Authorization', `Bearer ${tokenUserG}`)
      .send({ receiverId: userHId, itemId: itemGId, content: 'Claro, podemos conversar!' })
      .expect(201);
      
    // User H busca as mensagens
    const resMessages = await request(app)
      .get(`/api/chat/messages/${userGId}/${itemGId}`)
      .set('Authorization', `Bearer ${tokenUserH}`)
      .expect(200);
      
    expect(resMessages.body.length).toBe(2);
    expect(resMessages.body[1].content).toBe('Claro, podemos conversar!');
  });
});

