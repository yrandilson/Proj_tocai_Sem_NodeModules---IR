import request from 'supertest';
import { app } from './setup'; // 👈 importa a instância do Express criada no setup
import { UserRole } from '../types';

// Variáveis de autenticação e dados de teste
let tokenUserE: string;
let tokenUserF: string;
let userEId: number;
let userFId: number;
let itemEId: number;
let proposalId: number;

// Dados de teste
const userEData = { nome: 'User Teste E', email: 'userteste@test.com', senha: 'password' };
const userFData = { nome: 'User Teste F', email: 'usertestf@test.com', senha: 'password' };

// Item com localização próxima a SP (simulando Item E)
const itemEData = {
  titulo: 'Item E - para troca e avaliacao',
  descricao: 'Descrição do Item E',
  categoria: 'Eletrônicos',
  latitude: -23.5505, 
  longitude: -46.6333,
};

beforeAll(async () => {
  // 1. Criar usuários
  await request(app).post('/api/auth/register').send(userEData);
  await request(app).post('/api/auth/register').send(userFData);
  
  // 2. Logar e obter tokens
  const resLoginE = await request(app).post('/api/auth/login').send(userEData);
  tokenUserE = resLoginE.body.token;
  userEId = resLoginE.body.user.id;
  
  const resLoginF = await request(app).post('/api/auth/login').send(userFData);
  tokenUserF = resLoginF.body.token;
  userFId = resLoginF.body.user.id;

  // 3. Criar Item E (do User E)
  const resItemE = await request(app)
    .post('/api/items')
    .set('Authorization', `Bearer ${tokenUserE}`)
    .field('titulo', itemEData.titulo)
    .field('descricao', itemEData.descricao)
    .field('categoria', itemEData.categoria)
    .field('latitude', itemEData.latitude)
    .field('longitude', itemEData.longitude)
    .field('status', 'disponivel')
    .field('tradePreferences', 'Livros')
    .expect(201);
  itemEId = resItemE.body.id;
  
  // 4. Criar Proposta (User F propõe para Item E do User E)
  const resProposal = await request(app)
    .post('/api/proposals')
    .set('Authorization', `Bearer ${tokenUserF}`)
    .send({
      itemId: itemEId,
      offeredItemIds: [],
      mensagem: 'Tenho interesse no seu item!',
    })
    .expect(201);
  proposalId = resProposal.body.id;

  // 5. Aceitar Proposta (User E aceita a proposta de User F)
  await request(app)
    .patch(`/api/proposals/${proposalId}/status`)
    .set('Authorization', `Bearer ${tokenUserE}`)
    .send({ status: 'aceita' })
    .expect(200);
});

describe('Rating and Chat Functionalities (P1 & P3)', () => {
  
  // Teste P1: Sistema de Feedback Detalhado
  it('should allow user to submit detailed rating (P1)', async () => {
    const ratingData = {
      toUserId: userEId, // User F avalia User E
      proposalId: proposalId,
      value: 5,
      comment: 'Ótima troca! Usuário muito atencioso.',
      itemConformeDescricao: true,
      comunicacaoClara: true,
      prazoCumprido: false, // Simula um prazo não cumprido
      recomendariaUsuario: true,
    };

    const res = await request(app)
      .post('/api/ratings')
      .set('Authorization', `Bearer ${tokenUserF}`) // User F (proposer) avalia User E (owner)
      .send(ratingData)
      .expect(201);

    expect(res.body.value).toBe(5);
    expect(res.body.comment).toBe(ratingData.comment);
    expect(res.body.prazoCumprido).toBe(false);
    expect(res.body.recomendariaUsuario).toBe(true);
  });

  // Teste P3: Arquivamento Automático de Conversas
  it('should soft-delete (archive) a conversation (P3)', async () => {
    // 1. Enviar mensagens para criar a conversa
    await request(app)
      .post('/api/chat/messages')
      .set('Authorization', `Bearer ${tokenUserE}`)
      .send({ receiverId: userFId, itemId: itemEId, content: 'Mensagem 1' })
      .expect(201);

    await request(app)
      .post('/api/chat/messages')
      .set('Authorization', `Bearer ${tokenUserF}`)
      .send({ receiverId: userEId, itemId: itemEId, content: 'Mensagem 2' })
      .expect(201);
      
    // 2. Verificar se a conversa existe
    const resConversationsBefore = await request(app)
      .get('/api/chat/conversations')
      .set('Authorization', `Bearer ${tokenUserE}`)
      .expect(200);
      
    expect(resConversationsBefore.body.length).toBe(1);

    // 3. Arquivar a conversa
    await request(app)
      .delete(`/api/chat/conversations/${userFId}/${itemEId}`)
      .set('Authorization', `Bearer ${tokenUserE}`)
      .expect(200);
      
    // 4. Verificar se a conversa foi arquivada (não deve aparecer na lista)
    const resConversationsAfter = await request(app)
      .get('/api/chat/conversations')
      .set('Authorization', `Bearer ${tokenUserE}`)
      .expect(200);
      
    expect(resConversationsAfter.body.length).toBe(0);
  });
});