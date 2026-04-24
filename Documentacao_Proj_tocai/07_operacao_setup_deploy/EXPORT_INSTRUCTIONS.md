<!-- DOC-META: status=ativo; ultima_revisao=2026-04-10; proxima_revisao=trimestral -->
# ?? Como Exportar e Executar o Projeto TrocaAi Localmente

## ?? Op��o 1: Download Direto do Replit

### Passo 1: Baixar o Projeto
1. No Replit, clique nos 3 pontos (...) no canto superior direito
2. Selecione **"Download as zip"**
3. Extraia o arquivo ZIP em seu computador

### Passo 2: Instalar Depend�ncias
```bash
# Abra o terminal na pasta extra�da
cd trocaai

# Instale depend�ncias do root
npm install

# Instale depend�ncias do backend
cd backend
npm install

# Instale depend�ncias do frontend
cd ../frontend
npm install
cd ..
```

### Passo 3: Configurar Vari�veis de Ambiente

**Backend (.env):**
```bash
# Crie o arquivo backend/.env
PORT=3000
NODE_ENV=development
JWT_SECRET=trocaai_super_secret_key_2025_dev_connect
JWT_EXPIRES_IN=7d
DB_TYPE=sqlite
DB_DATABASE=database.sqlite
FRONTEND_URL=http://localhost:5000
```

**Frontend (.env):**
```bash
# Crie o arquivo frontend/.env
VITE_API_URL=http://localhost:3000
BASE_URL=/
```

### Passo 4: Executar o Projeto

**Op��o A - Tudo de Uma Vez:**
```bash
npm run dev
```

**Op��o B - Separadamente:**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Passo 5: Acessar
- Frontend: http://localhost:5000
- Backend API: http://localhost:3000

## ?? Op��o 2: Clonar via Git

```bash
# Clone o reposit�rio
git clone <URL_DO_SEU_REPO>
cd trocaai

# Siga os passos 2-5 acima
```

## ?? Op��o 3: Copiar Arquivos Essenciais Manualmente

Se voc� s� quer os arquivos principais:

### Estrutura M�nima:
```
trocaai/
+-- backend/
�   +-- src/                # Copiar toda pasta
�   +-- .env                # Criar novo
�   +-- package.json
�   +-- tsconfig.json
�
+-- frontend/
�   +-- src/                # Copiar toda pasta
�   +-- index.html
�   +-- .env                # Criar novo
�   +-- package.json
�   +-- vite.config.ts
�   +-- tailwind.config.js
�   +-- tsconfig.json
�
+-- package.json
+-- .gitignore
```

## ?? Checklist P�s-Download

? **Arquivos Essenciais:**
- [ ] Todos os arquivos .ts e .vue copiados
- [ ] package.json (root, backend, frontend)
- [ ] Arquivos de configura��o (.json, .js)
- [ ] Criar arquivos .env (n�o s�o baixados)

? **Depend�ncias:**
- [ ] Node.js 18+ instalado
- [ ] npm install no root
- [ ] npm install no backend
- [ ] npm install no frontend

? **Banco de Dados:**
- [ ] Arquivo database.sqlite ser� criado automaticamente
- [ ] Admin ser� criado na primeira execu��o

? **Teste:**
- [ ] Backend responde em http://localhost:3000/api
- [ ] Frontend carrega em http://localhost:5000
- [ ] Login funciona com admin@trocaai.com / Admin@123

## ?? Troubleshooting

### Erro: "Cannot find module"
```bash
# Reinstale todas as depend�ncias
rm -rf node_modules backend/node_modules frontend/node_modules
rm package-lock.json backend/package-lock.json frontend/package-lock.json
npm install
cd backend && npm install
cd ../frontend && npm install
```

### Erro: "Port already in use"
```bash
# Linux/Mac
lsof -ti:3000 | xargs kill
lsof -ti:5000 | xargs kill

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Erro: "SQLite database locked"
```bash
# Feche todos os processos e delete o arquivo
rm backend/database.sqlite
# Ser� recriado automaticamente
```

## ?? Scripts Dispon�veis

```bash
# Root
npm run dev          # Inicia backend + frontend
npm run build        # Build de produ��o

# Backend
npm run dev          # Modo desenvolvimento
npm run build        # Compilar TypeScript
npm start            # Rodar vers�o compilada

# Frontend  
npm run dev          # Modo desenvolvimento
npm run build        # Build para produ��o
npm run preview      # Preview do build
```

## ?? Build para Produ��o

```bash
# 1. Build do backend
cd backend
npm run build

# 2. Build do frontend
cd ../frontend
npm run build

# 3. Os arquivos estar�o em:
# - backend/dist/
# - frontend/dist/
```

## ?? Deploy em Servidor Pr�prio

### Usando PM2 (Recomendado)
```bash
npm install -g pm2

# Backend
cd backend
pm2 start dist/server.js --name "trocaai-api"

# Frontend (serve est�tico com nginx ou similar)
# Copie frontend/dist/ para /var/www/html
```

### Usando Docker (Avan�ado)
```bash
# TODO: Adicionar Dockerfile
```

## ?? Backup do Banco de Dados

```bash
# Copiar database.sqlite periodicamente
cp backend/database.sqlite backend/database.backup.sqlite
```

## ? Projeto Pronto para Uso Local

Ap�s seguir estes passos, voc� ter� uma c�pia completa e funcional do TrocaAi rodando localmente em sua m�quina!

## ?? Suporte

Se encontrar problemas:
1. Verifique os logs do terminal
2. Confirme que todas as depend�ncias foram instaladas
3. Verifique se as portas 3000 e 5000 est�o livres
4. Recrie os arquivos .env conforme especificado

---

**Desenvolvido por Dev-Connect** 
MIT License




