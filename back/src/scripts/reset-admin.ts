import 'reflect-metadata';
import 'dotenv/config'; // Garante que as variáveis de ambiente sejam carregadas
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { UserRole } from '../types';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

/**
 * Script para criar ou resetar o usuário administrador.
 * Use este script quando o admin não conseguir logar
 */
const resetAdmin = async () => {
  try {
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║  🔧  SCRIPT DE RESET DO ADMINISTRADOR                    ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    // Inicializa a conexão com o banco de dados
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    console.log('✅  Conexão com o banco de dados estabelecida.\n');

    const userRepository = AppDataSource.getRepository(User);

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@trocaai.com';
    // Gera uma senha segura se não estiver definida no .env
    const adminPassword = process.env.ADMIN_PASSWORD || crypto.randomBytes(16).toString('hex');


    // Busca o administrador existente pelo email
    const existingAdmin = await userRepository.findOne({ 
      where: { email: adminEmail } 
    });

    if (existingAdmin) {
      console.log('🔶  Usuário administrador encontrado. Atualizando...\n');
      
      // Atualiza a senha e garante que o role é admin
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      existingAdmin.senha = hashedPassword;
      existingAdmin.role = UserRole.ADMIN;
      existingAdmin.nome = 'Administrador';

      await userRepository.save(existingAdmin);
      
      console.log('✅  Usuário administrador atualizado com sucesso!\n');
    } else {
      console.log('🆕  Criando novo usuário administrador...\n');
      
      // Cria novo administrador
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      
      const admin = userRepository.create({
        nome: 'Administrador',
        email: adminEmail,
        senha: hashedPassword,
        role: UserRole.ADMIN
      });

      await userRepository.save(admin);
      console.log('✅  Usuário administrador criado com sucesso!\n');
    }

    console.log('   ════════════════════════════════════════════════════════');
    console.log(`   📧 Email:  ${adminEmail}`);
    console.log(`   🔐 Senha:  ${adminPassword}`);
    console.log('   ════════════════════════════════════════════════════════\n');
    console.log('   ⚠️  IMPORTANTE: Altere a senha após o primeiro login!');
    console.log('   ⚠️  Use esta senha EXATAMENTE como mostrado (case-sensitive)\n');

    // Teste de login
    console.log('🔍  Verificando credenciais recém-criadas/atualizadas...\n');
    const testUser = await userRepository.findOne({ 
      where: { email: adminEmail } 
    });
    
    if (testUser) {
      const isValidPassword = await bcrypt.compare(adminPassword, testUser.senha);
      
      if (isValidPassword) {
        console.log('✅  Verificação de credenciais: SUCESSO');
        console.log(`   ID: ${testUser.id}`);
        console.log(`   Nome: ${testUser.nome}`);
        console.log(`   Email: ${testUser.email}`);
        console.log(`   Role: ${testUser.role}\n`);
      } else {
        console.log('❌  Verificação de credenciais: FALHOU (hash de senha inválido).\n');
      }
    } else {
      console.log('❌  Verificação de credenciais: FALHOU (usuário não encontrado após a operação).\n');
    }

  } catch (error) {
    console.error('\n❌  Erro ao resetar administrador:', error);
    if (error instanceof Error) {
      console.error('   Mensagem:', error.message);
      console.error('   Stack:', error.stack);
    }
  } finally {
    // Fecha a conexão com o banco de dados
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('🔌  Conexão com o banco de dados fechada.\n');
    }
  }
};

resetAdmin().catch(err => {
  console.error("Ocorreu um erro inesperado ao executar o script:", err);
});