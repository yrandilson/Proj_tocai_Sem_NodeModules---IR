import bcrypt from 'bcryptjs';
import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { UserRole } from '../types';
import crypto from 'crypto';

export async function seedAdmin(dataSource: DataSource) {
  if (!dataSource.isInitialized) {
    console.log('🟡  A conexão com o banco de dados não está pronta. Pulando o seed do admin.');
    return;
  }

  console.log('\n🔍  Verificando a existência do usuário administrador...');

  const userRepository = dataSource.getRepository(User);
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@trocaai.com';
  // Gera uma senha segura se não estiver definida no .env
  // Em produção, a senha DEVE ser definida no .env
  const adminPassword = process.env.ADMIN_PASSWORD || crypto.randomBytes(16).toString('hex');

  try {
    const adminExists = await userRepository.findOne({ where: { email: adminEmail } });

    if (!adminExists) {
      console.log('🆕  Administrador não encontrado. Criando um novo...');
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      const admin = userRepository.create({
        nome: 'Administrador',
        email: adminEmail,
        senha: hashedPassword,
        role: UserRole.ADMIN,
      });
      await userRepository.save(admin);
      console.log('✅  Administrador criado com sucesso!');
      console.log('   ------------------------------------');
      console.log(`   📧 Email: ${adminEmail}`);
      console.log('   🔑 Senha gerada (salve em local seguro!):');
      console.log(`   🔑 Senha: ${adminPassword}`);
      console.log('   ------------------------------------\n');
    } else {
      console.log('✅  O usuário administrador já existe no banco de dados.\n');
    }
  } catch (error) {
    console.error('❌  Ocorreu um erro grave ao tentar criar o administrador:', error);
  }
}