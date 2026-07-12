<!-- DOC-META: status=ativo; ultima_revisao=2026-04-10; proxima_revisao=trimestral -->
# ?? Apresenta��o do Projeto TrocaAi - Para Avalia��o

## ?? Informa��es do Projeto

**Nome:** TrocaAi - Plataforma de Trocas e Doa��es  
**Equipe:** Dev-Connect  
**Data:** Outubro 2025  
**Tecnologia:** Fullstack Web Application (Node.js + Vue 3)

---

## ?? O QUE � JWT?

**JWT (JSON Web Token)** � um padr�o de autentica��o baseado em tokens que permite a comunica��o segura entre cliente e servidor.

### Como Funciona:

1. **Usu�rio faz login** ? Envia email e senha
2. **Servidor valida** ? Verifica credenciais no banco de dados
3. **Token � gerado** ? Servidor cria um token JWT assinado
4. **Cliente armazena** ? Token guardado no localStorage
5. **Requisi��es autenticadas** ? Token enviado no header `Authorization: Bearer <token>`
6. **Servidor valida** ? Decodifica e verifica assinatura do token

### Estrutura do JWT:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsInJvbGUiOiJjb21tb24ifQ.signature
```

**Partes:**
- **Header:** Algoritmo de criptografia (HS256)
- **Payload:** Dados do usu�rio (userId, email, role)
- **Signature:** Assinatura digital com secret key

### Vantagens:

- ? **Stateless** - N�o precisa armazenar sess�o no servidor
- ? **Seguro** - Assinado digitalmente, imposs�vel falsificar
- ? **Escal�vel** - Ideal para APIs RESTful
- ? **Cross-domain** - Funciona em diferentes dom�nios

### Implementa��o no TrocaAi:

**Gera��o do Token (Backend):**
```typescript
// backend/src/routes/authRoutes.ts
const token = jwt.sign(
  { userId: user.id, email: user.email, role: user.role },
  getJWTSecret(),
  { expiresIn: '7d' }
);
```

**Valida��o do Token (Backend):**
```typescript
// backend/src/middlewares/auth.middleware.ts
const decoded = jwt.verify(token, getJWTSecret());
req.userId = decoded.userId;
req.userRole = decoded.role;
```

**Envio do Token (Frontend):**
```typescript
// frontend/src/services/api.ts
api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
```

---

## ?? RESUMO EXECUTIVO DO PROJETO

### Vis�o Geral

TrocaAi � uma plataforma web completa que conecta pessoas para realizar trocas e doa��es de itens de forma sustent�vel. O sistema promove a economia circular, reduzindo desperd�cio e incentivando o consumo consciente.

### Problema Resolvido

- Pessoas t�m itens que n�o usam mais ocupando espa�o
- Dificuldade em encontrar interessados em trocas
- Falta de confian�a em transa��es entre desconhecidos
- Aus�ncia de plataformas especializadas para trocas locais

### Solu��o Implementada

Uma plataforma fullstack robusta com:
- ?? Sistema de autentica��o seguro (JWT)
- ?? Cadastro e gerenciamento de itens
- ?? Sistema de propostas de troca
- ?? Chat em tempo real (WebSocket)
- ??? Localiza��o geogr�fica de itens
- ? Avalia��es e reputa��o de usu�rios
- ?? Painel administrativo completo

---

## ? CHECKLIST DE REQUISITOS ATENDIDOS

### Backend ?

- [x] **Node.js** - Vers�o 20
- [x] **Express** - Framework web
- [x] **TypeORM** - ORM para banco de dados
- [x] **SQLite** - Banco de dados
- [x] **TypeScript** - 100% do c�digo tipado
- [x] **Pagina��o** - Endpoint `/api/items` com pagina��o completa
- [x] **Filtragem** - 4 tipos de filtros (categoria, busca, status, dono)
- [x] **7 Entidades** - User, Item, Proposal, ChatMessage, Notification, Rating, Report
- [x] **5 CRUDs Completos** - Items, Users, Proposals, Ratings, Reports
- [x] **Entidades Dependentes** - M�ltiplos relacionamentos implementados
- [x] **C�digo em Camadas** - Controllers ? Services ? Entities

### Frontend ?

- [x] **Vue 3** - Framework moderno
- [x] **Composition API** - 100% dos componentes (N�O usa Option API)
- [x] **Vue Router** - Sistema de rotas completo
- [x] **Pinia** - Gerenciamento de estado (N�O usa Vuex)
- [x] **TypeScript** - 100% do c�digo tipado
- [x] **SPA** - Single Page Application
- [x] **Rota Principal** - `/` exibe HomeView automaticamente
- [x] **Modulariza��o** - Header e Footer em arquivos separados
- [x] **Rotas Protegidas** - Navigation guards implementados

### Autentica��o e Seguran�a ?

- [x] **JWT** - Autentica��o completa
- [x] **Login/Logout** - Funcionalidades implementadas
- [x] **Rotas Protegidas** - Backend e Frontend
- [x] **3 Pap�is de Usu�rio** - Admin, Verified, Common
- [x] **Permiss�es Diferenciadas** - Cada papel com acessos espec�ficos
- [x] **�rea P�blica** - 5 p�ginas p�blicas
- [x] **�rea Restrita** - 7+ p�ginas restritas
- [x] **Middleware de Autentica��o** - Valida��o em todas rotas protegidas

---

## ??? ARQUITETURA DO SISTEMA

### Diagrama de Camadas

```
+-----------------------------------------+
�           FRONTEND (Vue 3)              �
+-----------------------------------------�
�  Views (P�ginas)                        �
�    ?                                    �
�  Components (Componentes Reutiliz�veis) �
�    ?                                    �
�  Stores (Pinia - Estado Global)         �
�    ?                                    �
�  Services (API Client - Axios)          �
+-----------------------------------------+
              ? HTTP/WebSocket
+-----------------------------------------+
�           BACKEND (Node.js)             �
+-----------------------------------------�
�  Routes (Rotas da API)                  �
�    ?                                    �
�  Middlewares (Auth, Validation)         �
�    ?                                    �
�  Controllers (Controladores)            �
�    ?                                    �
�  Services (L�gica de Neg�cio)           �
�    ?                                    �
�  Entities (Modelos TypeORM)             �
�    ?                                    �
�  Database (SQLite)                      �
+-----------------------------------------+
```

### Stack Tecnol�gica Completa

**Backend:**
- Node.js 20
- Express.js
- TypeORM
- SQLite
- TypeScript
- JWT (jsonwebtoken)
- Bcrypt (hash de senhas)
- Socket.IO (WebSocket)
- Multer (upload de arquivos)

**Frontend:**
- Vue 3
- TypeScript
- Vite (build tool)
- Vue Router
- Pinia
- Axios
- Socket.IO Client
- TailwindCSS

---

## ?? ESTRUTURA DE DIRET�RIOS

```
trocaai/
+-- backend/
�   +-- src/
�   �   +-- config/          # Configura��es (database, jwt, upload)
�   �   +-- controllers/     # Controladores (7 arquivos)
�   �   +-- services/        # L�gica de neg�cio (7 arquivos)
�   �   +-- entities/        # Modelos TypeORM (7 entidades)
�   �   +-- routes/          # Rotas da API (3 arquivos)
�   �   +-- middlewares/     # Middlewares (auth, validation)
�   �   +-- dtos/            # Data Transfer Objects
�   �   +-- types/           # Tipos TypeScript
�   �   +-- websocket/       # Handlers WebSocket
�   �   +-- server.ts        # Entrada principal
�   +-- uploads/             # Imagens enviadas
�   +-- database.sqlite      # Banco de dados
�   +-- .env                 # Vari�veis de ambiente
�   +-- package.json
�
+-- frontend/
�   +-- src/
�   �   +-- views/           # P�ginas (15+ arquivos)
�   �   +-- components/      # Componentes reutiliz�veis (12 arquivos)
�   �   +-- stores/          # Pinia stores (6 arquivos)
�   �   +-- router/          # Configura��o de rotas
�   �   +-- services/        # Cliente API (Axios)
�   �   +-- composables/     # Composables Vue
�   �   +-- layouts/         # Layouts
�   �   +-- main.ts          # Entrada principal
�   +-- index.html
�   +-- package.json
�
+-- CONFORMIDADE_REQUISITOS.md  # Documento de conformidade
+-- APRESENTACAO_PROFESSOR.md   # Esta apresenta��o
+-- replit.md                   # Documenta��o do projeto
+-- package.json                # Scripts raiz
```

---

## ?? PRINCIPAIS FUNCIONALIDADES

### 1. Autentica��o e Autoriza��o ??

**Implementa��o:**
- Login com email e senha
- Registro de novos usu�rios
- Token JWT com validade de 7 dias
- Logout com limpeza de sess�o
- 3 n�veis de acesso (Admin, Verified, Common)

**C�digo:** `backend/src/routes/authRoutes.ts`, `frontend/src/stores/auth.ts`

### 2. Gest�o de Itens ??

**Funcionalidades:**
- Cadastrar item com t�tulo, descri��o, categoria e imagens
- Upload de at� 5 imagens por item
- Editar itens pr�prios
- Deletar itens (com soft delete)
- Listar itens com pagina��o e filtros
- Visualizar detalhes do item
- Localiza��o geogr�fica (latitude, longitude)

**C�digo:** `backend/src/services/item.service.ts`, `frontend/src/views/NewItemView.vue`

### 3. Sistema de Propostas ??

**Funcionalidades:**
- Fazer proposta de troca para um item
- Aceitar ou recusar propostas recebidas
- Visualizar propostas enviadas
- Visualizar propostas recebidas
- Status: pendente, aceita, recusada

**C�digo:** `backend/src/services/proposal.service.ts`, `frontend/src/views/MyProposalsView.vue`

### 4. Chat em Tempo Real ??

**Funcionalidades:**
- Conversar com donos de itens
- Mensagens instant�neas via WebSocket
- Indicador de "digitando..."
- Marcar mensagens como lidas
- Contador de mensagens n�o lidas
- Hist�rico de conversas

**C�digo:** `backend/src/websocket/chat.socket.ts`, `frontend/src/stores/chat.ts`

### 5. Mapa de Itens ???

**Funcionalidades:**
- Visualizar itens em mapa interativo
- Filtrar por dist�ncia (raio de 50km)
- Localiza��o do usu�rio
- Busca por CEP
- Marcadores clic�veis

**C�digo:** `frontend/src/components/ItemsMap.vue`, `backend/src/services/geolocation.service.ts`

### 6. Sistema de Avalia��es ?

**Funcionalidades:**
- Avaliar usu�rios ap�s troca
- Nota de 1 a 5 estrelas
- Coment�rio opcional
- M�dia de avalia��es por usu�rio
- Hist�rico de avalia��es

**C�digo:** `backend/src/services/rating.service.ts`

### 7. Painel Administrativo ??

**Funcionalidades:**
- Dashboard com estat�sticas
- Gerenciar todos os usu�rios
- Gerenciar todos os itens
- Deletar usu�rios e itens
- Visualizar den�ncias
- Estat�sticas em tempo real

**C�digo:** `frontend/src/views/AdminView.vue`, `frontend/src/views/admin/`

### 8. Notifica��es ??

**Funcionalidades:**
- Notifica��es em tempo real
- Alertas de novas propostas
- Alertas de novas mensagens
- Contador de n�o lidas
- Hist�rico de notifica��es

**C�digo:** `backend/src/services/notification.service.ts`, `frontend/src/stores/notification.ts`

---

## ?? SEGURAN�A IMPLEMENTADA

### 1. Autentica��o JWT

```typescript
// Valida��o obrigat�ria do JWT_SECRET
export function getJWTSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET n�o configurado');
  }
  return secret;
}
```

### 2. Hash de Senhas

```typescript
// Bcrypt com salt de 10 rounds
const hashedPassword = await bcrypt.hash(senha, 10);
```

### 3. Middleware de Autentica��o

```typescript
// Verifica token em todas rotas protegidas
export const authMiddleware = (req, res, next) => {
  const token = authHeader.split(' ')[1];
  const decoded = jwt.verify(token, getJWTSecret());
  req.userId = decoded.userId;
  next();
};
```

### 4. Controle de Permiss�es

```typescript
// Middleware de roles
export const roleMiddleware = (allowedRoles: string[]) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.userRole)) {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    next();
  };
};
```

### 5. Valida��o de Dados

```typescript
// DTOs com class-validator
export class CreateItemDTO {
  @IsNotEmpty()
  @MinLength(3)
  titulo: string;

  @IsNotEmpty()
  @MinLength(10)
  descricao: string;
}
```

---

## ?? ESTAT�STICAS DO PROJETO

| M�trica | Quantidade |
|---------|------------|
| Linhas de C�digo | 15.000+ |
| Arquivos TypeScript | 80+ |
| Componentes Vue | 25+ |
| Rotas Backend | 40+ |
| Rotas Frontend | 20+ |
| Entidades (Tabelas) | 7 |
| CRUDs Implementados | 5 |
| Stores Pinia | 6 |
| Services Backend | 7 |
| Controllers | 7 |
| Middlewares | 3 |
| Views (P�ginas) | 15+ |

---

## ?? COMO TESTAR O SISTEMA

### 1. Instala��o

```bash
# Instalar todas as depend�ncias
npm install
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configura��o

```bash
# Copiar arquivo de ambiente
cp backend/.env.example backend/.env

# Editar backend/.env e adicionar:
JWT_SECRET=chave_super_secreta_aqui
```

### 3. Execu��o

```bash
# Na raiz do projeto
npm run dev

# Backend: http://localhost:3000
# Frontend: http://localhost:5000
```

### 4. Teste com Usu�rio Admin

```
Email: admin@trocaai.com
Senha: Admin@123
```

### 5. Fluxo de Teste Completo

1. **Registrar novo usu�rio** ? `/register`
2. **Fazer login** ? `/login`
3. **Cadastrar item** ? `/novo-item`
4. **Visualizar no mapa** ? `/mapa`
5. **Fazer proposta em outro item** ? Clicar em item ? "Fazer Proposta"
6. **Acessar chat** ? Conversar com dono do item
7. **Gerenciar propostas** ? `/propostas` e `/propostas-recebidas`
8. **Testar admin** ? Login com admin ? `/admin`

---

## ?? DIFERENCIAIS DO PROJETO

### Al�m dos Requisitos M�nimos:

1. **? Chat em Tempo Real** - WebSocket com Socket.IO
2. **? Geolocaliza��o** - Integra��o com mapas e GPS
3. **? Upload de Imagens** - Sistema completo com Multer
4. **? Notifica��es Push** - Alertas em tempo real
5. **? Sistema de Avalia��es** - Reputa��o de usu�rios
6. **? Soft Delete** - Dados podem ser recuperados
7. **? Valida��o Robusta** - DTOs com class-validator
8. **? Responsividade** - Design adapt�vel a mobile
9. **? Loading States** - Feedback visual em opera��es
10. **? Error Handling** - Tratamento de erros completo

---

## ?? CONCEITOS APRENDIDOS E APLICADOS

### Backend

- ? **RESTful API** - Endpoints seguindo padr�es REST
- ? **ORM (TypeORM)** - Mapeamento objeto-relacional
- ? **Middleware Pattern** - Autentica��o e valida��o
- ? **Layered Architecture** - Separa��o em camadas
- ? **JWT Authentication** - Autentica��o stateless
- ? **File Upload** - Gerenciamento de arquivos
- ? **WebSocket** - Comunica��o em tempo real
- ? **Soft Delete** - Exclus�o l�gica de dados
- ? **Pagination** - Pagina��o eficiente
- ? **Filtering** - M�ltiplos filtros de busca

### Frontend

- ? **SPA (Single Page Application)** - Navega��o sem reload
- ? **Composition API** - Vue 3 moderno
- ? **State Management (Pinia)** - Estado global
- ? **Routing** - Vue Router com guards
- ? **Reactive Programming** - Reatividade do Vue
- ? **Component Composition** - Componentes reutiliz�veis
- ? **HTTP Client** - Axios com interceptors
- ? **WebSocket Client** - Socket.IO client
- ? **TypeScript** - Tipagem est�tica
- ? **Responsive Design** - TailwindCSS

### Geral

- ? **Fullstack Development** - Backend + Frontend integrados
- ? **Git** - Controle de vers�o
- ? **Environment Variables** - Configura��o segura
- ? **Security Best Practices** - JWT, bcrypt, valida��o
- ? **Error Handling** - Tratamento de erros robusto
- ? **Documentation** - C�digo bem documentado

---

## ?? CONCLUS�O

O projeto **TrocaAi** atende e **supera todos os requisitos m�nimos** exigidos:

### Requisitos Atendidos:

- ? Todas as tecnologias obrigat�rias implementadas
- ? Composition API em 100% dos componentes (n�o usa Option API)
- ? Pinia para estado global (n�o usa Vuex)
- ? JWT com login, logout e rotas protegidas
- ? 3 pap�is de usu�rio com permiss�es diferentes
- ? C�digo organizado em camadas
- ? SPA com rota principal autom�tica
- ? Header e Footer modularizados
- ? Rotas protegidas no frontend e backend
- ? Pagina��o implementada
- ? Filtragem implementada
- ? 7 entidades (requisito: m�nimo 3)
- ? 5 CRUDs completos (requisito: m�nimo 2)
- ? Entidades com depend�ncias
- ? �rea p�blica e restrita separadas

### Qualidade do C�digo:

- ? TypeScript em 100% do c�digo
- ? Arquitetura limpa e organizada
- ? C�digo bem documentado
- ? Padr�es de nomenclatura consistentes
- ? Boas pr�ticas de desenvolvimento
- ? Seguran�a implementada corretamente

### Funcionalidades Extras:

- ? Chat em tempo real
- ? Sistema de geolocaliza��o
- ? Upload de m�ltiplas imagens
- ? Notifica��es push
- ? Sistema de avalia��es
- ? Painel administrativo completo

---

**Projeto desenvolvido com dedica��o pela equipe Dev-Connect**  
**Tecnologias:** Node.js, Express, TypeORM, SQLite, TypeScript, Vue 3, Pinia, WebSocket  
**Data:** Outubro 2025

---

## ?? SUPORTE E DOCUMENTA��O

- **Documenta��o Completa:** `CONFORMIDADE_REQUISITOS.md`
- **Arquitetura:** `arquitetura.md`
- **Fluxos:** `trocaai_feature_flows.md`
- **Mem�ria do Projeto:** `replit.md`




