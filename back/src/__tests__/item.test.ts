import request from 'supertest';
import { app } from './setup'; // 👈 importa a instância do Express criada no setup

// Variáveis de autenticação e dados de teste
let tokenUserA: string;
let tokenUserB: string;
let itemAId: number;
let itemBId: number;

// Dados de teste
const userAData = { nome: 'User Teste A', email: 'usertesta@test.com', senha: 'password' };
const userBData = { nome: 'User Teste B', email: 'usertestb@test.com', senha: 'password' };
const adminData = { nome: 'Admin Teste', email: 'admintest@test.com', senha: 'password' };

// Item com localização próxima a SP (simulando Item A)
const itemAData = {
  titulo: 'Item A - Perto de SP',
  descricao: 'Descrição do Item A para teste de busca',
  categoria: 'Eletrônicos',
  latitude: -23.5505, // SP
  longitude: -46.6333, // SP
};

// Item com localização distante (simulando Item B)
const itemBData = {
  titulo: 'Item B - Longe de SP',
  descricao: 'Descrição do Item B para teste de localização',
  categoria: 'Móveis',
  latitude: -15.7801, // Brasília
  longitude: -47.9292, // Brasília
};

beforeAll(async () => {
  // 1. Criar usuários
  await request(app).post('/api/auth/register').send(userAData);
  await request(app).post('/api/auth/register').send(userBData);
  await request(app).post('/api/auth/register').send(adminData);
  
  // 2. Logar e obter tokens
  const resLoginA = await request(app).post('/api/auth/login').send(userAData);
  tokenUserA = resLoginA.body.token;
  
  const resLoginB = await request(app).post('/api/auth/login').send(userBData);
  tokenUserB = resLoginB.body.token;

  // 3. Criar Item A (do User A)
  const resItemA = await request(app)
    .post('/api/items')
    .set('Authorization', `Bearer ${tokenUserA}`)
    .field('titulo', itemAData.titulo)
    .field('descricao', itemAData.descricao)
    .field('categoria', itemAData.categoria)
    .field('latitude', itemAData.latitude)
    .field('longitude', itemAData.longitude)
    .field('status', 'disponivel')
    .field('tradePreferences', 'Livros')
    .expect(201);
  itemAId = resItemA.body.id;

  // 4. Criar Item B (do User B)
  const resItemB = await request(app)
    .post('/api/items')
    .set('Authorization', `Bearer ${tokenUserB}`)
    .field('titulo', itemBData.titulo)
    .field('descricao', itemBData.descricao)
    .field('categoria', itemBData.categoria)
    .field('latitude', itemBData.latitude)
    .field('longitude', itemBData.longitude)
    .field('status', 'disponivel')
    .field('tradePreferences', 'Jogos')
    .expect(201);
  itemBId = resItemB.body.id;
});

afterAll(async () => {
  // Limpeza do banco de dados de teste é feita no setup.ts
});

describe('Item Functionalities (P1 & P3)', () => {
  
  // Teste P3: Otimização de Busca (Full-Text Search)
  it('should return items matching keywords in title or description (P3)', async () => {
    // Busca por palavra na descrição do Item A
    const res = await request(app)
      .get('/api/items')
      .query({ search: 'busca' })
      .expect(200);

    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].id).toBe(itemAId);
  });

  // Teste P1: Filtro de Busca por Localização (Raio)
  it('should return only items within the specified radius (P1)', async () => {
    // Localização de SP: -23.5505, -46.6333
    // Item A (SP) está a 0km. Item B (Brasília) está a ~900km.

    // 1. Busca com raio pequeno (5km) - Deve encontrar apenas Item A
    const resSmallRadius = await request(app)
      .get('/api/items')
      .query({ 
        latitude: itemAData.latitude, 
        longitude: itemAData.longitude, 
        raio: 5 
      })
      .expect(200);

    expect(resSmallRadius.body.data.length).toBe(1);
    expect(resSmallRadius.body.data[0].id).toBe(itemAId);

    // 2. Busca com raio grande (1000km) - Deve encontrar Item A e Item B
    const resLargeRadius = await request(app)
      .get('/api/items')
      .query({ 
        latitude: itemAData.latitude, 
        longitude: itemAData.longitude, 
        raio: 1000 
      })
      .expect(200);

    expect(resLargeRadius.body.data.length).toBe(2);
  });

  // Teste P1: Filtro de Busca por Localização (Raio) - Item distante
  it('should not return items outside the specified radius (P1)', async () => {
    // Localização de SP: -23.5505, -46.6333
    // Item B (Brasília) está a ~900km.

    // Busca com raio de 100km, a partir de SP. Não deve encontrar Item B.
    const res = await request(app)
      .get('/api/items')
      .query({ 
        latitude: itemAData.latitude, 
        longitude: itemAData.longitude, 
        raio: 100 
      })
      .expect(200);

    expect(res.body.data.some((item: any) => item.id === itemBId)).toBe(false);
  });
});

