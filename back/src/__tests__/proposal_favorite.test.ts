import request from 'supertest';
import { app } from './setup'; // 👈 importa a instância do Express criada no setup
import { ItemStatus } from '../types';

// Variáveis de autenticação e dados de teste
let tokenOwner: string;
let tokenProposer: string;
let itemId: number;
let offeredItemId: number;
let proposalId: number;

// Dados de teste
const ownerData = { nome: 'Item Owner', email: 'owner@test.com', senha: 'password' };
const proposerData = { nome: 'Proposer', email: 'proposer@test.com', senha: 'password' };

const itemData = {
  titulo: 'Item para Proposta',
  descricao: 'Descrição do Item Principal',
  categoria: 'Livros',
  status: ItemStatus.DISPONIVEL,
  tradePreferences: 'Jogos',
};

const offeredItemData = {
  titulo: 'Item Oferecido',
  descricao: 'Descrição do Item Oferecido',
  categoria: 'Jogos',
  status: ItemStatus.DISPONIVEL,
  tradePreferences: 'Livros',
};

beforeAll(async () => {
  // 1. Criar usuários
  await request(app).post('/api/auth/register').send(ownerData);
  await request(app).post('/api/auth/register').send(proposerData);
  
  // 2. Logar e obter tokens
  const resLoginOwner = await request(app).post('/api/auth/login').send(ownerData);
  tokenOwner = resLoginOwner.body.token;
  
  const resLoginProposer = await request(app).post('/api/auth/login').send(proposerData);
  tokenProposer = resLoginProposer.body.token;

  // 3. Criar Item Principal (do Owner)
  const resItem = await request(app)
    .post('/api/items')
    .set('Authorization', `Bearer ${tokenOwner}`)
    .field('titulo', itemData.titulo)
    .field('descricao', itemData.descricao)
    .field('categoria', itemData.categoria)
    .field('status', itemData.status)
    .field('tradePreferences', itemData.tradePreferences)
    .expect(201);
  itemId = resItem.body.id;
  
  // 4. Criar Item Oferecido (do Proposer)
  const resOfferedItem = await request(app)
    .post('/api/items')
    .set('Authorization', `Bearer ${tokenProposer}`)
    .field('titulo', offeredItemData.titulo)
    .field('descricao', offeredItemData.descricao)
    .field('categoria', offeredItemData.categoria)
    .field('status', offeredItemData.status)
    .field('tradePreferences', offeredItemData.tradePreferences)
    .expect(201);
  offeredItemId = resOfferedItem.body.id;
});

describe('Proposal Functionalities', () => {
  
  it('should allow a user to create a proposal', async () => {
    const res = await request(app)
      .post('/api/proposals')
      .set('Authorization', `Bearer ${tokenProposer}`)
      .send({
        itemId: itemId,
        offeredItemIds: [offeredItemId],
        mensagem: 'Proposta de troca!',
      })
      .expect(201);
      
    expect(res.body.status).toBe('pendente');
    proposalId = res.body.id;
  });
  
  it('should allow the item owner to accept a proposal', async () => {
    const res = await request(app)
      .patch(`/api/proposals/${proposalId}/status`)
      .set('Authorization', `Bearer ${tokenOwner}`)
      .send({ status: 'aceita' })
      .expect(200);
      
    expect(res.body.status).toBe('aceita');
  });
  
  it('should allow the item owner to reject a proposal', async () => {
    // 👇 CORREÇÃO: Criar um NOVO item para esta proposta
    const resNewItem = await request(app)
      .post('/api/items')
      .set('Authorization', `Bearer ${tokenOwner}`)
      .field('titulo', 'Item para Rejeitar')
      .field('descricao', 'Outro item')
      .field('categoria', 'Livros')
      .field('status', ItemStatus.DISPONIVEL)
      .field('tradePreferences', 'Jogos')
      .expect(201);

    const newItemId = resNewItem.body.id;

    // Agora criar proposta para este novo item
    const resNewProposal = await request(app)
      .post('/api/proposals')
      .set('Authorization', `Bearer ${tokenProposer}`)
      .send({
        itemId: newItemId, // ← usar novo item
        offeredItemIds: [],
        mensagem: 'Proposta para rejeitar!',
      })
      .expect(201);
      
    const newProposalId = resNewProposal.body.id;
    
    const res = await request(app)
      .patch(`/api/proposals/${newProposalId}/status`)
      .set('Authorization', `Bearer ${tokenOwner}`)
      .send({ status: 'recusada' }) // ← usar 'recusada' não 'rejeitada'
      .expect(200);
      
    expect(res.body.status).toBe('recusada');
  });
});

describe('Favorite Functionalities', () => {
  
  it('should allow a user to add an item to favorites', async () => {
    await request(app)
      .post(`/api/favorites/${itemId}`)
      .set('Authorization', `Bearer ${tokenProposer}`)
      .expect(201);
      
    // Verifica se o item foi adicionado
    const resList = await request(app)
      .get('/api/favorites')
      .set('Authorization', `Bearer ${tokenProposer}`)
      .expect(200);
      
    expect(resList.body.length).toBeGreaterThanOrEqual(1);
    expect(resList.body.some((fav: any) => fav.item.id === itemId)).toBe(true);
  });
  
  it('should allow a user to remove an item from favorites', async () => {
    await request(app)
      .delete(`/api/favorites/${itemId}`)
      .set('Authorization', `Bearer ${tokenProposer}`)
      .expect(200);
      
    // Verifica se o item foi removido
    const resList = await request(app)
      .get('/api/favorites')
      .set('Authorization', `Bearer ${tokenProposer}`)
      .expect(200);
      
    expect(resList.body.some((fav: any) => fav.item.id === itemId)).toBe(false);
  });
});