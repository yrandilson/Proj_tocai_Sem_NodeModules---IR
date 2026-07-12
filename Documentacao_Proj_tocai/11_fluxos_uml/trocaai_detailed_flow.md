<!-- DOC-META: status=ativo; ultima_revisao=2026-04-10; proxima_revisao=trimestral -->
# ?? Fluxo Completo da Arquitetura - TrocaAi

## ?? FRONTEND (Vue.js + TypeScript)

```
?? **index.html** - Ponto de Entrada da Aplica��o
 �  (Carrega o JavaScript principal via <script src="/src/main.ts">)
 �
 +--?? **main.ts** - Inicializador do Vue.js
      �  - Cria a aplica��o Vue: `createApp(App)`
      �  - Instala o Pinia: `app.use(createPinia())` (Gerenciamento de Estado Global)
      �  - Instala o Vue Router: `app.use(router)` (Navega��o entre p�ginas)
      �  - Conecta chat ao montar: `chatStore.connect()` (WebSocket)
      �  - Monta a aplica��o: `app.mount('#app')`
      �
      +--?? **App.vue** - Layout Principal Global
      �    �  - Renderiza componentes globais fixos:
      �    �
      �    +--?? **AppHeader.vue** (Cabe�alho)
      �    �    �  - Logo e navega��o
      �    �    �  - Bot�o "Novo Item"
      �    �    �  - Badge de notifica��es (notificationStore.unreadCount + chatStore.unreadCount)
      �    �    �  - Dropdown do usu�rio (Perfil, Logout)
      �    �    �  - Menu Admin (se authStore.isAdmin)
      �    �    +--?? Depende de: `stores/auth.ts`, `stores/notification.ts`, `stores/chat.ts`
      �    �
      �    +--?? **AppFooter.vue** (Rodap�)
      �    �    �  - Links r�pidos
      �    �    �  - Informa��es do projeto
      �    �    +--?? Copyright 2025
      �    �
      �    +--?? **FloatingChat.vue** (Chat Flutuante)
      �    �    �  - Badge de mensagens n�o lidas (chatStore.unreadCount)
      �    �    �  - Lista de conversas (chatStore.conversations)
      �    �    �  - Janela de mensagens (chatStore.currentMessages)
      �    �    �  - Input de envio (chatStore.sendMessage)
      �    �    �  - Status online/offline (chatStore.onlineUsers)
      �    �    �  - Indicador "digitando..." (chatStore.typingUsers)
      �    �    +--?? Depende de: `stores/chat.ts`, `stores/auth.ts`
      �    �
      �    +--?? **<router-view />** - Ponto de Inje��o das Views
      �         (O Vue Router injeta dinamicamente o componente da rota atual aqui)
      �
      +--?? **router/index.ts** (Vue Router) - O C�rebro da Navega��o
           �  - Mapeia URLs para componentes de Vis�o (.vue)
           �  - Exemplos de rotas:
           �    - `/` ? HomeView.vue
           �    - `/login` ? LoginView.vue
           �    - `/items/:id` ? ItemDetailsView.vue
           �    - `/meus-itens` ? MyItemsView.vue (protegida)
           �    - `/admin` ? AdminView.vue (protegida + admin)
           �
           +--?? **Guard: beforeEach** - Prote��o de Rotas
                �  - Verifica `authStore.isAuthenticated` antes de acessar rotas protegidas
                �  - Verifica `authStore.isAdmin` para rotas administrativas
                �  - Redireciona para `/login` se n�o autenticado
                �  - **Depende de:** `stores/auth.ts`
                �
                +--?? **views/*.vue** - As P�ginas da Aplica��o
                     �
                     +--?? **P�GINAS P�BLICAS** (N�o requerem autentica��o)
                     �    �
                     �    +- **HomeView.vue** - P�gina Inicial
                     �    �   �  - Lista todos os itens dispon�veis
                     �    �   �  - Busca por t�tulo
                     �    �   �  - Filtros por categoria
                     �    �   �  - Pagina��o
                     �    �   +--?? Chama: `itemStore.fetchItems()`
                     �    �
                     �    +- **MapView.vue** - Mapa de Itens
                     �    �   �  - Exibe itens no mapa (lat/lng)
                     �    �   �  - Raio de busca ajust�vel
                     �    �   �  - C�lculo de dist�ncia
                     �    �   �  - Filtros por categoria
                     �    �   +--?? Chama: `itemStore.fetchItems()`, usa `ItemsMap.vue`
                     �    �
                     �    +- **ItemDetailsView.vue** - Detalhes do Item
                     �    �   �  - Exibe informa��es completas do item
                     �    �   �  - Carrossel de imagens
                     �    �   �  - Bot�o "Fazer Proposta" (se autenticado)
                     �    �   �  - Perfil do dono do item
                     �    �   +--?? Chama: `itemStore.fetchItemById()`, `proposalStore.createProposal()`
                     �    �
                     �    +- **LoginView.vue** - Login
                     �    �   �  - Formul�rio de login (email + senha)
                     �    �   �  - Valida��o de campos
                     �    �   +--?? Chama: `authStore.login()`
                     �    �
                     �    +- **RegisterView.vue** - Cadastro
                     �        �  - Formul�rio de cadastro (nome, email, senha)
                     �        �  - Valida��o de campos
                     �        +--?? Chama: `authStore.register()`
                     �
                     +--?? **P�GINAS AUTENTICADAS** (Requerem autentica��o)
                     �    �
                     �    +- **MyItemsView.vue** - Meus Itens
                     �    �   �  - Lista itens do usu�rio logado
                     �    �   �  - Bot�es: Editar, Deletar, Ver
                     �    �   �  - Badge de status (dispon�vel/indispon�vel)
                     �    �   +--?? Chama: `itemStore.fetchMyItems()`, `itemStore.deleteItem()`
                     �    �
                     �    +- **NewItemView.vue** - Cadastrar Item
                     �    �   �  - Formul�rio completo de cadastro
                     �    �   �  - Upload m�ltiplo de imagens (Multer no backend)
                     �    �   �  - Sele��o de categoria
                     �    �   �  - Geolocaliza��o (navigator.geolocation)
                     �    �   +--?? Chama: `itemStore.createItem(formData)`
                     �    �
                     �    +- **EditItemView.vue** - Editar Item
                     �    �   �  - Carrega dados do item
                     �    �   �  - Permite edi��o de campos
                     �    �   +--?? Chama: `itemStore.fetchItemById()`, `itemStore.updateItem()`
                     �    �
                     �    +- **MyProposalsView.vue** - Minhas Propostas Enviadas
                     �    �   �  - Lista propostas que o usu�rio fez
                     �    �   �  - Status: pendente, aceita, recusada
                     �    �   �  - Bot�o para abrir chat
                     �    �   +--?? Chama: `proposalStore.fetchSentProposals()`
                     �    �
                     �    +- **ReceivedProposalsView.vue** - Propostas Recebidas
                     �    �   �  - Lista propostas nos itens do usu�rio
                     �    �   �  - Bot�es: Aceitar, Recusar (se pendente)
                     �    �   �  - Modal com detalhes completos
                     �    �   �  - Abre chat automaticamente ao aceitar
                     �    �   +--?? Chama: `proposalStore.fetchReceivedProposals()`,
                     �    �        `proposalStore.respondToProposal()`,
                     �    �        `chatStore.openChatWithConversation()`
                     �    �
                     �    +- **ProfileView.vue** - Perfil do Usu�rio
                     �    �   �  - Dados do usu�rio logado
                     �    �   �  - Edi��o de informa��es
                     �    �   �  - Estat�sticas (itens, propostas)
                     �    �   +--?? Chama: `authStore.user`, `authStore.updateUser()`
                     �    �
                     �    +- **UserProfileView.vue** - Perfil P�blico de Outro Usu�rio
                     �        �  - Visualiza��o de perfil p�blico
                     �        �  - Itens do usu�rio
                     �        �  - Avalia��es (se implementado)
                     �        +--?? Chama: `api.get('/api/users/:id')`
                     �
                     +--?? **P�GINAS ADMIN** (Requerem role: admin)
                          �
                          +- **AdminView.vue** - Dashboard Administrativo
                              �  - Estat�sticas gerais (usu�rios, itens, propostas)
                              �  - Gerenciamento de usu�rios (listar, deletar, alterar role)
                              �  - Gerenciamento de itens (listar, deletar)
                              +--?? Chama: `api.get('/api/users')`, `api.delete('/api/users/:id')`,
                                   `api.patch('/api/users/:id/role')`, `api.get('/api/items')`,
                                   `api.delete('/api/items/:id')`

```

---

## ??? STORES (Pinia) - Gerenciamento de Estado

```
?? **stores/** - O Cora��o da L�gica de Neg�cio do Frontend

+--?? **auth.ts** - Autentica��o e Usu�rio
�    �  **Estado:**
�    �    - user: User | null (dados do usu�rio logado)
�    �    - token: string | null (JWT)
�    �    - isAuthenticated: boolean
�    �    - isAdmin: boolean
�    �
�    �  **A��es:**
�    �    - login(email, senha) ? POST /api/auth/login
�    �    - register(nome, email, senha) ? POST /api/auth/register
�    �    - logout() ? limpa localStorage e redireciona
�    �    - checkAuth() ? GET /api/auth/me (verifica token)
�    �
�    +--?? Depende de: `services/api.ts`, `localStorage`

+--?? **item.ts** - Gerenciamento de Itens
�    �  **Estado:**
�    �    - items: Item[] (lista de itens)
�    �    - myItems: Item[] (itens do usu�rio)
�    �    - currentItem: Item | null (item sendo visualizado)
�    �    - loading: boolean
�    �    - pagination: { page, limit, total, totalPages }
�    �
�    �  **A��es:**
�    �    - fetchItems(filters) ? GET /api/items?page=1&category=X
�    �    - fetchItemById(id) ? GET /api/items/:id
�    �    - fetchMyItems() ? GET /api/items/my
�    �    - createItem(formData) ? POST /api/items (multipart/form-data)
�    �    - updateItem(id, data) ? PUT /api/items/:id
�    �    - deleteItem(id) ? DELETE /api/items/:id
�    �    - fetchCategories() ? GET /api/items/categories
�    �
�    +--?? Depende de: `services/api.ts`

+--?? **proposal.ts** - Propostas de Troca
�    �  **Estado:**
�    �    - sentProposals: Proposal[] (propostas enviadas)
�    �    - receivedProposals: Proposal[] (propostas recebidas)
�    �    - loading: boolean
�    �
�    �  **A��es:**
�    �    - fetchSentProposals() ? GET /api/proposals/sent
�    �    - fetchReceivedProposals() ? GET /api/proposals/received
�    �    - createProposal(data) ? POST /api/proposals
�    �    - respondToProposal(id, status) ? PATCH /api/proposals/:id/respond
�    �        (status: 'aceita' | 'recusada')
�    �
�    +--?? Depende de: `services/api.ts`, `stores/notification.ts`

+--?? **chat.ts** - Chat em Tempo Real
�    �  **Estado:**
�    �    - socket: Socket | null (conex�o WebSocket)
�    �    - conversations: Conversation[] (lista de conversas)
�    �    - currentMessages: ChatMessage[] (mensagens da conversa atual)
�    �    - onlineUsers: Set<number> (IDs de usu�rios online)
�    �    - typingUsers: Map<string, boolean> (quem est� digitando)
�    �    - isChatOpen: boolean
�    �    - selectedConversation: Conversation | null
�    �    - conversationToOpen: { otherUserId, itemId } | null
�    �
�    �  **Computed:**
�    �    - connected: boolean (socket?.connected)
�    �    - unreadCount: number (soma de n�o lidas)
�    �
�    �  **A��es:**
�    �    - connect() ? Conecta ao WebSocket (Socket.IO)
�    �    - disconnect() ? Desconecta
�    �    - fetchConversations() ? GET /api/chat/conversations
�    �    - fetchMessages(otherUserId, itemId) ? GET /api/chat/messages/:userId/:itemId
�    �    - sendMessage(otherUserId, itemId, content) ? Emite evento 'message:send'
�    �    - markAsRead(otherUserId, itemId) ? POST /api/chat/read + emit 'message:read'
�    �    - notifyTyping(otherUserId, itemId, isTyping) ? emit 'user:typing'
�    �    - openChatWithConversation(otherUserId, itemId) ? Sinaliza para abrir chat
�    �
�    �  **Listeners WebSocket:**
�    �    - 'connect' ? Solicita lista de online
�    �    - 'disconnect' ? Log
�    �    - 'message:received' ? Adiciona mensagem, atualiza conversas
�    �    - 'unread:update' ? Atualiza contador
�    �    - 'user:online_list' ? Atualiza Set de online
�    �    - 'user:online' ? Adiciona ao Set
�    �    - 'user:offline' ? Remove do Set
�    �    - 'user:typing' ? Atualiza Map de digitando
�    �
�    +--?? Depende de: `services/api.ts`, `socket.io-client`, `stores/auth.ts`

+--?? **notification.ts** - Notifica��es
     �  **Estado:**
     �    - notifications: Notification[] (lista de notifica��es)
     �    - loading: boolean
     �
     �  **Computed:**
     �    - unreadCount: number (notifica��es n�o lidas)
     �
     �  **A��es:**
     �    - fetchNotifications() ? GET /api/notifications
     �    - markAsRead(id) ? PATCH /api/notifications/:id/read
     �
     +--?? Depende de: `services/api.ts`
```

---

## ?? SERVICES - Camada de Comunica��o

```
?? **services/**

+--?? **api.ts** - O Mensageiro para o Backend
     �  **Configura��o:**
     �    - Cria inst�ncia do Axios
     �    - baseURL: `import.meta.env.VITE_API_URL || 'http://localhost:3000'`
     �    - timeout: 10000ms
     �    - headers: { 'Content-Type': 'application/json' }
     �
     �  **Interceptors de Request:**
     �    - Antes de cada requisi��o:
     �      1. Busca token do localStorage
     �      2. Se token existe, adiciona header: `Authorization: Bearer ${token}`
     �      3. Log da requisi��o (em dev)
     �
     �  **Interceptors de Response:**
     �    - Em caso de erro 401 (N�o autorizado):
     �      1. Remove token do localStorage
     �      2. Redireciona para /login
     �    - Em caso de outros erros:
     �      1. Log do erro
     �      2. Repassa o erro para o caller
     �
     +-----------------?? ENVIA REQUISI��O HTTP ??------------------+
                                                                     �
                                                                     ?
```

---

## ?? BACKEND (Node.js + Express + TypeORM)

```
?? **HTTP REQUEST CHEGA NO BACKEND**

?? **backend/src/server.ts** - Servidor Principal
 �  - Inicializa Express
 �  - Configura CORS
 �  - Configura Middlewares (body-parser, express.json)
 �  - Cria servidor HTTP: `createServer(app)`
 �  - Inicializa Socket.IO: `new Server(httpServer)`
 �  - Conecta ao banco: `AppDataSource.initialize()`
 �  - Registra rotas: `app.use('/api', routes)`
 �  - Inicializa WebSocket: `new ChatSocketHandler(io)`
 �  - Escuta na porta 3000
 �
 +--?? **backend/src/routes/index.ts** - Roteador Principal
      �  - Importa todos os controllers
      �  - Mapeia rotas para controllers
      �
      +--?? **ROTAS DE AUTENTICA��O** (/api/auth/*)
      �    �
      �    +- POST /api/auth/register ? userController.register()
      �    +- POST /api/auth/login ? userController.login()
      �    +- GET /api/auth/me ? authMiddleware ? userController.getMe()
      �
      +--?? **ROTAS DE ITENS** (/api/items/*)
      �    �
      �    +- GET /api/items ? itemController.findAll()
      �    �   (Aceita query params: page, limit, category, search, status)
      �    +- GET /api/items/:id ? itemController.findOne()
      �    +- POST /api/items ? authMiddleware ? itemController.create()
      �    �   (Upload de imagens via Multer middleware)
      �    +- PUT /api/items/:id ? authMiddleware ? itemController.update()
      �    +- DELETE /api/items/:id ? authMiddleware ? itemController.delete()
      �    +- GET /api/items/my ? authMiddleware ? itemController.findMyItems()
      �    +- PATCH /api/items/:id/status ? authMiddleware ? itemController.updateStatus()
      �
      +--?? **ROTAS DE PROPOSTAS** (/api/proposals/*)
      �    �
      �    +- GET /api/proposals/sent ? authMiddleware ? proposalController.findSent()
      �    +- GET /api/proposals/received ? authMiddleware ? proposalController.findReceived()
      �    +- POST /api/proposals ? authMiddleware ? proposalController.create()
      �    +- PATCH /api/proposals/:id/respond ? authMiddleware ? proposalController.respond()
      �        (body: { status: 'aceita' | 'recusada' })
      �
      +--?? **ROTAS DE CHAT** (/api/chat/*)
      �    �
      �    +- GET /api/chat/conversations ? authMiddleware ? chatController.getConversations()
      �    +- GET /api/chat/messages/:otherUserId/:itemId ? authMiddleware ? chatController.getMessages()
      �    +- POST /api/chat/read ? authMiddleware ? chatController.markAsRead()
      �    +- GET /api/chat/unread-count ? authMiddleware ? chatController.getUnreadCount()
      �    +- DELETE /api/chat/conversation/:otherUserId/:itemId ? authMiddleware ? chatController.deleteConversation()
      �
      +--?? **ROTAS DE NOTIFICA��ES** (/api/notifications/*)
      �    �
      �    +- GET /api/notifications ? authMiddleware ? notificationController.findByUser()
      �    +- PATCH /api/notifications/:id/read ? authMiddleware ? notificationController.markAsRead()
      �
      +--?? **ROTAS ADMIN** (/api/admin/*)
      �    �
      �    +- GET /api/admin/items ? authMiddleware ? requireAdmin ? adminController.getAllItems()
      �    +- DELETE /api/admin/items/:id ? authMiddleware ? requireAdmin ? adminController.deleteItem()
      �    +- GET /api/users ? authMiddleware ? requireAdmin ? userController.findAll()
      �    +- PATCH /api/users/:id/role ? authMiddleware ? requireAdmin ? userController.updateRole()
      �    +- DELETE /api/users/:id ? authMiddleware ? requireAdmin ? userController.delete()
      �
      +--?? **MIDDLEWARE DE AUTENTICA��O**
           �
           +--?? **authMiddleware** (backend/src/middlewares/auth.middleware.ts)
           �    �  1. Extrai token do header Authorization
           �    �  2. Verifica token com JWT
           �    �  3. Decodifica payload: { userId, role }
           �    �  4. Busca usu�rio no banco
           �    �  5. Anexa userId e role ao request
           �    �  6. Chama next() ou retorna 401
           �    �
           �    +--?? Se autenticado ? Controllers
           �
           +--?? **requireAdmin** (backend/src/middlewares/auth.middleware.ts)
                �  1. Verifica se role === 'admin'
                �  2. Se n�o for admin, retorna 403
                �  3. Se for admin, chama next()
                �
                +--?? Se � admin ? Controllers

?? **CONTROLLERS** - Camada de Controle (recebe requisi��es HTTP)

+--?? **user.controller.ts** (UserController)
�    �  - register(req, res) ? Cria novo usu�rio
�    �  - login(req, res) ? Autentica usu�rio
�    �  - getMe(req, res) ? Retorna dados do usu�rio logado
�    �  - findAll(req, res) ? Lista usu�rios (admin)
�    �  - updateRole(req, res) ? Altera role (admin)
�    �  - delete(req, res) ? Deleta usu�rio (admin)
�    �  +--?? Chama: UserService
�
+--?? **item.controller.ts** (ItemController)
�    �  - findAll(req, res) ? Lista itens com filtros
�    �  - findOne(req, res) ? Busca item por ID
�    �  - create(req, res) ? Cria novo item
�    �  - update(req, res) ? Atualiza item
�    �  - delete(req, res) ? Deleta item
�    �  - findMyItems(req, res) ? Lista itens do usu�rio
�    �  +--?? Chama: ItemService
�
+--?? **proposal.controller.ts** (ProposalController)
�    �  - findSent(req, res) ? Lista propostas enviadas
�    �  - findReceived(req, res) ? Lista propostas recebidas
�    �  - create(req, res) ? Cria proposta
�    �  - respond(req, res) ? Aceita/Recusa proposta
�    �  +--?? Chama: ProposalService, NotificationService
�
+--?? **chat.controller.ts** (ChatController)
�    �  - getConversations(req, res) ? Lista conversas
�    �  - getMessages(req, res) ? Lista mensagens
�    �  - markAsRead(req, res) ? Marca mensagens como lidas
�    �  - getUnreadCount(req, res) ? Conta n�o lidas
�    �  +--?? Chama: ChatService
�
+--?? **notification.controller.ts** (NotificationController)
     �  - findByUser(req, res) ? Lista notifica��es
     �  - markAsRead(req, res) ? Marca como lida
     +--?? Chama: NotificationService

?? **SERVICES** - L�gica de Neg�cio

+--?? **user.service.ts** (UserService)
�    �  **M�todos:**
�    �    - register(nome, email, senha)
�    �        1. Valida dados
�    �        2. Verifica se email j� existe
�    �        3. Hash da senha com bcrypt
�    �        4. Cria usu�rio no banco
�    �        5. Gera token JWT
�    �        6. Retorna { user, token }
�    �
�    �    - login(email, senha)
�    �        1. Busca usu�rio por email
�    �        2. Compara senha com bcrypt
�    �        3. Gera token JWT
�    �        4. Retorna { user, token }
�    �
�    �    - findAll() ? Busca todos usu�rios
�    �    - findById(id) ? Busca usu�rio por ID
�    �    - update(id, data) ? Atualiza usu�rio
�    �    - delete(id) ? Deleta usu�rio
�    �    - updateRole(id, role) ? Altera role
�    �
�    +--?? Acessa: UserRepository (TypeORM)

+--?? **item.service.ts** (ItemService)
�    �  **M�todos:**
�    �    - findAll(filters)
�    �        1. Cria query com TypeORM QueryBuilder
�    �        2. Aplica filtros (categoria, search, status)
�    �        3. Aplica pagina��o
�    �        4. Retorna { data, pagination }
�    �
�    �    - findById(id) ? Busca item + relacionamentos
�    �    - create(userId, data, files)
�    �        1. Processa upload de imagens
�    �        2. Salva URLs das imagens
�    �        3. Cria item no banco
�    �
�    �    - update(id, userId, data) ? Atualiza item
�    �    - delete(id, userId) ? Deleta item
�    �    - findByUser(userId) ? Lista itens do usu�rio
�    �
�    +--?? Acessa: ItemRepository (TypeORM)

+--?? **proposal.service.ts** (ProposalService)
�    �  **M�todos:**
�    �    - create(data)
�    �        1. Valida se itens existem
�    �        2. Valida se usu�rio n�o est� propondo pra si mesmo
�    �        3. Cria proposta no banco
�    �        4. Cria notifica��o para o dono do item
�    �        5. Retorna proposta criada
�    �
�    �    - findSent(userId) ? Lista propostas enviadas
�    �    - findReceived(userId) ? Lista propostas recebidas
�    �
�    �    - respond(id, userId, status)
�    �        1. Busca proposta
�    �        2. Verifica se usu�rio � dono do item
�    �        3. Atualiza status (aceita/recusada)
�    �        4. Cria notifica��o para proponente
�    �        5. Se aceita, marca item como indispon�vel
�    �
�    +--?? Acessa: ProposalRepository, NotificationService

+--?? **chat.service.ts** (ChatService)
�    �  **M�todos:**
�    �    - createMessage(senderId, receiverId, itemId, conteudo)
�    �        1. Cria mensagem no banco
�    �        2. Normaliza retorno (content + conteudo)
�    �        3. Retorna mensagem com relacionamentos
�    �
�    �    - getConversations(userId)
�    �        1. Busca mensagens do usu�rio
�    �        2. Agrupa por conversa (otherUser + item)
�    �        3. Conta n�o lidas por conversa
�    �        4. Retorna lista de conversas
�    �
�    �    - getMessages(userId, otherUserId, itemId)
�    �        1. Busca mensagens entre os dois usu�rios sobre o item
�    �        2. Ordena por data (ASC)
�    �        3. Normaliza retorno
�    �
�    �    - markAsRead(userId, otherUserId, itemId)
�    �        1. Atualiza campo 'lida' para true
�    �        2. WHERE receiverId = userId AND senderId = otherUserId
�    �
�    �    - countUnread(userId) ? Conta mensagens n�o lidas
�    �
�    +--?? Acessa: ChatMessageRepository

+--?? **notification.service.ts** (NotificationService)
     �  **M�todos:**
     �    - create(userId, type, title, message, link, metadata)
     �        1. Cria notifica��o no banco
     �        2. TODO: Enviar via WebSocket quando conectado
     �
     �    - findByUser(userId, limit) ? Lista notifica��es
     �    - markAsRead(id, userId) ? Marca como lida
     �    - markAllAsRead(userId) ? Marca todas como lidas
     �    - getUnreadCount(userId) ? Conta n�o lidas
     �
     �    **M�todos Helper:**
     �    - notifyNewProposal(itemOwnerId, itemTitle, proposerName)
     �    - notifyProposalAccepted(proposerId, itemTitle)
     �    - notifyProposalRejected(proposerId, itemTitle)
     �    - notifyNewMessage(userId, senderName)
     �    - notifyNewRating(userId, raterName, stars)
     �
     +--?? Acessa: NotificationRepository

??? **DATABASE** - TypeORM + SQLite

?? **backend/src/config/database.ts**
 �  - Configura DataSource do TypeORM
 �  - Tipo: SQLite
 �  - Arquivo: database.sqlite
 �  - synchronize: true (cria/atualiza tabelas automaticamente)
 �  - Entidades registradas: [User, Item, Proposal, ChatMessage, Notification, Rating, Report]
 �  - Cria admin padr�o ao iniciar
 �
 +--?? **ENTIDADES** (backend/src/entities/*.ts)
      �
      +--?? **User.ts** - Entidade Usu�rio
      �    �  **Colunas:**
      �    �    - id: number (PK, auto-increment)
      �    �    - nome: string
      �    �    - email: string (unique)
      �    �    - senha: string (hash bcrypt)
      �    �    - role: 'common' | 'verified' | 'admin'
      �    �    - telefone: string (nullable)
      �    �    - cidade: string (nullable)
      �    �    - estado: string (nullable)
      �    �    - latitude: number (nullable)
      �    �    - longitude: number (nullable)
      �    �    - createdAt: Date
      �    �    - updatedAt: Date
      �    �
      �    �  **Relacionamentos:**
      �    �    - items: OneToMany ? Item[]
      �    �    - sentProposals: OneToMany ? Proposal[]
      �    �    - receivedProposals: OneToMany ? Proposal[]
      �    �    - sentMessages: OneToMany ? ChatMessage[]
      �    �    - receivedMessages: OneToMany ? ChatMessage[]
      �    �    - notifications: OneToMany ? Notification[]
      �    �
      �    +--?? M�todo: toJSON() ? Remove senha do retorno
      �
      +--?? **Item.ts** - Entidade Item
      �    �  **Colunas:**
      �    �    - id: number (PK)
      �    �    - titulo: string
      �    �    - descricao: text
      �    �    - categoria: string
      �    �    - imagens: json (array de URLs)
      �    �    - disponivel: boolean (default: true)
      �    �    - latitude: decimal (nullable)
      �    �    - longitude: decimal (nullable)
      �    �    - cidade: string (nullable)
      �    �    - estado: string (nullable)
      �    �    - createdAt: Date
      �    �    - updatedAt: Date
      �    �
      �    �  **Relacionamentos:**
      �    �    - usuario: ManyToOne ? User
      �    �    - proposalsDesejado: OneToMany ? Proposal[]
      �    �    - proposalsOferecido: OneToMany ? Proposal[]
      �    �
      �    +--?? Cascade: onDelete CASCADE
      �
      +--?? **Proposal.ts** - Entidade Proposta
      �    �  **Colunas:**
      �    �    - id: number (PK)
      �    �    - status: 'pendente' | 'aceita' | 'recusada'
      �    �    - mensagem: text (nullable)
      �    �    - createdAt: Date
      �    �    - updatedAt: Date
      �    �
      �    �  **Relacionamentos:**
      �    �    - proponente: ManyToOne ? User (quem fez a proposta)
      �    �    - proprietario: ManyToOne ? User (dono do item desejado)
      �    �    - itemDesejado: ManyToOne ? Item (item que o proponente quer)
      �    �    - itemOferecido: ManyToOne ? Item (item que o proponente oferece)
      �    �
      �    +--?? Cascade: onDelete CASCADE
      �
      +--?? **ChatMessage.ts** - Entidade Mensagem de Chat
      �    �  **Colunas:**
      �    �    - id: number (PK)
      �    �    - conteudo: text (conte�do da mensagem)
      �    �    - lida: boolean (default: false)
      �    �    - createdAt: Date
      �    �    - updatedAt: Date
      �    �
      �    �  **Relacionamentos:**
      �    �    - sender: ManyToOne ? User (remetente)
      �    �    - receiver: ManyToOne ? User (destinat�rio)
      �    �    - item: ManyToOne ? Item (item sobre o qual conversam)
      �    �
      �    +--?? �ndices: (senderId, receiverId, itemId) para performance
      �
      +--?? **Notification.ts** - Entidade Notifica��o
      �    �  **Colunas:**
      �    �    - id: number (PK)
      �    �    - type: enum NotificationType
      �    �        (NEW_PROPOSAL, PROPOSAL_ACCEPTED, PROPOSAL_REJECTED,
      �    �         NEW_MESSAGE, NEW_RATING)
      �    �    - title: string
      �    �    - message: text
      �    �    - link: string (nullable, URL para redirecionar)
      �    �    - metadata: json (nullable, dados extras)
      �    �    - read: boolean (default: false)
      �    �    - createdAt: Date
      �    �
      �    �  **Relacionamentos:**
      �    �    - user: ManyToOne ? User
      �    �
      �    +--?? Cascade: onDelete CASCADE
      �
      +--?? **Rating.ts** - Entidade Avalia��o (futuro)
      �    �  **Colunas:**
      �    �    - id: number (PK)
      �    �    - stars: number (1-5)
      �    �    - comentario: text (nullable)
      �    �    - createdAt: Date
      �    �
      �    �  **Relacionamentos:**
      �    �    - avaliador: ManyToOne ? User
      �    �    - avaliado: ManyToOne ? User
      �    �
      �    +--?? Constraint: unique(avaliador, avaliado) - um n�o pode avaliar o mesmo v�rias vezes
      �
      +--?? **Report.ts** - Entidade Den�ncia (futuro)
           �  **Colunas:**
           �    - id: number (PK)
           �    - tipo: 'user' | 'item' | 'proposal'
           �    - motivo: string
           �    - descricao: text
           �    - status: 'pendente' | 'analisada' | 'resolvida'
           �    - createdAt: Date
           �
           �  **Relacionamentos:**
           �    - denunciante: ManyToOne ? User
           �    - targetId: number (ID do alvo da den�ncia)
           �
           +--?? Cascade: onDelete CASCADE

```

---

## ?? WEBSOCKET (Socket.IO) - Chat em Tempo Real

```
?? **backend/src/websocket/chat.socket.ts** - ChatSocketHandler

?? **INICIALIZA��O**
 �  - Inst�ncia Singleton
 �  - Recebe servidor Socket.IO
 �  - Armazena conex�es ativas: Map<userId, Set<socketId>>
 �  - Configura middleware de autentica��o
 �  - Configura handlers de eventos
 �
 +--?? **MIDDLEWARE DE AUTENTICA��O**
 �    �  1. Extrai token de handshake.auth.token
 �    �  2. Verifica JWT
 �    �  3. Anexa userId ao socket
 �    �  4. Aceita ou rejeita conex�o
 �
 +--?? **EVENT HANDLERS**
      �
      +--?? **'connection'** - Novo cliente conectou
      �    �  1. Registra socket do usu�rio no Map
      �    �  2. Entra na room `user:${userId}`
      �    �  3. Broadcast: 'user:online' para todos
      �    �  4. Log: "Usu�rio X conectado"
      �
      +--?? **'user:request_online_list'** - Cliente pede lista de online
      �    �  1. Busca todos os userId no Map
      �    �  2. Emite 'user:online_list' para o cliente
      �
      +--?? **'message:send'** - Cliente envia mensagem
      �    �  1. Valida dados (receiverId, itemId, content)
      �    �  2. Chama chatService.createMessage()
      �    �  3. Normaliza resposta (content + conteudo)
      �    �  4. Emite 'message:received' para remetente (confirma��o)
      �    �  5. Emite 'message:received' para destinat�rio (room `user:${receiverId}`)
      �    �  6. Atualiza contador: emite 'unread:update' para destinat�rio
      �
      +--?? **'message:read'** - Cliente marcou mensagens como lidas
      �    �  1. Chama chatService.markAsRead()
      �    �  2. Atualiza contador local
      �    �  3. Emite 'unread:update' para o cliente
      �
      +--?? **'user:typing'** - Cliente est� digitando
      �    �  1. Valida dados (receiverId, itemId, isTyping)
      �    �  2. Emite 'user:typing' para destinat�rio
      �    �  3. Se isTyping=true, auto-remove ap�s 3s
      �
      +--?? **'disconnect'** - Cliente desconectou
      �    �  1. Remove socketId do Map
      �    �  2. Se n�o h� mais sockets do usu�rio:
      �    �     - Remove userId do Map
      �    �     - Broadcast: 'user:offline' para todos
      �    �  3. Log: "Usu�rio X desconectado"
      �
      +--?? **M�TODOS P�BLICOS**
           �  - sendNotification(userId, event, data)
           �      ? Emite evento para room `user:${userId}`
           �  - isUserOnline(userId): boolean
           �  - getOnlineUsersCount(): number
           �  - getOnlineUsers(): number[]

?? **FRONTEND (Socket.IO Client)** - stores/chat.ts

?? **setupSocketListeners()** - Configura listeners
 �
 +--?? **'connect'** - Conectado ao servidor
 �    �  1. Log: "WebSocket conectado"
 �    �  2. Emite: 'user:request_online_list'
 �
 +--?? **'disconnect'** - Desconectado
 �    �  1. Log: "WebSocket desconectado"
 �
 +--?? **'user:online_list'** - Recebe lista de online
 �    �  1. Atualiza onlineUsers Set
 �    �  2. Log: "Lista de usu�rios online"
 �
 +--?? **'message:received'** - Nova mensagem recebida
 �    �  1. Normaliza campos (content/conteudo)
 �    �  2. Atualiza conversas (fetchConversations)
 �    �  3. Atualiza notifica��es
 �    �  4. Se conversa est� aberta:
 �    �     - Adiciona � lista de mensagens (evita duplicatas)
 �    �     - Marca como lida automaticamente
 �
 +--?? **'unread:update'** - Contador de n�o lidas atualizado
 �    �  1. Recarrega conversas
 �    �  2. Atualiza badge
 �
 +--?? **'user:online'** - Usu�rio ficou online
 �    �  1. Adiciona ao Set onlineUsers
 �    �  2. Atualiza UI (badge verde)
 �
 +--?? **'user:offline'** - Usu�rio ficou offline
 �    �  1. Remove do Set onlineUsers
 �    �  2. Atualiza UI (badge cinza)
 �
 +--?? **'user:typing'** - Algu�m est� digitando
      �  1. Atualiza Map typingUsers
      �  2. Exibe "Fulano est� digitando..."
      �  3. Auto-remove ap�s 3s

```

---

## ?? FLUXO COMPLETO DE EXEMPLO

### Exemplo 1: **Aceitar Proposta e Abrir Chat**

```
?? USU�RIO (Frontend)
 �
 +- 1. Acessa /propostas-recebidas
 �     +--?? ReceivedProposalsView.vue monta
 �           +--?? proposalStore.fetchReceivedProposals()
 �                 +--?? api.get('/api/proposals/received')
 �                       +--?? [HTTP] GET http://localhost:3000/api/proposals/received
 �                             Header: Authorization: Bearer <token>
 �
 +- 2. Backend recebe requisi��o
 �     +--?? authMiddleware verifica token
 �           +--?? proposalController.findReceived()
 �                 +--?? proposalService.findReceived(userId)
 �                       +--?? ProposalRepository.find({ where: { proprietarioId: userId } })
 �                             +--?? [RESPOSTA] Lista de propostas
 �
 +- 3. Usu�rio clica em "Aceitar Proposta"
 �     +--?? acceptProposal() no componente
 �           +--?? proposalStore.respondToProposal(id, 'aceita')
 �           �     +--?? api.patch(`/api/proposals/${id}/respond`, { status: 'aceita' })
 �           �           +--?? [HTTP] PATCH http://localhost:3000/api/proposals/123/respond
 �           �                 Body: { status: 'aceita' }
 �           �
 �           +--?? Backend: proposalController.respond()
 �           �     +--?? proposalService.respond(id, userId, 'aceita')
 �           �           +--?? Atualiza status no banco
 �           �           +--?? Marca item como indispon�vel
 �           �           +--?? notificationService.notifyProposalAccepted(proponenteId, itemTitle)
 �           �           +--?? [RESPOSTA] { message: 'Proposta aceita' }
 �           �
 �           +--?? Frontend: ap�s sucesso
 �                 +--?? toast.success('Proposta aceita! ??')
 �                 +--?? Fecha modal
 �                 +--?? Recarrega propostas
 �                 +--?? chatStore.openChatWithConversation(otherUserId, itemId)
 �                       +--?? Define isChatOpen = true
 �                       +--?? Define conversationToOpen = { otherUserId, itemId }
 �                       �
 �                       +--?? FloatingChat.vue (watch conversationToOpen)
 �                             +--?? chatStore.fetchConversations()
 �                             �     +--?? [HTTP] GET /api/chat/conversations
 �                             �
 �                             +--?? Encontra conversa na lista
 �                             +--?? chatStore.selectConversation(conversation)
 �                             �     +--?? chatStore.fetchMessages(otherUserId, itemId)
 �                             �           +--?? [HTTP] GET /api/chat/messages/${otherUserId}/${itemId}
 �                             �
 �                             +--?? Renderiza chat aberto com mensagens
 �
 +- 4. Usu�rio digita mensagem e envia
       +--?? chatStore.sendMessage(otherUserId, itemId, 'Oi! Quando podemos trocar?')
             +--?? Adiciona mensagem localmente (atualiza��o otimista)
             +--?? socket.emit('message:send', { receiverId, itemId, content })
                   �
                   +--?? Backend: ChatSocketHandler recebe 'message:send'
                         +--?? chatService.createMessage()
                         �     +--?? Salva no banco (ChatMessageRepository)
                         �
                         +--?? Emite 'message:received' para remetente (confirma��o)
                         +--?? Emite 'message:received' para destinat�rio
                         +--?? Emite 'unread:update' para destinat�rio
                               �
                               +--?? Frontend (destinat�rio):
                                     +--?? Recebe 'message:received'
                                     +--?? Adiciona mensagem � lista
                                     +--?? Atualiza badge de n�o lidas
                                
      �    



