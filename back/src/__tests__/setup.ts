import { createApp } from '../app';
import 'dotenv/config';
import 'reflect-metadata';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { UserRole } from '../types';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export let app; // 👈 Exporta o app para os testes usarem
export let tokenAdmin: string; // 👈 Exporta tokens para os testes
export let tokenUser: string;
export let adminUser: User;
export let normalUser: User;

beforeAll(async () => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ Conexão com o banco de dados de teste estabelecida.');
    }

    // 👇 Aqui criamos a instância do app Express para o supertest
    app = await createApp();
    console.log('🚀 Aplicação Express de teste inicializada.');

    // 👇 CRIAR USUÁRIOS DE TESTE E TOKENS
    const userRepository = AppDataSource.getRepository(User);
    
    // Criar Admin
    adminUser = userRepository.create({
      nome: 'Admin User',
      email: 'admin@test.com',
      senha: await bcrypt.hash('admin123', 10),
      role: UserRole.ADMIN,
      telefone: '11999999999',
    });
    await userRepository.save(adminUser);

    // Criar Usuário Normal Verificado
    normalUser = userRepository.create({
      nome: 'Normal User',
      email: 'user@test.com',
      senha: await bcrypt.hash('user123', 10),
      role: UserRole.VERIFIED,
      telefone: '11988888888',
    });
    await userRepository.save(normalUser);

    // Gerar tokens JWT
    const jwtSecret = process.env.JWT_SECRET || 'test-secret-key';
    
    tokenAdmin = jwt.sign(
      { userId: adminUser.id, role: adminUser.role },
      jwtSecret,
      { expiresIn: '1h' }
    );

    tokenUser = jwt.sign(
      { userId: normalUser.id, role: normalUser.role },
      jwtSecret,
      { expiresIn: '1h' }
    );

  } catch (error) {
    console.error('❌ Erro ao inicializar o ambiente de teste:', error);
    throw error;
  }
});

// Limpa o banco e encerra após todos os testes
afterAll(async () => {
  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('✅ Conexão com o banco de dados de teste encerrada.');
    }
  } catch (error) {
    console.error('❌ Erro ao encerrar o banco de dados de teste:', error);
    throw error;
  }
});