<!-- DOC-META: status=ativo; ultima_revisao=2026-04-10; proxima_revisao=trimestral -->
# ??? MAPA MENTAL - TrocaAi

## Visualiza��o Estrutural do Sistema

```
                                    ?? TrocaAi
                                        �
                    +-------------------+-------------------+
                    �                   �                   �
              ?? FRONTEND          ?? BACKEND          ?? DATABASE
                    �                   �                   �
        +-----------+-----------+       �           +---------------+
        �           �           �       �           �               �
     VIEWS    COMPONENTS    STORES    ROUTES      TABLES        RELATIONS
        �           �           �       �           �               �
    +-------+   +-------+   +-------+ �       +-------+       +-------+
    �       �   �       �   �       � �       �       �       �       �
  P�ginas  UI   Chat  Mapas Auth  Item�     Users   Items   1:N    N:N
```

---

## 1?? ESTRUTURA GERAL

```
TrocaAi
�
+-- ?? FRONTEND (Vue 3)
�   +-- Views (P�ginas)
�   �   +-- P�blicas
�   �   �   +-- LandingHome
�   �   �   +-- Login
�   �   �   +-- Register
�   �   �
�   �   +-- Autenticadas
�   �   �   +-- Home
�   �   �   +-- MapView
�   �   �   +-- ItemDetails
�   �   �   +-- NewItem
�   �   �   +-- MyItems
�   �   �   +-- Profile
�   �   �   +-- MyProposals
�   �   �   +-- ReceivedProposals
�   �   �
�   �   +-- Admin
�   �       +-- Dashboard
�   �       +-- UsersView
�   �       +-- ItemsView
�   �
�   +-- Components (Componentes Reutiliz�veis)
�   �   +-- Layout
�   �   �   +-- AppHeader
�   �   �   +-- AppFooter
�   �   �   +-- AdminSidebar
�   �   �
�   �   +-- Items
�   �   �   +-- ItemCard
�   �   �   +-- ItemCardSkeleton
�   �   �   +-- ImageUpload
�   �   �
�   �   +-- Maps
�   �   �   +-- ItemsMap
�   �   �   +-- LocationPicker
�   �   �
�   �   +-- Chat
�   �       +-- FloatingChat
�   �
�   +-- Stores (Pinia - Estado Global)
�   �   +-- auth ? Autentica��o
�   �   +-- item ? Gerenciar items
�   �   +-- chat ? Chat em tempo real
�   �   +-- proposal ? Propostas
�   �   +-- notification ? Notifica��es
�   �   +-- admin ? Painel admin
�   �
�   +-- Router (Navega��o)
�   �   +-- Rotas p�blicas
�   �   +-- Rotas protegidas (auth)
�   �   +-- Rotas admin
�   �
�   +-- Services (API Calls)
�       +-- api.ts ? Axios configurado
�
+-- ?? BACKEND (Node.js + Express)
�   +-- Config
�   �   +-- database ? TypeORM
�   �   +-- jwt ? Configura��o JWT
�   �   +-- upload ? Multer
�   �
�   +-- Routes (Endpoints)
�   �   +-- /auth ? Login, Register
�   �   +-- /items ? CRUD items
�   �   +-- /proposals ? CRUD propostas
�   �   +-- /chat ? Conversas
�   �   +-- /notifications ? Notifica��es
�   �   +-- /ratings ? Avalia��es
�   �   +-- /reports ? Den�ncias
�   �
�   +-- Controllers (HTTP Handlers)
�   �   +-- UserController
�   �   +-- ItemController
�   �   +-- ProposalController
�   �   +-- ChatController
�   �   +-- NotificationController
�   �   +-- RatingController
�   �   +-- ReportController
�   �
�   +-- Services (L�gica de Neg�cio)
�   �   +-- UserService
�   �   +-- ItemService
�   �   +-- ProposalService
�   �   +-- ChatService
�   �   +-- NotificationService
�   �   +-- RatingService
�   �   +-- ReportService
�   �
�   +-- Entities (Modelos TypeORM)
�   �   +-- User
�   �   +-- Item
�   �   +-- Proposal
�   �   +-- ChatMessage
�   �   +-- Notification
�   �   +-- Rating
�   �   +-- Report
�   �
�   +-- Middlewares
�   �   +-- authMiddleware ? Valida JWT
�   �   +-- roleMiddleware ? Verifica permiss�es
�   �   +-- validateDTO ? Valida entrada
�   �
�   +-- WebSocket
�       +-- ChatSocketHandler ? Socket.IO
�
+-- ?? DATABASE (SQLite)
    +-- users
    +-- items
    +-- proposals
    +-- chat_messages
    +-- notifications
    +-- ratings
    +-- reports
```

---

## 2?? FLUXO DE DADOS

### Fluxo HTTP (REST API)

```
+-------------+
�   Cliente   �
�  (Browser)  �
+-------------+
       �
       � 1. Requisi��o HTTP
       �    (GET, POST, PUT, DELETE)
       ?
+-----------------+
�  Vue Router     � --- Gerencia navega��o
+-----------------+
       �
       � 2. Carrega View
       ?
+-----------------+
�  View/Component � --- Interface do usu�rio
+-----------------+
       �
       � 3. Interage com Store
       ?
+-----------------+
�  Pinia Store    � --- Estado reativo
+-----------------+
       �
       � 4. Chama API Service
       ?
+-----------------+
�  api.ts (Axios) � --- Cliente HTTP
+-----------------+
       �
       � 5. HTTP Request
       �    (com JWT token)
       ?
+-----------------+
�  Express Routes � --- Define endpoints
+-----------------+
       �
       � 6. Middleware Chain
       ?
+-----------------+
�  authMiddleware � --- Valida JWT
+-----------------+
       �
       ?
+-----------------+
� validateDTO     � --- Valida dados
+-----------------+
       �
       � 7. Chama Controller
       ?
+-----------------+
�   Controller    � --- Handler de rota
+-----------------+
       �
       � 8. Chama Service
       ?
+-----------------+
�     Service     � --- L�gica de neg�cio
+-----------------+
       �
       � 9. Manipula Entity
       ?
+-----------------+
�  TypeORM Entity � --- Modelo de dados
+-----------------+
       �
       � 10. Query SQL
       ?
+-----------------+
�  SQLite Database� --- Persist�ncia
+-----------------+
       �
       � 11. Retorna dados
       ?
+-----------------+
�  HTTP Response  � --- JSON
+-----------------+
       �
       � 12. Atualiza Store
       ?
+-----------------+
�  Pinia Store    � --- Estado atualizado
+-----------------+
       �
       � 13. Vue reatividade
       ?
+-----------------+
�  View atualizada� --- UI reflete mudan�as
+-----------------+
```

### Fluxo WebSocket (Chat em Tempo Real)

```
+--------------+                    +--------------+
�  Usu�rio A   �                    �  Usu�rio B   �
+--------------+                    +--------------+
       �                                   �
       � 1. Conecta WebSocket              �
       �    (com JWT token)                �
       +----------+                        �
       �          ?                        �
       �    +-------------+                �
       �    � Socket.IO   �                �
       �    �   Server    �                �
       �    +-------------+                �
       �          �                        �
       �          � 2. Autentica           �
       �          �    via JWT             �
       �          ?                        �
       �    +-------------+                �
       �    �socket.join  �                �
       �    �(`user:123`) �                �
       �    +-------------+                �
       �                                   �
       � 3. Envia mensagem                 �
       �    emit('message:send')           �
       +----------------------------------?�
       �                                   �
       �          +-------------+          �
       �          �ChatService  �          �
       �          �.createMessage�         �
       �          +-------------+          �
       �                �                  �
       �                ?                  �
       �          +-------------+          �
       �          �  Database   �          �
       �          � (salva msg) �          �
       �          +-------------+          �
       �                �                  �
       �                ?                  �
       �       4. Emite para receiver      �
       �    io.to(`user:456`)              �
       �      .emit('message:received')    �
       �                                   ?
       �?----------------------------------�
       �                                   �
       � 5. Confirma sender                �
       �    emit('message:sent')           �
       ?                                   �
```

---

## 3?? FUNCIONALIDADES PRINCIPAIS

### ?? Autentica��o

```
Autentica��o (JWT)
�
+-- Registro
�   +-- Validar email �nico
�   +-- Criptografar senha (bcrypt)
�   +-- Criar usu�rio
�   +-- Gerar token JWT
�
+-- Login
�   +-- Validar credenciais
�   +-- Comparar senha hash
�   +-- Gerar token JWT
�
+-- Autoriza��o
    +-- authMiddleware
    �   +-- Extrai token
    �   +-- Verifica JWT
    �   +-- Adiciona userId ao req
    �
    +-- roleMiddleware
        +-- Verifica role do usu�rio
        +-- Permite/Nega acesso
```

### ?? Gerenciamento de Items

```
Items
�
+-- Criar
�   +-- Upload de imagens (Multer)
�   +-- Validar dados (DTO)
�   +-- Salvar localiza��o (GPS)
�   +-- Status: 'disponivel'
�
+-- Listar
�   +-- Filtros
�   �   +-- Categoria
�   �   +-- Busca (t�tulo/descri��o)
�   �   +-- Status
�   �   +-- Geolocaliza��o
�   �
�   +-- Pagina��o
�       +-- Page
�       +-- Limit
�       +-- Total
�
+-- Visualizar
�   +-- Detalhes completos
�   +-- Galeria de imagens
�   +-- Mapa (localiza��o)
�   +-- Informa��es do dono
�
+-- Editar
�   +-- Apenas dono ou admin
�   +-- Atualizar dados
�   +-- Adicionar/remover imagens
�
+-- Deletar
�   +-- Soft delete (deletedAt)
�   +-- Apenas dono ou admin
�
+-- Atualizar Status
    +-- disponivel
    +-- em_negociacao
    +-- trocado
```

### ?? Sistema de Propostas

```
Propostas
�
+-- Criar
�   +-- Validar item dispon�vel
�   +-- Validar proposer ? dono
�   +-- Criar proposta
�   +-- Notificar dono do item
�
+-- Listar
�   +-- Enviadas (proposer)
�   +-- Recebidas (dono do item)
�
+-- Atualizar Status
    +-- Aceitar
    �   +-- Status ? 'aceita'
    �   +-- Item ? 'em_negociacao'
    �   +-- Notificar proposer
    �   +-- Habilitar chat
    �
    +-- Recusar
        +-- Status ? 'recusada'
        +-- Notificar proposer
```

### ?? Chat em Tempo Real

```
Chat (WebSocket)
�
+-- Conex�o
�   +-- Autentica��o JWT
�   +-- socket.join(`user:${userId}`)
�   +-- Listeners de eventos
�
+-- Conversas
�   +-- Listar conversas ativas
�   +-- Contador de n�o lidas
�   +-- �ltima mensagem
�
+-- Mensagens
�   +-- Enviar
�   �   +-- emit('message:send')
�   �   +-- Salvar no banco
�   �   +-- emit('message:received') ? receiver
�   �   +-- emit('message:sent') ? sender
�   �
�   +-- Receber
�   �   +-- Adicionar � lista
�   �   +-- Incrementar unread
�   �   +-- Notifica��o visual/sonora
�   �
�   +-- Marcar como lida
�       +-- POST /chat/read
�       +-- Atualizar lida = true
�
+-- Eventos Adicionais
    +-- user:typing
    +-- user:online
    +-- unread:update
```

### ? Sistema de Avalia��es

```
Avalia��es
�
+-- Criar
�   +-- De: fromUserId
�   +-- Para: toUserId
�   +-- Estrelas: 1-5
�   +-- Coment�rio (opcional)
�
+-- Listar
�   +-- Por usu�rio (toUserId)
�
+-- Calcular M�dia
    +-- Soma total / quantidade
    +-- Badge "Verificado" se > 4.5
```

### ?? Sistema de Den�ncias

```
Den�ncias
�
+-- Tipos
�   +-- user (denunciar usu�rio)
�   +-- item (denunciar item)
�
+-- Criar
�   +-- Reporter (quem denuncia)
�   +-- Reported (quem/o que foi denunciado)
�   +-- Motivo
�   +-- Descri��o
�
+-- Status
�   +-- pendente
�   +-- em_analise
�   +-- resolvida
�
+-- Modera��o (Admin)
    +-- Listar den�ncias
    +-- Analisar detalhes
    +-- Atualizar status
    +-- Registrar a��o
```

### ?? Sistema de Notifica��es

```
Notifica��es
�
+-- Tipos
�   +-- NEW_PROPOSAL
�   +-- PROPOSAL_ACCEPTED
�   +-- PROPOSAL_REJECTED
�   +-- NEW_MESSAGE
�   +-- NEW_RATING
�
+-- Criar
�   +-- Trigger autom�tico
�   +-- userId (destinat�rio)
�   +-- type, title, message
�   +-- link (opcional)
�
+-- Listar
�   +-- GET /notifications (ordenadas por data)
�
+-- Marcar como lida
    +-- PATCH /notifications/:id/read
```

---

## 4?? SEGURAN�A E VALIDA��O

```
Seguran�a
�
+-- ?? Senhas
�   +-- bcrypt hash (10 rounds)
�   +-- Nunca em plaintext
�   +-- Compare on login
�
+-- ?? JWT Tokens
�   +-- HS256 algorithm
�   +-- Secret do .env
�   +-- Expiration: 7 dias
�   +-- Payload: { userId, email, role }
�
+-- ??? Middlewares
�   +-- authMiddleware
�   �   +-- Verifica token
�   �   +-- Adiciona userId
�   �
�   +-- roleMiddleware
�   �   +-- Verifica permiss�es
�   �
�   +-- validateDTO
�       +-- class-validator
�
+-- ?? DTOs (Data Transfer Objects)
�   +-- CreateUserDTO
�   +-- CreateItemDTO
�   +-- CreateProposalDTO
�   +-- ... (valida��o com decorators)
�
+-- ?? CORS
    +-- Apenas FRONTEND_URL permitido
```

---

## 5?? TECNOLOGIAS E FERRAMENTAS

```
Stack Tecnol�gico
�
+-- Backend
�   +-- Runtime: Node.js 20
�   +-- Linguagem: TypeScript
�   +-- Framework: Express.js
�   +-- ORM: TypeORM
�   +-- Database: SQLite
�   +-- WebSocket: Socket.IO
�   +-- Auth: JWT (jsonwebtoken)
�   +-- Crypto: bcryptjs
�   +-- Upload: Multer
�   +-- Valida��o: class-validator
�
+-- Frontend
�   +-- Framework: Vue 3
�   +-- Linguagem: TypeScript
�   +-- Build: Vite
�   +-- Router: Vue Router
�   +-- State: Pinia
�   +-- HTTP: Axios
�   +-- WebSocket: Socket.IO Client
�   +-- CSS: TailwindCSS
�   +-- Icons: Lucide Icons
�
+-- DevOps
�   +-- Ambiente: Replit
�   +-- Concurrent: concurrently
�   +-- Hot Reload: ts-node-dev (backend), Vite HMR (frontend)
�   +-- Testes: Jest
�
+-- Ferramentas
    +-- Git (controle de vers�o)
    +-- npm (gerenciador de pacotes)
    +-- TypeScript Compiler
```

---

## 6?? ESTRUTURA DE ARQUIVOS

```
trocaai/
�
+-- ?? backend/
�   +-- src/
�   �   +-- config/           (Configura��es)
�   �   +-- controllers/      (HTTP Handlers)
�   �   +-- dtos/             (Valida��o)
�   �   +-- entities/         (Modelos)
�   �   +-- middlewares/      (Auth, Validation)
�   �   +-- routes/           (Endpoints)
�   �   +-- services/         (L�gica)
�   �   +-- websocket/        (Socket.IO)
�   �   +-- server.ts         (Entry point)
�   �
�   +-- uploads/              (Imagens)
�   +-- database.sqlite       (BD)
�   +-- package.json
�   +-- tsconfig.json
�
+-- ?? frontend/
�   +-- src/
�   �   +-- assets/           (CSS global)
�   �   +-- components/       (UI Components)
�   �   +-- composables/      (L�gica reutiliz�vel)
�   �   +-- layouts/          (Layouts)
�   �   +-- router/           (Rotas)
�   �   +-- services/         (API)
�   �   +-- stores/           (Pinia)
�   �   +-- types/            (TypeScript)
�   �   +-- views/            (P�ginas)
�   �   +-- App.vue
�   �   +-- main.ts
�   �
�   +-- index.html
�   +-- package.json
�   +-- vite.config.ts
�   +-- tailwind.config.js
�
+-- package.json              (Scripts raiz)
+-- .gitignore
+-- replit.md
```

---

## 7?? BANCO DE DADOS

```
Database Schema (SQLite)
�
+-- ?? users
�   +-- id (PK)
�   +-- nome
�   +-- email (UNIQUE)
�   +-- senha (hash)
�   +-- role
�   +-- telefone
�   +-- cidade, estado
�   +-- latitude, longitude
�   +-- createdAt, updatedAt
�
+-- ?? items
�   +-- id (PK)
�   +-- ownerId (FK ? users)
�   +-- titulo
�   +-- descricao
�   +-- categoria
�   +-- status
�   +-- imagens (JSON)
�   +-- latitude, longitude
�   +-- createdAt, updatedAt
�   +-- deletedAt (soft delete)
�
+-- ?? proposals
�   +-- id (PK)
�   +-- itemId (FK ? items)
�   +-- proposerId (FK ? users)
�   +-- mensagem
�   +-- status
�   +-- createdAt, updatedAt
�
+-- ?? chat_messages
�   +-- id (PK)
�   +-- senderId (FK ? users)
�   +-- receiverId (FK ? users)
�   +-- itemId (FK ? items)
�   +-- conteudo
�   +-- lida
�   +-- createdAt, updatedAt
�
+-- ?? notifications
�   +-- id (PK)
�   +-- userId (FK ? users)
�   +-- type
�   +-- title, message
�   +-- link
�   +-- read
�   +-- createdAt
�
+-- ? ratings
�   +-- id (PK)
�   +-- fromUserId (FK ? users)
�   +-- toUserId (FK ? users)
�   +-- itemId (FK ? items, nullable)
�   +-- stars (1-5)
�   +-- comment
�   +-- createdAt
�
+-- ?? reports
    +-- id (PK)
    +-- reporterId (FK ? users)
    +-- type (user/item)
    +-- reportedUserId (FK ? users, nullable)
    +-- reportedItemId (FK ? items, nullable)
    +-- reason
    +-- description
    +-- status
    +-- actionTaken
    +-- createdAt, updatedAt
```

---

## 8?? CASOS DE USO PRINCIPAIS

### Caso 1: Usu�rio faz troca completa

```
1. Login/Registro
   ?
2. Navega e encontra item de interesse
   ?
3. Faz proposta
   ?
4. Dono recebe notifica��o
   ?
5. Dono aceita proposta
   ?
6. Ambos recebem notifica��o
   ?
7. Chat abre automaticamente
   ?
8. Negociam detalhes via chat
   ?
9. Combinam encontro
   ?
10. Marcam item como "trocado"
    ?
11. Avaliam um ao outro
```

### Caso 2: Admin modera plataforma

```
1. Login como admin
   ?
2. Acessa /admin
   ?
3. Visualiza dashboard
   ?
4. Verifica den�ncias pendentes
   ?
5. Analisa den�ncia
   ?
6. Toma a��o (ban, warning)
   ?
7. Atualiza status
   ?
8. Registra a��o tomada
```

---

## 9?? FLUXO DE DESENVOLVIMENTO

```
Desenvolvimento
�
+-- ?? Setup Local
�   +-- 1. Clone reposit�rio
�   +-- 2. npm install (raiz)
�   +-- 3. cd backend && npm install
�   +-- 4. cd frontend && npm install
�   +-- 5. Configure .env
�   +-- 6. npm run dev
�
+-- ??? Estrutura de Pastas
�   +-- Backend: Camadas (Routes ? Controllers ? Services ? Entities)
�   +-- Frontend: Features (Views ? Components ? Stores ? Services)
�
+-- ?? UI/UX
�   +-- TailwindCSS (utility-first)
�   +-- Componentes reutiliz�veis
�   +-- Design responsivo
�   +-- Gradientes modernos
�
+-- ?? C�digo Limpo
�   +-- TypeScript (tipos fortes)
�   +-- Naming conventions
�   +-- Coment�rios explicativos
�   +-- DRY (Don't Repeat Yourself)
�
+-- ?? Testes
    +-- Jest (backend)
    +-- Testes de integra��o
    +-- Testes unit�rios
```

---

## ?? RESUMO VISUAL

```
+-------------------------------------------------------------+
�                      TrocaAi Platform                        �
�                                                               �
�  ?? Usu�rios ? ?? Items ? ?? Propostas ? ?? Chat ? ? Ratings �
�                            ?                                  �
�                      ?? Notifica��es                          �
�                            ?                                  �
�                      ?? Admin Panel                           �
�                            ?                                  �
�                      ?? Modera��o                             �
+-------------------------------------------------------------+

Tecnologias Core:
Frontend: Vue 3 + TypeScript + Vite + Pinia + TailwindCSS
Backend:  Node.js + TypeScript + Express + TypeORM + SQLite
Real-time: Socket.IO (WebSocket)
Security:  JWT + bcrypt
```

---

**Mapa Mental criado em:** Outubro 2025  
**Para:** Visualiza��o r�pida do sistema TrocaAi




