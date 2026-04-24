// c:\Users\IRN\Music\marklace-main\backend\src\config\logger.ts
import winston from 'winston';

const { combine, timestamp, printf, colorize, align } = winston.format;

// Define o formato do log
const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

// Cria a instância do logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    colorize({ all: true }),
    timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    align(),
    logFormat
  ),
  transports: [
    new winston.transports.Console(),
  ],
  // Não sair em caso de erro não tratado (deixe o Express lidar com isso)
  exitOnError: false, 
});

export default logger;
