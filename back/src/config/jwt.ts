import 'dotenv/config';

/**
 * Configurações de JWT e Refresh Token.
 * Access token: vida curta (15min) — armazenado em memória no front.
 * Refresh token: vida longa (7d) — armazenado em cookie httpOnly.
 */
export const JWT_CONFIG = {
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRES_IN || '15m',
} as const;

export const REFRESH_TOKEN_CONFIG = {
  secret: process.env.REFRESH_TOKEN_SECRET,
  expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  cookieName: 'trocaai_refresh',
} as const;

export function getJWTSecret(): string {
  const secret = JWT_CONFIG.secret;
  if (!secret) {
    throw new Error('JWT_SECRET não definida nas variáveis de ambiente.');
  }
  if (process.env.NODE_ENV === 'production' && secret.length < 32) {
    throw new Error('JWT_SECRET deve ter pelo menos 32 caracteres em produção.');
  }
  return secret;
}

export function getRefreshTokenSecret(): string {
  const secret = REFRESH_TOKEN_CONFIG.secret;
  if (!secret) {
    throw new Error('REFRESH_TOKEN_SECRET não definida nas variáveis de ambiente.');
  }
  return secret;
}
