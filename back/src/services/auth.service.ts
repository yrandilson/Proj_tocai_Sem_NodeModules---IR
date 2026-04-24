import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRole } from '../types';
import { BadRequestError, UnauthorizedError } from '../errors/http-errors';
import { JWT_CONFIG, getJWTSecret } from '../config/jwt';

export class AuthService {
  private userRepository = AppDataSource.getRepository(User);

  public async register(nome: string, email: string, senha: string): Promise<{ user: Partial<User>; token: string }> {
    if (!nome || !email || !senha) {
      throw new BadRequestError('Nome, email e senha são obrigatórios.');
    }

    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new BadRequestError('Este email já está em uso.');
    }

    const hashedPassword = await bcrypt.hash(senha, 10);
    const newUser = this.userRepository.create({ nome, email, senha: hashedPassword, role: UserRole.COMMON });
    await this.userRepository.save(newUser);

    const token = jwt.sign({ userId: newUser.id, role: newUser.role }, getJWTSecret(), {
      expiresIn: JWT_CONFIG.expiresIn,
    });

    const { senha: _, ...userResponse } = newUser;
    return { user: userResponse, token };
  }

  public async login(email: string, senha: string): Promise<{ user: Partial<User>; token: string }> {
    if (!email || !senha) {
      throw new BadRequestError('Email e senha são obrigatórios.');
    }

    const user = await this.userRepository.findOne({
      where: { email },
      // select: ['id', 'nome', 'email', 'telefone', 'senha', 'role', 'isBlocked'], // Opcional: garantir que isBlocked é selecionado
    });

    if (!user) {
      throw new UnauthorizedError('Credenciais inválidas.');
    }

    // Verificar bloqueio ANTES de validar senha
    if (user.isBlocked) {
      throw new UnauthorizedError('Usuário bloqueado.');
    }

    const isPasswordValid = await bcrypt.compare(senha, user.senha);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Credenciais inválidas.');
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, getJWTSecret(), {
      expiresIn: JWT_CONFIG.expiresIn,
    });

    const { senha: _, ...userResponse } = user;
    return { user: userResponse, token };
  }
}