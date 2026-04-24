import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import crypto from 'node:crypto';

// Caminho correto do .env
const envPath = join(__dirname, '../../.env'); // Volta duas pastas: src/scripts -> backend -> projeto raiz

// Lê o conteúdo atual do .env
const envContent = readFileSync(envPath, 'utf-8').split('\n');

// Gera uma chave aleatória de 32 bytes
const newSecret = crypto.randomBytes(32).toString('base64');

// Atualiza ou adiciona a variável JWT_SECRET
const updatedContent = envContent.map(line => {
  if (line.startsWith('JWT_SECRET=')) {
    return `JWT_SECRET=${newSecret}`;
  }
  return line;
}).join('\n');

// Salva de volta no .env
writeFileSync(envPath, updatedContent, { encoding: 'utf-8' });

console.log('✅ JWT_SECRET atualizado no .env:');
console.log(newSecret);
