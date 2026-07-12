# ─── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Instala dependências (npm install atualiza o lock se necessário)
COPY package*.json ./
RUN npm install

# Copia o código e compila TypeScript
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Remove devDependencies da instalação final
RUN npm prune --omit=dev

# ─── Stage 2: Runtime ────────────────────────────────────────────────────────
FROM node:20-alpine AS runtime

# Usuário não-root por segurança
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app
RUN chown appuser:appgroup /app

# Copia apenas o necessário do stage de build
COPY --from=builder --chown=appuser:appgroup /app/dist ./dist
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/package.json ./package.json

# Pasta de uploads persistida via volume
RUN mkdir -p uploads && chown appuser:appgroup uploads

USER appuser

EXPOSE 3000

# Entrypoint: roda migrations e sobe o servidor
CMD ["sh", "-c", "node -e \"require('./dist/config/database').AppDataSource.initialize().then(ds => ds.runMigrations()).then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); })\" && node dist/server.js"]
