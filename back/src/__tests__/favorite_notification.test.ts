import request from 'supertest';
import { app } from './setup'; // 👈 importa a instância do Express criada no setup
import { ItemStatus, NotificationType } from '../types'; // Adicionei NotificationType se precisar no futuro
import { User } from '../entities/User'; // Importe User se precisar acessar o repositório
import { AppDataSource } from '../config/database'; // Importe AppDataSource se precisar do repositório

// Variáveis de autenticação e dados de teste
let tokenUserG: string;
let tokenUserH: string;
let userGId: number; // Adicionado para clareza
let userHId: number; // Adicionado para clareza
let itemGId: number;

// Dados de teste
const userGData = { nome: 'User Teste G', email: 'usertestg@test.com', senha: 'password' };
const userHData = { nome: 'User Teste H', email: 'usertesth@test.com', senha: 'password' };

// Item que será favoritado
const itemGData = {
  titulo: 'Item G - para notificação',
  descricao: 'Descrição do Item G',
  categoria: 'Livros',
};

// Hook beforeAll para criar dados uma vez antes de todos os testes neste arquivo
// IMPORTANTE: Isso funcionará SE o beforeEach global em setup.ts APENAS LIMPAR o banco.
// Se o beforeEach global RECRIAR usuários admin/normal, pode haver conflito de IDs.
beforeAll(async () => {
  // 1. Criar usuários
  const resRegG = await request(app).post('/api/auth/register').send(userGData);
  userGId = resRegG.body.user.id; // Guarda o ID
  const resRegH = await request(app).post('/api/auth/register').send(userHData);
  userHId = resRegH.body.user.id; // Guarda o ID

  // 2. Logar e obter tokens
  const resLoginG = await request(app).post('/api/auth/login').send(userGData);
  tokenUserG = resLoginG.body.token;

  const resLoginH = await request(app).post('/api/auth/login').send(userHData);
  tokenUserH = resLoginH.body.token;

  // 3. Criar Item G (do User G) - COMEÇA DISPONÍVEL
  const resItemG = await request(app)
    .post('/api/items')
    .set('Authorization', `Bearer ${tokenUserG}`)
    .field('titulo', itemGData.titulo)
    .field('descricao', itemGData.descricao)
    .field('categoria', itemGData.categoria)
    .field('status', ItemStatus.DISPONIVEL) // 👈 Começa DISPONÍVEL
    // .field('tradePreferences', 'Jogos') // Removido se não for essencial para o teste
    .expect(201);
  itemGId = resItemG.body.id;

  // 4. User H favorita o Item G
  await request(app)
    .post(`/api/favorites/${itemGId}`)
    .set('Authorization', `Bearer ${tokenUserH}`)
    .expect(201);

  // 5. Mudar status para TROCADO (para simular que ficou indisponível)
  await request(app)
    .patch(`/api/items/${itemGId}/status`)
    .set('Authorization', `Bearer ${tokenUserG}`)
    .send({ status: ItemStatus.TROCADO })
    .expect(200);
});

describe('Favorite Notification Functionality (P1)', () => {

  // Teste P1: Notificação de "Item Favorito Disponível"
  it('should send notification when favorited item becomes DISPONIVEL (P1)', async () => {
    // 1. User G (dono do item) muda o status de volta para DISPONIVEL
    await request(app)
      .patch(`/api/items/${itemGId}/status`)
      .set('Authorization', `Bearer ${tokenUserG}`)
      .send({ status: ItemStatus.DISPONIVEL })
      .expect(200);

    // Adiciona um pequeno atraso para dar tempo ao banco/notificação assíncrona
    await new Promise(resolve => setTimeout(resolve, 150)); // Aumentei ligeiramente o tempo

    // 2. User H (que favoritou) busca suas notificações
    const resNotifications = await request(app) // <-- LINHA RECOLOCADA
      .get('/api/notifications')
      .set('Authorization', `Bearer ${tokenUserH}`)
      .expect(200);

    // Log para Debug (opcional, mas útil)
    console.log('[DEBUG] Notificações recebidas para User H:', JSON.stringify(resNotifications.body, null, 2));

    // 3. Verifica se a notificação correta foi criada na resposta da API
    //    (Usando o bloco .find() corrigido para acessar metadata.itemId)
    const notification = resNotifications.body.find((n: any) => {
      if (!n.metadata) return false;
      try {
        const meta = typeof n.metadata === 'string' ? JSON.parse(n.metadata) : n.metadata;
        // Verifica a mensagem E o itemId dentro do metadata
        return n.message?.includes('está novamente disponível') && meta?.itemId === itemGId;
      } catch (e) {
        console.error("Erro ao parsear metadata da notificação no teste:", n.metadata, e);
        return false;
      }
    });

    // 4. Asserções
    expect(notification).toBeDefined(); // Verifica se a notificação foi encontrada
    expect(notification.message).toContain(itemGData.titulo); // Verifica o conteúdo da mensagem
    // (Opcional) Verificar outros campos se necessário
    // expect(notification.type).toBe(NotificationType.ITEM_AVAILABLE);
    // expect(notification.read).toBe(false);
  });
});