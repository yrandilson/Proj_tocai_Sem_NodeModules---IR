/**
 * Validação centralizada de variáveis de ambiente.
 * Importar ANTES de qualquer outro módulo em server.ts.
 * Se uma variável obrigatória estiver faltando, o processo termina imediatamente
 * com uma mensagem clara — em vez de falhar silenciosamente em runtime.
 */

interface EnvConfig {
  NODE_ENV: string;
  PORT: number;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  REFRESH_TOKEN_SECRET: string;
  REFRESH_TOKEN_EXPIRES_IN: string;
  FRONTEND_URL: string;
  DB_TYPE: string;
  LOG_LEVEL: string;
}

function validateEnv(): EnvConfig {
  const errors: string[] = [];

  // Obrigatórias em todos os ambientes
  if (!process.env.JWT_SECRET) {
    errors.push('JWT_SECRET é obrigatória');
  } else if (
    process.env.NODE_ENV === 'production' &&
    process.env.JWT_SECRET.length < 32
  ) {
    errors.push('JWT_SECRET deve ter pelo menos 32 caracteres em produção');
  }

  if (!process.env.REFRESH_TOKEN_SECRET) {
    errors.push('REFRESH_TOKEN_SECRET é obrigatória');
  }

  if (
    process.env.NODE_ENV === 'production' &&
    process.env.DB_TYPE === 'mysql'
  ) {
    if (!process.env.DB_HOST) errors.push('DB_HOST é obrigatória quando DB_TYPE=mysql');
    if (!process.env.DB_USER) errors.push('DB_USER é obrigatória quando DB_TYPE=mysql');
    if (!process.env.DB_PASS) errors.push('DB_PASS é obrigatória quando DB_TYPE=mysql');
    if (!process.env.DB_NAME) errors.push('DB_NAME é obrigatória quando DB_TYPE=mysql');
  }

  if (errors.length > 0) {
    console.error('\n❌ Erro de configuração — variáveis de ambiente inválidas:\n');
    errors.forEach(e => console.error(`  • ${e}`));
    console.error('\nConsulte o arquivo .env.example para referência.\n');
    process.exit(1);
  }

  return {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: Number(process.env.PORT) || 3000,
    JWT_SECRET: process.env.JWT_SECRET!,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET!,
    REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5174',
    DB_TYPE: process.env.DB_TYPE || 'sqlite',
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  };
}

// Exporta o objeto validado — use `env.JWT_SECRET` em vez de `process.env.JWT_SECRET`
export const env = validateEnv();
