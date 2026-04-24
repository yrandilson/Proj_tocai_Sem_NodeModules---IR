import 'dotenv/config';

/**
 * Configurações para JSON Web Token (JWT)
 */
export const JWT_CONFIG = {
  secret: process.env.JWT_SECRET,
  expiresIn: '7d', // Tempo de expiração do token
} as const; // 'as const' informa ao TypeScript que este objeto é imutável

/**
 * Obtém a chave secreta do JWT das variáveis de ambiente.
 * Lança um erro se a chave não estiver definida, garantindo a segurança.
 */
export function getJWTSecret(): string {
  const secret = JWT_CONFIG.secret;
  if (!secret) {
    throw new Error('Chave secreta JWT não definida nas variáveis de ambiente (JWT_SECRET)');
  }

  if (process.env.NODE_ENV === 'production' && secret.length < 32) {
    throw new Error('Em produção, a chave secreta JWT deve ter pelo menos 32 caracteres.');
  }

  return secret;
}