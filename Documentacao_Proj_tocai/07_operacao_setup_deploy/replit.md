<!-- DOC-META: status=ativo; ultima_revisao=2026-04-10; proxima_revisao=trimestral -->
# ?? TrocaAi - Plataforma de Trocas e Doa��es

## ?? Vis�o Geral

**TrocaAi** � uma plataforma web fullstack para facilitar trocas e doa��es de items entre usu�rios. O sistema permite que usu�rios cadastrem items, fa�am propostas, negociem via chat em tempo real e visualizem items no mapa.

## ??? Tecnologias Utilizadas

### Backend
- **Node.js 20** com TypeScript
- **Express.js** - Framework web
- **TypeORM** - ORM para banco de dados
- **SQLite** - Banco de dados (desenvolvimento)
- **Socket.IO** - WebSocket para chat em tempo real
- **JWT** - Autentica��o
- **bcryptjs** - Criptografia de senhas

### Frontend  
- **Vue 3** com Composition API
- **TypeScript**
- **Vite** - Build tool
- **Pinia** - Gerenciamento de estado
- **TailwindCSS** - Estiliza��o
- **Axios** - Cliente HTTP
- **Socket.IO Client** - WebSocket cliente

## ?? Estrutura do Projeto

```
trocaai/
+-- backend/                 # Servidor Node.js/Express
�   +-- src/
�   �   +-- controllers/    # Controladores de rotas
�   �   +-- services/       # L�gica de neg�cio
�   �   +-- entities/       # Modelos do banco de dados
�   �   +-- routes/         # Defini��o de rotas
�   �   +-- middlewares/    # Middlewares (auth, validation)
�   �   +-- websocket/      # Handlers WebSocket
�   �   +-- config/         # Configura��es
�   �   +-- server.ts       # Entrada do servidor
�   +-- uploads/            # Arquivos enviados
�   +-- database.sqlite     # Banco de dados SQLite
�   +-- package.json
�
+-- frontend/               # Aplica��o Vue.js
�   +-- src/
�   �   +-- components/    # Componentes reutiliz�veis
�   �   +-- views/         # P�ginas/Views
�   �   +-- stores/        # Pinia stores
�   �   +-- services/      # Servi�os (API)
�   �   +-- router/        # Vue Router
�   �   +-- main.ts        # Entrada da aplica��o
�   +-- index.html
�   +-- package.json
�
+-- .gitignore
+-- package.json            # Scripts raiz (concurrently)
+-- README.md
```

## ?? Como Executar

### Desenvolvimento (Replit)

O projeto j� est� configurado para rodar automaticamente no Replit:

1. Os workflows **Backend** e **Frontend** iniciam automaticamente
2. Backend roda em `http://localhost:3000`
3. Frontend roda em `http://0.0.0.0:5000` (porta p�blica)

### Desenvolvimento Local

```bash
# Instalar depend�ncias
npm install
cd backend && npm install
cd ../frontend && npm install

# Rodar ambos simultaneamente
npm run dev

# Ou separadamente:
cd backend && npm run dev   # Backend na porta 3000
cd frontend && npm run dev  # Frontend na porta 5000
```

## ?? Credenciais Admin

- **Email:** admin@trocaai.com
- **Senha:** Admin@123

> ?? **Importante:** Altere a senha ap�s o primeiro login!

## ?? Vari�veis de Ambiente

### Backend (.env)
```bash
PORT=3000
NODE_ENV=development
JWT_SECRET=trocaai_super_secret_key_2025_dev_connect
JWT_EXPIRES_IN=7d
DB_TYPE=sqlite
DB_DATABASE=database.sqlite
FRONTEND_URL=http://localhost:5000
GOOGLE_MAPS_API_KEY=sua_chave_aqui  # Opcional
```

### Frontend (.env)
```bash
VITE_API_URL=http://localhost:3000
BASE_URL=/
VITE_GOOGLE_MAPS_API_KEY=sua_chave_aqui  # Opcional
```

## ?? API Endpoints

### Autentica��o
- `POST /api/auth/register` - Registrar usu�rio
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Dados do usu�rio logado

### Items
- `GET /api/items` - Listar items
- `GET /api/items/:id` - Detalhes do item
- `POST /api/items` - Criar item
- `PUT /api/items/:id` - Atualizar item
- `DELETE /api/items/:id` - Deletar item

### Propostas
- `GET /api/proposals` - Minhas propostas
- `GET /api/proposals/received` - Propostas recebidas
- `POST /api/proposals` - Criar proposta
- `PATCH /api/proposals/:id/status` - Aceitar/Recusar

### Chat
- `GET /api/chat/conversations` - Listar conversas
- `GET /api/chat/messages/:userId/:itemId` - Mensagens
- `POST /api/chat/read` - Marcar como lido

### WebSocket Events
- `message:send` - Enviar mensagem
- `message:received` - Receber mensagem
- `user:typing` - Usu�rio digitando
- `unread:update` - Atualizar contador

## ?? Testes

```bash
cd backend
npm test
```

> **Nota:** Os testes agora protegem o usu�rio admin de ser deletado.

## ??? Google Maps Integration

Veja instru��es completas em [GOOGLE_MAPS_INTEGRATION.md](./GOOGLE_MAPS_INTEGRATION.md)

## ?? Melhorias Recentes (Outubro 2025)

### ?? Seguran�a Cr�tica
- ? **JWT Security**: Eliminados todos os fallbacks inseguros (`'default_secret'`)
- ? **Centraliza��o JWT**: Criado `backend/src/config/jwt.ts` com valida��o obrigat�ria
- ? **Prote��o Admin**: Testes n�o deletam mais o usu�rio admin
- ? **WebSocket Seguro**: Autentica��o JWT implementada no Socket.IO

### ?? Corre��es T�cnicas
- ? WebSocket com autentica��o JWT centralizada
- ? CORS configurado para Replit (aceita todas origens em dev)
- ? Vite HMR otimizado (WebSocket protocol: 'ws')
- ? Chat em tempo real funcionando perfeitamente
- ? Sistema de propostas completo e testado
- ? Workflow �nico otimizado (concurrently)

### ?? Documenta��o Completa
- ? `replit.md` - Documenta��o principal do projeto
- ? `GOOGLE_MAPS_INTEGRATION.md` - Integra��o Google Maps passo-a-passo
- ? `EXPORT_INSTRUCTIONS.md` - Como baixar e rodar localmente

### ?? Funcionalidades
- ? Autentica��o e autoriza��o
- ? Upload de imagens
- ? Chat em tempo real
- ? Notifica��es push
- ? Sistema de propostas
- ? Avalia��es de usu�rios
- ? Sistema de den�ncias
- ? Painel administrativo

## ?? Deploy (Produ��o)

### Preparar para Deploy

```bash
# Build do backend
cd backend && npm run build

# Build do frontend
cd frontend && npm run build
```

### Configurar Deployment no Replit

O deployment j� est� configurado. Use o bot�o "Deploy" no Replit.

**Configura��es importantes:**
- Frontend serve em port 5000 (�nica porta p�blica)
- Backend interno em localhost:3000
- Vite proxy redireciona `/api` e `/uploads` para backend

## ?? Banco de Dados

### Schema Principal

- **users** - Usu�rios do sistema
- **items** - Items para troca/doa��o
- **proposals** - Propostas de troca
- **messages** - Mensagens do chat
- **notifications** - Notifica��es
- **ratings** - Avalia��es
- **reports** - Den�ncias

### Resetar Admin

Se o usu�rio admin for deletado:

```bash
cd backend
npx ts-node src/scripts/reset-admin.ts
```

## ?? Troubleshooting

### Frontend n�o carrega
1. Verifique se o workflow "Frontend" est� rodando
2. Confirme que est� na porta 5000
3. Limpe o cache do navegador

### Backend n�o responde
1. Verifique logs do workflow "Backend"
2. Confirme que database.sqlite existe
3. Verifique vari�veis .env

### Chat n�o funciona
1. Verifique conex�o WebSocket no console
2. Confirme que token JWT est� sendo enviado
3. Verifique logs do backend

## ?? Documenta��o Adicional

- [Integra��o Google Maps](./GOOGLE_MAPS_INTEGRATION.md)
- [Arquitetura](./arquitetura.md)
- [Fluxos de Features](./trocaai_feature_flows.md)

## ?? Autores

Desenvolvido por **Dev-Connect**

## ?? Licen�a

MIT License




