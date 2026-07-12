<!-- DOC-META: status=ativo; ultima_revisao=2026-04-10; proxima_revisao=trimestral -->
# ?? Documento de Conformidade com Requisitos - TrocaAi

## ?? Apresenta��o do Sistema

**TrocaAi** � uma plataforma web fullstack desenvolvida para facilitar trocas e doa��es de itens entre usu�rios de forma segura, pr�tica e sustent�vel. O sistema promove a economia circular e o consumo consciente, permitindo que pessoas cadastrem itens que n�o usam mais, visualizem ofertas no mapa, fa�am propostas de troca e se comuniquem em tempo real atrav�s de chat integrado.

### ?? Funcionalidades Principais

1. **Sistema de Autentica��o Completo** - Registro, login e controle de acesso baseado em JWT
2. **Gest�o de Itens** - Cadastro, edi��o, visualiza��o e exclus�o de itens com upload de imagens
3. **Sistema de Propostas** - Negocia��o de trocas entre usu�rios
4. **Chat em Tempo Real** - Comunica��o instant�nea via WebSocket
5. **Visualiza��o no Mapa** - Localiza��o geogr�fica dos itens dispon�veis
6. **Painel Administrativo** - Gerenciamento completo de usu�rios e itens
7. **Sistema de Avalia��es** - Reputa��o dos usu�rios baseada em trocas realizadas
8. **Notifica��es** - Alertas em tempo real sobre propostas e mensagens

---

## ? CONFORMIDADE COM REQUISITOS M�NIMOS

### 1. BACKEND - Tecnologias Exigidas ?

#### ? Node.js
**Localiza��o:** `package.json` linha 2
- Sistema completamente desenvolvido em Node.js 20

#### ? Express
**Localiza��o:** `backend/src/server.ts` linhas 1-15
```typescript
import express from 'express';
const app = express();
```
- Framework Express utilizado para todas as rotas da API

#### ? TypeORM
**Localiza��o:** `backend/src/config/database.ts` linhas 11-19
```typescript
export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: './database.sqlite',
  entities: [User, Item, Proposal, Notification, Rating, ChatMessage, Report],
  synchronize: true,
});
```
- TypeORM configurado como ORM principal do sistema

#### ? SQLite
**Localiza��o:** `backend/src/config/database.ts` linha 12
- Banco de dados SQLite configurado em `database.sqlite`

#### ? TypeScript
**Localiza��o:** `backend/tsconfig.json`
- Todo o backend desenvolvido em TypeScript puro

---

### 2. FRONTEND - Tecnologias Exigidas ?

#### ? Vue 3
**Localiza��o:** `frontend/package.json` linha 18
```json
"vue": "^3.3.4"
```

#### ? Composition API (N�O Option API)
**Localiza��o:** Todos os componentes Vue
**Exemplo:** `frontend/src/views/HomeView.vue` linhas 1-10
```vue
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
// Composition API utilizada em 100% dos componentes
</script>
```
**? CONFIRMADO:** Sistema N�O utiliza Option API em nenhum componente

#### ? Vue Router
**Localiza��o:** `frontend/src/router/index.ts` linhas 1-179
```typescript
import { createRouter, createWebHistory } from 'vue-router';
```
- Sistema completo de roteamento com 20+ rotas
- Rotas p�blicas, protegidas e administrativas
- Navigation guards implementados

#### ? Pinia (N�O Vuex)
**Localiza��o:** `frontend/src/stores/`
- `auth.ts` - Store de autentica��o
- `item.ts` - Store de itens
- `proposal.ts` - Store de propostas
- `chat.ts` - Store de chat
- `notification.ts` - Store de notifica��es
- `admin.ts` - Store administrativa

**Exemplo:** `frontend/src/stores/auth.ts` linha 6
```typescript
export const useAuthStore = defineStore('auth', () => {
  // Composition API com Pinia
});
```
**? CONFIRMADO:** Sistema N�O utiliza Vuex

#### ? TypeScript
**Localiza��o:** `frontend/tsconfig.json`
- Todo o frontend desenvolvido em TypeScript

---

### 3. AUTENTICA��O JWT ?

#### ? Login
**Localiza��o:** 
- Backend: `backend/src/routes/authRoutes.ts` linhas 81-127
- Frontend: `frontend/src/stores/auth.ts` linhas 34-43
- View: `frontend/src/views/LoginView.vue`

**Implementa��o:**
```typescript
// Gera��o do token JWT
const token = jwt.sign(
  { userId: user.id, email: user.email, role: user.role },
  getJWTSecret(),
  { expiresIn: '7d' }
);
```

#### ? Logout
**Localiza��o:** `frontend/src/stores/auth.ts` linhas 45-67
```typescript
const logout = () => {
  localStorage.clear();
  user.value = null;
  token.value = null;
};
```

#### ? Rotas Protegidas
**Localiza��o:** `frontend/src/router/index.ts` linhas 151-176
```typescript
router.beforeEach((to, from, next) => {
  // Verifica autentica��o
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login' });
    return;
  }
  
  // Verifica role de admin
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next({ name: 'home' });
    return;
  }
});
```

**Middleware Backend:** `backend/src/middlewares/auth.middleware.ts` linhas 10-48
```typescript
export const authMiddleware = (req, res, next) => {
  const token = authHeader.split(' ')[1];
  const decoded = jwt.verify(token, getJWTSecret());
  req.userId = decoded.userId;
  req.userRole = decoded.role;
  next();
};
```

---

### 4. DIFERENTES PAP�IS DE USU�RIO ?

#### ? 3 Pap�is Implementados
**Localiza��o:** `backend/src/types/index.ts`
```typescript
export enum UserRole {
  ADMIN = 'admin',      // Controle total
  VERIFIED = 'verified', // Usu�rio verificado
  COMMON = 'common'     // Usu�rio comum
}
```

#### ? Permiss�es Diferenciadas

**ADMIN (Controle Total):**
- ? Gerenciar todos os usu�rios - `backend/src/routes/index.ts` linhas 48-68
- ? Deletar qualquer item - `backend/src/services/item.service.ts` linhas 223-237
- ? Visualizar todas as propostas - `backend/src/routes/index.ts` linha 122-125
- ? Acessar painel administrativo - `frontend/src/router/index.ts` linhas 108-132

**VERIFIED (Usu�rio Verificado):**
- ? Benef�cios extras em rela��o ao comum
- ? Todas as funcionalidades do comum + verifica��o

**COMMON (Usu�rio Comum):**
- ? Gerenciar apenas pr�prios itens - `backend/src/services/item.service.ts` linhas 196-217
- ? Criar e gerenciar pr�prias propostas
- ? Chat e avalia��es

**Implementa��o de Controle:**
```typescript
// Verifica��o no servi�o de itens
if (item.ownerId !== userId && userRole !== UserRole.ADMIN) {
  throw new Error('Voc� n�o tem permiss�o para editar este item');
}
```

---

### 5. C�DIGO ORGANIZADO EM CAMADAS ?

#### ? Backend - Arquitetura em Camadas

**CONTROLLERS** (`backend/src/controllers/`)
- `item.controller.ts` - Controlador de itens
- `user.controller.ts` - Controlador de usu�rios
- `proposal.controller.ts` - Controlador de propostas
- `chat.controller.ts` - Controlador de chat
- `rating.controller.ts` - Controlador de avalia��es
- `notification.controller.ts` - Controlador de notifica��es
- `report.controller.ts` - Controlador de den�ncias

**SERVICES** (`backend/src/services/`)
- `item.service.ts` - L�gica de neg�cio de itens
- `user.service.ts` - L�gica de neg�cio de usu�rios
- `proposal.service.ts` - L�gica de neg�cio de propostas
- `chat.service.ts` - L�gica de neg�cio de chat
- `rating.service.ts` - L�gica de neg�cio de avalia��es
- `notification.service.ts` - L�gica de neg�cio de notifica��es
- `report.service.ts` - L�gica de neg�cio de den�ncias

**ROUTES** (`backend/src/routes/`)
- `index.ts` - Arquivo principal de rotas
- `authRoutes.ts` - Rotas de autentica��o
- `userRoutes.ts` - Rotas de usu�rios

**Exemplo de Separa��o:**
```
Requisi��o ? Route ? Controller ? Service ? Database
                                    ?
                                 TypeORM
```

#### ? Frontend - Arquitetura em Camadas

**STORES** (Pinia - `frontend/src/stores/`)
- `auth.ts` - Estado de autentica��o
- `item.ts` - Estado de itens
- `proposal.ts` - Estado de propostas
- `chat.ts` - Estado de chat
- `notification.ts` - Estado de notifica��es
- `admin.ts` - Estado administrativo

**VIEWS** (`frontend/src/views/`)
- 15+ p�ginas organizadas por funcionalidade
- Separa��o clara entre p�blicas, protegidas e admin

**COMPONENTS** (`frontend/src/components/`)
- Componentes reutiliz�veis modularizados
- `AppHeader.vue`, `AppFooter.vue`, `ItemCard.vue`, etc.

---

### 6. FRONTEND - SPA (Single Page Application) ?

#### ? P�gina Principal Exibida Automaticamente
**Localiza��o:** `frontend/src/router/index.ts` linhas 14-19
```typescript
{
  path: '/',
  name: 'home',
  component: () => import('@/views/HomeView.vue'),
  meta: { title: 'In�cio - TrocaAi' }
}
```
**? CONFIRMADO:** Ao acessar `/`, a p�gina principal � exibida automaticamente

#### ? Modulariza��o de HTML (Header e Footer Separados)
**Localiza��o:**
- Header: `frontend/src/components/AppHeader.vue`
- Footer: `frontend/src/components/AppFooter.vue`

**Uso:** `frontend/src/App.vue` linhas 1-20
```vue
<template>
  <div id="app">
    <AppHeader />
    <router-view />
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue';
import AppFooter from '@/components/AppFooter.vue';
</script>
```
**? CONFIRMADO:** Header e footer em arquivos separados e reutilizados

---

### 7. ROTAS DO FRONTEND N�O P�BLICAS ?

#### ? Rotas Protegidas Implementadas

**Localiza��o:** `frontend/src/router/index.ts`

**ROTAS P�BLICAS:**
- `/` - P�gina inicial
- `/login` - Login
- `/register` - Cadastro
- `/mapa` - Mapa de itens
- `/items/:id` - Detalhes do item

**ROTAS PROTEGIDAS (requiresAuth: true):**
- `/meus-itens` - Meus itens (linha 64)
- `/novo-item` - Cadastrar item (linha 70)
- `/editar-item/:id` - Editar item (linha 76)
- `/propostas` - Minhas propostas (linha 82)
- `/propostas-recebidas` - Propostas recebidas (linha 88)
- `/perfil` - Meu perfil (linha 94)

**ROTAS ADMIN (requiresAdmin: true):**
- `/admin` - Dashboard admin (linha 111)
- `/admin/users` - Gerenciar usu�rios (linha 123)
- `/admin/items` - Gerenciar itens (linha 128)

**Prote��o Implementada:**
```typescript
// Guard de navega��o
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } });
    return;
  }
});
```

**? CONFIRMADO:** Rotas protegidas impedem acesso sem autentica��o

---

### 8. BACKEND - PAGINA��O ?

#### ? Endpoint com Pagina��o Implementado
**Localiza��o:** `backend/src/services/item.service.ts` linhas 67-132

**Implementa��o:**
```typescript
async findAll(filters: ItemFilters): Promise<PaginatedResponse<Item>> {
  const page = filters.page || 1;
  const limit = filters.limit || 12;
  const skip = (page - 1) * limit;

  const queryBuilder = this.itemRepository
    .createQueryBuilder('item')
    .skip(skip)
    .take(limit);

  const total = await queryBuilder.getCount();

  return {
    data: items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}
```

**Rota:** `GET /api/items?page=1&limit=12`

**Resposta:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 45,
    "totalPages": 4
  }
}
```

**? CONFIRMADO:** Pagina��o completa implementada

---

### 9. BACKEND - FILTRAGEM ?

#### ? Endpoints com Filtragem Implementados
**Localiza��o:** `backend/src/services/item.service.ts` linhas 86-111

**Filtros Dispon�veis:**
1. **Por Categoria** - `?category=Eletr�nicos`
2. **Por Busca** - `?search=notebook`
3. **Por Status** - `?status=disponivel`
4. **Por Dono** - `?ownerId=1`

**Implementa��o:**
```typescript
// Filtro por categoria
if (filters.category) {
  queryBuilder.andWhere('item.categoria = :category', { 
    category: filters.category 
  });
}

// Filtro por busca no t�tulo
if (filters.search) {
  queryBuilder.andWhere('item.titulo LIKE :search', { 
    search: `%${filters.search}%` 
  });
}

// Filtro por status
if (filters.status) {
  queryBuilder.andWhere('item.status = :status', { 
    status: filters.status 
  });
}
```

**Exemplo de Uso:**
```
GET /api/items?category=Eletr�nicos&status=disponivel&search=notebook&page=1
```

**? CONFIRMADO:** M�ltiplos filtros implementados

---

### 10. ENTIDADES (TABELAS) ?

#### ? 7 Entidades Implementadas (Requisito: m�nimo 3)
**Localiza��o:** `backend/src/entities/`

1. **User** - Usu�rios do sistema
   - Arquivo: `User.ts`
   - Campos: id, nome, email, senha, role, createdAt, updatedAt

2. **Item** - Itens para troca/doa��o
   - Arquivo: `Item.ts`
   - Campos: id, titulo, descricao, categoria, imagens, status, ownerId, latitude, longitude, cidade, estado, createdAt, updatedAt

3. **Proposal** - Propostas de troca
   - Arquivo: `Proposal.ts`
   - Campos: id, itemId, proposerId, status, mensagem, createdAt, updatedAt

4. **ChatMessage** - Mensagens do chat
   - Arquivo: `ChatMessage.ts`
   - Campos: id, senderId, receiverId, itemId, conteudo, lida, createdAt

5. **Notification** - Notifica��es
   - Arquivo: `Notification.ts`
   - Campos: id, userId, tipo, mensagem, lida, createdAt

6. **Rating** - Avalia��es de usu�rios
   - Arquivo: `Rating.ts`
   - Campos: id, raterUserId, ratedUserId, nota, comentario, createdAt

7. **Report** - Den�ncias
   - Arquivo: `Report.ts`
   - Campos: id, reporterId, reportedUserId, itemId, motivo, status, createdAt

**Configura��o TypeORM:** `backend/src/config/database.ts` linha 14
```typescript
entities: [User, Item, Proposal, Notification, Rating, ChatMessage, Report]
```

**? CONFIRMADO:** 7 entidades implementadas (supera requisito de 3)

---

### 11. CRUDS IMPLEMENTADOS ?

#### ? CRUDs Completos de 5 Tabelas (Requisito: m�nimo 2)

**1. CRUD de ITEMS (Completo)**
**Localiza��o:** `backend/src/services/item.service.ts`
- ? CREATE - `create()` linha 15-62
- ? READ - `findAll()` linha 67-132, `findById()` linha 137-159
- ? UPDATE - `update()` linha 197-217
- ? DELETE - `delete()` linha 223-237

**2. CRUD de USERS (Completo)**
**Localiza��o:** `backend/src/services/user.service.ts`
- ? CREATE - `create()` (registro)
- ? READ - `findAll()`, `findById()`
- ? UPDATE - `update()`
- ? DELETE - `delete()`

**3. CRUD de PROPOSALS (Completo)**
**Localiza��o:** `backend/src/services/proposal.service.ts`
- ? CREATE - `create()`
- ? READ - `findAll()`, `findById()`, `findByUser()`
- ? UPDATE - `updateStatus()`
- ? DELETE - `delete()`

**4. CRUD de RATINGS (Completo)**
**Localiza��o:** `backend/src/services/rating.service.ts`
- ? CREATE - `create()`
- ? READ - `findByUser()`
- ? UPDATE - Implementado
- ? DELETE - `delete()`

**5. CRUD de REPORTS (Completo)**
**Localiza��o:** `backend/src/services/report.service.ts`
- ? CREATE - `create()`
- ? READ - `findAll()`
- ? UPDATE - `updateStatus()`
- ? DELETE - Implementado

**? CONFIRMADO:** 5 CRUDs completos (supera requisito de 2)

---

### 12. ENTIDADES DEPENDENTES ?

#### ? Relacionamentos Implementados
**Localiza��o:** `backend/src/entities/`

**Relacionamento 1: Item ? User (Propriet�rio)**
```typescript
// Item.ts linha 47-48
@ManyToOne(() => User, (user) => user.items)
owner: User;
```

**Relacionamento 2: Proposal ? Item (Item da Proposta)**
```typescript
// Proposal.ts
@ManyToOne(() => Item)
item: Item;

@ManyToOne(() => User)
proposer: User;
```

**Relacionamento 3: ChatMessage ? User (Remetente/Destinat�rio)**
```typescript
// ChatMessage.ts
@ManyToOne(() => User, (user) => user.sentMessages)
sender: User;

@ManyToOne(() => User, (user) => user.receivedMessages)
receiver: User;
```

**Relacionamento 4: Rating ? User (Avaliador/Avaliado)**
```typescript
// Rating.ts
@ManyToOne(() => User, (user) => user.givenRatings)
raterUser: User;

@ManyToOne(() => User, (user) => user.receivedRatings)
ratedUser: User;
```

**CRUDs N�O Independentes - Exemplos:**
1. N�o � poss�vel criar um Item sem um User (ownerId obrigat�rio)
2. N�o � poss�vel criar uma Proposal sem um Item existente
3. N�o � poss�vel enviar ChatMessage sem usu�rios v�lidos

**? CONFIRMADO:** M�ltiplos relacionamentos de depend�ncia

---

### 13. �REA P�BLICA E �REA RESTRITA ?

#### ? �rea P�blica (Acess�vel a Todos)

**P�ginas P�blicas:**
1. `/` - P�gina inicial com itens dispon�veis
2. `/mapa` - Visualiza��o de itens no mapa
3. `/items/:id` - Detalhes de um item espec�fico
4. `/login` - P�gina de login
5. `/register` - P�gina de cadastro

**Servi�os P�blicos (API):**
- `GET /api/items` - Listar itens
- `GET /api/items/:id` - Detalhes do item
- `GET /api/items/categories` - Categorias dispon�veis
- `POST /api/auth/register` - Registro de usu�rio
- `POST /api/auth/login` - Login

#### ? �rea Restrita (Apenas Autenticados)

**P�ginas Restritas:**
1. `/meus-itens` - Gerenciar meus itens
2. `/novo-item` - Cadastrar novo item
3. `/editar-item/:id` - Editar item
4. `/propostas` - Minhas propostas enviadas
5. `/propostas-recebidas` - Propostas recebidas
6. `/perfil` - Meu perfil
7. `/admin/*` - �rea administrativa (apenas admin)

**Servi�os Restritos (API):**
- `POST /api/items` - Criar item (requer auth)
- `PUT /api/items/:id` - Atualizar item (requer auth)
- `DELETE /api/items/:id` - Deletar item (requer auth)
- `POST /api/proposals` - Criar proposta (requer auth)
- `GET /api/proposals/sent` - Minhas propostas (requer auth)
- `GET /api/chat/messages` - Mensagens do chat (requer auth)
- `GET /api/users` - Listar usu�rios (requer admin)

**? CONFIRMADO:** Separa��o clara entre p�blico e restrito

---

## ?? RESUMO DE CONFORMIDADE

| Requisito | Status | Evid�ncia |
|-----------|--------|-----------|
| Backend: Node.js + Express + TypeORM + SQLite + TypeScript | ? | Implementa��o completa |
| Frontend: Vue 3 + Composition API + Router + Pinia + TypeScript | ? | Implementa��o completa |
| Composition API (N�O Option API) | ? | 100% dos componentes |
| Pinia (N�O Vuex) | ? | 6 stores implementadas |
| Autentica��o JWT | ? | Login, logout, rotas protegidas |
| 3 Pap�is de Usu�rio | ? | Admin, Verified, Common |
| C�digo em Camadas | ? | Controllers, Services, Routes, Stores |
| SPA com Rota Principal | ? | `/` exibe HomeView automaticamente |
| Modulariza��o (Header/Footer) | ? | Componentes separados |
| Rotas Protegidas | ? | Navigation guards implementados |
| Pagina��o no Backend | ? | Endpoint `/api/items` paginado |
| Filtragem no Backend | ? | 4 tipos de filtros |
| M�nimo 3 Entidades | ? | **7 entidades** implementadas |
| CRUD de 2 Tabelas | ? | **5 CRUDs** completos |
| Entidades Dependentes | ? | M�ltiplos relacionamentos |
| �rea P�blica + Restrita | ? | Separa��o implementada |

---

## ?? FUNCIONALIDADES EXTRAS IMPLEMENTADAS

Al�m dos requisitos m�nimos, o sistema TrocaAi implementa:

1. **? Chat em Tempo Real** - WebSocket com Socket.IO
2. **? Geolocaliza��o** - Itens posicionados em mapa interativo
3. **? Upload de Imagens** - M�ltiplas imagens por item
4. **? Sistema de Avalia��es** - Reputa��o de usu�rios
5. **? Notifica��es em Tempo Real** - Push notifications
6. **? Sistema de Den�ncias** - Modera��o de conte�do
7. **? Painel Administrativo** - Dashboard completo
8. **? Soft Delete** - Itens podem ser restaurados
9. **? Valida��o de Dados** - DTOs com class-validator
10. **? Seguran�a JWT** - Secret obrigat�rio com valida��o

---

## ?? ESTAT�STICAS DO PROJETO

- **Linhas de C�digo:** ~15.000+
- **Componentes Vue:** 25+
- **Rotas Backend:** 40+
- **Rotas Frontend:** 20+
- **Stores Pinia:** 6
- **Entidades TypeORM:** 7
- **Servi�os:** 7
- **Controllers:** 7
- **Middlewares:** 3

---

## ?? SEGURAN�A IMPLEMENTADA

1. **JWT com Secret Obrigat�rio** - Sistema n�o inicia sem JWT_SECRET configurado
2. **Bcrypt para Senhas** - Hash seguro de senhas
3. **Valida��o de Dados** - DTOs validados com class-validator
4. **CORS Configurado** - Prote��o contra requisi��es maliciosas
5. **Middleware de Autentica��o** - Valida��o de token em todas as rotas protegidas
6. **Role-Based Access Control** - Controle de permiss�es por papel
7. **SQL Injection Protection** - TypeORM previne inje��o de SQL

---

## ?? COMO EXECUTAR O PROJETO

### Pr�-requisitos
- Node.js 20+
- NPM

### Instala��o

```bash
# Instalar depend�ncias raiz
npm install

# Instalar depend�ncias do backend
cd backend && npm install

# Instalar depend�ncias do frontend
cd frontend && npm install
```

### Configura��o

1. Copiar arquivo de ambiente:
```bash
cp backend/.env.example backend/.env
```

2. Configurar JWT_SECRET no `backend/.env`:
```bash
JWT_SECRET=sua_chave_super_secreta_aqui
```

### Execu��o

```bash
# Executar backend e frontend simultaneamente (raiz do projeto)
npm run dev

# Backend estar� em: http://localhost:3000
# Frontend estar� em: http://localhost:5000
```

### Credenciais de Teste

**Admin:**
- Email: admin@trocaai.com
- Senha: Admin@123

---

## ?? DOCUMENTA��O T�CNICA

- **Arquitetura:** `arquitetura.md`
- **Fluxos de Features:** `trocaai_feature_flows.md`
- **Integra��o Google Maps:** `GOOGLE_MAPS_INTEGRATION.md`
- **Instru��es de Export:** `EXPORT_INSTRUCTIONS.md`
- **Mem�ria do Projeto:** `replit.md`

---

**Desenvolvido por:** Equipe Dev-Connect  
**Data:** Outubro 2025  
**Tecnologias:** Node.js, Express, TypeORM, SQLite, TypeScript, Vue 3, Pinia, WebSocket




