# ─── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

# O código fonte do Vue fica em front/src/ — trabalhamos direto nessa pasta
WORKDIR /app

# Copia package.json e instala dependências
COPY src/package*.json ./
RUN npm install

# Copia todo o conteúdo de front/src/ para /app
COPY src/ ./

# Compila o Vue (vue-tsc + vite build)
RUN npm run build

# ─── Stage 2: Servidor nginx ─────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runtime

# Remove configuração padrão do nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia nossa configuração customizada
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia o build estático gerado pelo Vite
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
