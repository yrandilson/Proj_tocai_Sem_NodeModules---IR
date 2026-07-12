import request from 'supertest';
import { app } from './setup';
import { AppDataSource } from '../config/database';
import { UserRole } from '../types';

// Dados de teste
const testUserData = { nome: 'User Auth Test', email: 'auth@test.com', senha: 'password123' };
const updateData = { nome: 'User Auth Updated', telefone: '11999999999' };
let userId: number;
let userToken: string;

beforeAll(async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
});

afterAll(async () => {
  // Limpeza do banco de dados de teste é feita no setup.ts
});

describe('Authentication Functionalities', () => {
  
  it('should allow a new user to register', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUserData)
      .expect(201);

    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(testUserData.email);
    expect(res.body.user.role).toBe(UserRole.COMMON);
    userId = res.body.user.id;
    userToken = res.body.token;
  });

  it('should allow a registered user to login', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUserData.email, senha: testUserData.senha })
      .expect(200);

    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(testUserData.email);
  });

  it('should reject login with incorrect password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUserData.email, senha: 'wrongpassword' })
      .expect(401);

    expect(res.body.error).toBe('Credenciais inválidas.');
  });
});

describe('User Profile Functionalities', () => {
  
  it('should allow a user to read their own profile', async () => {
    const res = await request(app)
      .get(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(res.body.id).toBe(userId);
    expect(res.body.nome).toBe(testUserData.nome);
  });

  it('should allow a user to update their profile', async () => {
    const res = await request(app)
      .put(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send(updateData)
      .expect(200);

    expect(res.body.nome).toBe(updateData.nome);
    expect(res.body.telefone).toBe(updateData.telefone);
  });
  
  it('should reject unauthorized profile update', async () => {
    await request(app)
      .put(`/api/users/${userId}`)
      .send({ nome: 'Hacker' })
      .expect(401); // Sem token
  });
});

