import crypto from 'crypto';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { RefreshToken } from '../entities/RefreshToken';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRole } from '../types';
import { BadRequestError, UnauthorizedError } from '../errors/http-errors';
import { JWT_CONFIG, REFRESH_TOKEN_CONFIG, getJWTSecret, getRefreshTokenSecret } from '../config/jwt';
import logger from '../config/logger';

// Converte "7d", "15m" etc. para milissegundos
function parseDuration(duration: string): number {
  const units: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000; // fallback 7d
  return parseInt(match[1]) * units[match[2]];
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export class AuthService {
  private userRepository = AppDataSource.getRepository(User);
  private refreshTokenRepository = AppDataSource.getRepository(RefreshToken);

  /** Gera um access token JWT de vida curta */
  private generateAccessToken(userId: number, role: UserRole): string {
    return jwt.sign({ userId, role }, getJWTSecret(), {
      expiresIn: JWT_CONFIG.expiresIn as any,
    });
  }

  /** Gera um refresh token opaco, persiste o hash e retorna o valor em texto claro */
  private async generateRefreshToken(userId: number): Promise<string> {
    const token = crypto.randomBytes(64).toString('hex');
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + parseDuration(REFRESH_TOKEN_CONFIG.expiresIn));

    const refreshToken = this.refreshTokenRepository.create({
      tokenHash,
      userId,
      expiresAt,
      revoked: false,
    });

    await this.refreshTokenRepository.save(refreshToken);
    logger.debug(`[AuthService] Refresh token gerado para userId ${userId}`);
    return token;
  }

  /** Registra um novo usuário */
  public async register(
    nome: string,
    email: string,
    senha: string
  ): Promise<{ user: Partial<User>; accessToken: string; refreshToken: string }> {
    if (!nome || !email || !senha) {
      throw new BadRequestError('Nome, email e senha são obrigatórios.');
    }

    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new BadRequestError('Este email já está em uso.');
    }

    const hashedPassword = await bcrypt.hash(senha, 10);
    const newUser = this.userRepository.create({
      nome,
      email,
      senha: hashedPassword,
      role: UserRole.COMMON,
    });
    await this.userRepository.save(newUser);

    const accessToken = this.generateAccessToken(newUser.id, newUser.role);
    const refreshToken = await this.generateRefreshToken(newUser.id);

    const { senha: _, ...userResponse } = newUser;
    return { user: userResponse, accessToken, refreshToken };
  }

  /** Autentica um usuário e retorna access + refresh token */
  public async login(
    email: string,
    senha: string
  ): Promise<{ user: Partial<User>; accessToken: string; refreshToken: string }> {
    if (!email || !senha) {
      throw new BadRequestError('Email e senha são obrigatórios.');
    }

    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new UnauthorizedError('Credenciais inválidas.');
    }

    // Bloqueia antes de validar a senha (não revela qual campo está errado)
    if (user.isBlocked) {
      throw new UnauthorizedError('Usuário bloqueado.');
    }

    const isPasswordValid = await bcrypt.compare(senha, user.senha);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Credenciais inválidas.');
    }

    const accessToken = this.generateAccessToken(user.id, user.role);
    const refreshToken = await this.generateRefreshToken(user.id);

    const { senha: _, ...userResponse } = user;
    return { user: userResponse, accessToken, refreshToken };
  }

  /**
   * Valida um refresh token e emite novos tokens (rotação).
   * O token antigo é revogado imediatamente.
   */
  public async refreshTokens(
    rawToken: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const tokenHash = hashToken(rawToken);

    const stored = await this.refreshTokenRepository.findOne({
      where: { tokenHash },
      relations: ['user'],
    });

    if (!stored || stored.revoked || stored.expiresAt < new Date()) {
      throw new UnauthorizedError('Refresh token inválido ou expirado.');
    }

    if (stored.user.isBlocked) {
      throw new UnauthorizedError('Usuário bloqueado.');
    }

    // Revoga o token atual (rotação)
    stored.revoked = true;
    await this.refreshTokenRepository.save(stored);

    // Emite novos tokens
    const accessToken = this.generateAccessToken(stored.userId, stored.user.role);
    const newRefreshToken = await this.generateRefreshToken(stored.userId);

    logger.debug(`[AuthService] Tokens rotacionados para userId ${stored.userId}`);
    return { accessToken, refreshToken: newRefreshToken };
  }

  /** Revoga todos os refresh tokens de um usuário (logout ou bloqueio) */
  public async revokeAllTokens(userId: number): Promise<void> {
    await this.refreshTokenRepository.update(
      { userId, revoked: false },
      { revoked: true }
    );
    logger.info(`[AuthService] Todos os refresh tokens revogados para userId ${userId}`);
  }
}
