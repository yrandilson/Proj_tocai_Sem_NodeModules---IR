<!-- DOC-META: status=ativo; ultima_revisao=2026-04-10; proxima_revisao=trimestral -->
# ?? DOCUMENTA��O COMPLETA - TrocaAi

## ?? �ndice

1. [Vis�o Geral](#vis�o-geral)
2. [Arquitetura do Sistema](#arquitetura-do-sistema)
3. [Estrutura do Projeto](#estrutura-do-projeto)
4. [Backend - An�lise Detalhada](#backend---an�lise-detalhada)
5. [Frontend - An�lise Detalhada](#frontend---an�lise-detalhada)
6. [Fluxo de Dados e Intera��es](#fluxo-de-dados-e-intera��es)
7. [Banco de Dados](#banco-de-dados)
8. [Autentica��o e Seguran�a](#autentica��o-e-seguran�a)
9. [WebSocket e Chat em Tempo Real](#websocket-e-chat-em-tempo-real)
10. [Funcionalidades Principais](#funcionalidades-principais)

---

## 1. Vis�o Geral

### O que � o TrocaAi?

**TrocaAi** � uma plataforma web fullstack desenvolvida para facilitar **trocas e doa��es de itens** entre usu�rios de forma segura, pr�tica e sustent�vel. A aplica��o promove a **economia circular** e o **consumo consciente**, permitindo que pessoas desapeguem de itens n�o utilizados e encontrem outros itens de interesse.

### Principais Caracter�sticas

- ?? **Sistema completo de autentica��o** (JWT)
- ?? **Chat em tempo real** (WebSocket com Socket.IO)
- ??? **Visualiza��o geogr�fica** de itens no mapa
- ?? **Upload de m�ltiplas imagens** por item
- ? **Sistema de avalia��es** entre usu�rios
- ?? **Sistema de den�ncias** para modera��o
- ?? **Painel administrativo** completo
- ?? **Notifica��es** em tempo real
- ?? **Interface responsiva** e moderna

### Tecnologias Utilizadas

#### Backend
- **Node.js 20** - Runtime JavaScript
- **TypeScript** - Tipagem est�tica
- **Express.js** - Framework web minimalista
- **TypeORM** - ORM (Object-Relational Mapping)
- **SQLite** - Banco de dados (desenvolvimento)
- **Socket.IO** - WebSocket para comunica��o em tempo real
- **JWT (jsonwebtoken)** - Autentica��o baseada em tokens
- **bcryptjs** - Criptografia de senhas
- **Multer** - Upload de arquivos
- **class-validator** - Valida��o de DTOs

#### Frontend
- **Vue 3** - Framework progressivo JavaScript
- **Composition API** - Padr�o moderno do Vue 3
- **TypeScript** - Tipagem est�tica no frontend
- **Vite** - Build tool extremamente r�pida
- **Pinia** - Gerenciamento de estado (substituto do Vuex)
- **Vue Router** - Roteamento SPA
- **Axios** - Cliente HTTP
- **Socket.IO Client** - Cliente WebSocket
- **TailwindCSS** - Framework CSS utilit�rio
- **Lucide Icons** - Biblioteca de �cones

---

## 2. Arquitetura do Sistema

### Padr�o de Arquitetura: MVC + Services

O TrocaAi segue uma arquitetura em camadas baseada no padr�o **MVC (Model-View-Controller)** com uma camada adicional de **Services** para l�gica de neg�cio:

```
+-----------------------------------------------------+
�                    FRONTEND (Vue 3)                  �
�  +----------+  +----------+  +----------+          �
�  �  Views   �  �Components�  �  Stores  �          �
�  � (Pages)  �  �  (UI)    �  � (Pinia)  �          �
�  +----------+  +----------+  +----------+          �
�       �             �              �                 �
�       +----------------------------+                �
�                     �                                �
�              +------?------+                         �
�              �   Services  �                         �
�              �  (API Calls)�                         �
�              +-------------+                         �
+---------------------+--------------------------------+
                      � HTTP/WebSocket
+---------------------?--------------------------------+
�                 BACKEND (Express)                     �
�  +----------+  +----------+  +----------+           �
�  � Routes   �-?�Controllers�-?� Services �           �
�  �(Endpoints)�  �(Handlers)�  �(Business)�           �
�  +----------+  +----------+  +----------+           �
�                                    �                  �
�                             +------?------+          �
�                             �  Entities   �          �
�                             � (TypeORM)   �          �
�                             +-------------+          �
+------------------------------------+------------------+
                                     �
                              +------?------+
                              �   SQLite    �
                              �  Database   �
                              +-------------+
```

### Comunica��o entre Camadas

#### 1. **Frontend ? Backend (REST API)**
```
View/Component ? Store (Pinia) ? API Service (Axios) ? Backend Route ? Controller ? Service ? Entity ? Database
```

#### 2. **Backend ? Frontend (WebSocket)**
```
Event Trigger ? Service ? Socket Handler ? Emit Event ? Frontend Socket Listener ? Store Update ? View Update
```

### Fluxo de Requisi��o T�pico

**Exemplo: Usu�rio cria um novo item**

```
1. Componente NewItemView.vue
   ? (usu�rio preenche formul�rio)
2. itemStore.createItem()
   ? (chama API service)
3. api.ts ? POST /api/items
   ? (requisi��o HTTP)
4. Backend Routes (index.ts)
   ? (roteia para controller)
5. ItemController.create()
   ? (valida e chama service)
6. ItemService.create()
   ? (l�gica de neg�cio)
7. Item Entity (TypeORM)
   ? (salva no banco)
8. SQLite Database
   ? (retorna item criado)
9. Response ? Frontend
   ? (atualiza store)
10. View atualizada automaticamente
```

---

## 3. Estrutura do Projeto

### Vis�o Geral dos Diret�rios

```
trocaai/
�
+-- backend/                    # Servidor Node.js/Express
�   +-- src/
�   �   +-- config/            # Configura��es (DB, JWT, Upload)
�   �   +-- controllers/       # Controladores de rotas (HTTP handlers)
�   �   +-- dtos/              # Data Transfer Objects (valida��o)
�   �   +-- entities/          # Modelos do banco (TypeORM)
�   �   +-- middlewares/       # Middlewares (auth, validation)
�   �   +-- routes/            # Defini��o de rotas da API
�   �   +-- services/          # L�gica de neg�cio
�   �   +-- websocket/         # Handlers WebSocket (chat)
�   �   +-- __tests__/         # Testes automatizados (Jest)
�   �   +-- server.ts          # Ponto de entrada do servidor
�   �
�   +-- uploads/               # Arquivos enviados pelos usu�rios
�   +-- database.sqlite        # Banco de dados SQLite
�   +-- package.json           # Depend�ncias do backend
�   +-- tsconfig.json          # Configura��o TypeScript
�
+-- frontend/                  # Aplica��o Vue.js
�   +-- src/
�   �   +-- assets/           # Recursos est�ticos (CSS global)
�   �   +-- components/       # Componentes reutiliz�veis
�   �   +-- composables/      # Composables (l�gica reutiliz�vel)
�   �   +-- layouts/          # Layouts (ex: AdminLayout)
�   �   +-- router/           # Configura��o do Vue Router
�   �   +-- services/         # Servi�os (chamadas API)
�   �   +-- stores/           # Stores Pinia (gerenciamento estado)
�   �   +-- types/            # Tipos TypeScript
�   �   +-- views/            # P�ginas/Views da aplica��o
�   �   +-- App.vue           # Componente raiz
�   �   +-- main.ts           # Ponto de entrada do app
�   �
�   +-- index.html            # HTML base
�   +-- package.json          # Depend�ncias do frontend
�   +-- vite.config.ts        # Configura��o do Vite
�   +-- tailwind.config.js    # Configura��o do TailwindCSS
�   +-- tsconfig.json         # Configura��o TypeScript
�
+-- .gitignore                # Arquivos ignorados pelo Git
+-- package.json              # Scripts raiz (concurrently)
+-- replit.md                 # Documenta��o do projeto
+-- DOCUMENTACAO_COMPLETA.md  # Este arquivo
```

---

## 4. Backend - An�lise Detalhada

### 4.1 Camada de Configura��o (`config/`)

#### `database.ts` - Configura��o do Banco de Dados

```typescript
// Responsabilidade: Inicializar conex�o TypeORM com SQLite
// Fun��es principais:
// - AppDataSource: Define configura��o do TypeORM
// - initializeDatabase(): Conecta ao banco e habilita foreign keys
```

**O que faz:**
- Define entidades do TypeORM
- Configura SQLite como banco de dados
- Habilita foreign keys (essencial para integridade referencial)
- Sincroniza schema automaticamente em desenvolvimento

#### `jwt.ts` - Configura��o JWT

```typescript
// Responsabilidade: Centralizar configura��o JWT
// Fun��es principais:
// - getJwtSecret(): Retorna JWT_SECRET do .env (obrigat�rio)
// - getJwtExpiresIn(): Retorna tempo de expira��o do token
```

**Seguran�a Cr�tica:**
- ? N�o permite fallback para 'default_secret'
- ? Lan�a erro se JWT_SECRET n�o estiver definido
- ? Centraliza configura��o para evitar inconsist�ncias

#### `upload.ts` - Configura��o de Upload

```typescript
// Responsabilidade: Configurar Multer para upload de imagens
// Fun��es principais:
// - storage: Define onde e como salvar arquivos
// - fileFilter: Valida tipos de arquivo permitidos
// - upload: Middleware configurado
```

**Caracter�sticas:**
- Salva imagens em `backend/uploads/`
- Renomeia arquivos com timestamp + random number
- Aceita apenas imagens (jpeg, jpg, png, gif, webp)
- Limite de 5MB por arquivo

### 4.2 Camada de Entidades (`entities/`)

#### **User.ts** - Entidade de Usu�rio

```typescript
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  nome: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  senha: string; // Hash bcrypt

  @Column({ type: 'varchar', length: 20, default: UserRole.COMMON })
  role: UserRole; // 'admin' | 'verified' | 'common'

  // Relacionamentos
  @OneToMany(() => Item, (item) => item.owner)
  items: Item[];

  @OneToMany(() => Proposal, (proposal) => proposal.proposer)
  proposals: Proposal[];

  // ... outros relacionamentos
}
```

**Relacionamentos:**
- **1:N com Items** - Um usu�rio pode ter v�rios itens
- **1:N com Proposals** - Um usu�rio pode fazer v�rias propostas
- **1:N com Notifications** - Um usu�rio recebe v�rias notifica��es
- **1:N com Ratings** - Um usu�rio pode dar e receber avalia��es
- **1:N com ChatMessages** - Um usu�rio pode enviar/receber mensagens
- **1:N com Reports** - Um usu�rio pode fazer/receber den�ncias

#### **Item.ts** - Entidade de Item

```typescript
@Entity('items')
export class Item {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  ownerId: number;

  @ManyToOne(() => User, (user) => user.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @Column()
  titulo: string;

  @Column('text')
  descricao: string;

  @Column({ nullable: true })
  categoria?: string;

  @Column({ type: 'varchar', enum: ItemStatus, default: ItemStatus.DISPONIVEL })
  status: ItemStatus; // 'disponivel' | 'em_negociacao' | 'trocado'

  @Column({ type: 'simple-json', nullable: true })
  imagens?: string[]; // Array de nomes de arquivo

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude?: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude?: number;

  // Soft delete
  @DeleteDateColumn()
  deletedAt?: Date | null;
}
```

**Caracter�sticas Especiais:**
- **Soft Delete**: Items n�o s�o realmente deletados, apenas marcados
- **Geolocaliza��o**: Armazena latitude/longitude para exibir no mapa
- **Imagens**: Array JSON de nomes de arquivo
- **Status**: Controla o ciclo de vida do item

#### **Proposal.ts** - Entidade de Proposta

```typescript
@Entity('proposals')
export class Proposal {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  itemId: number; // Item que o usu�rio quer

  @ManyToOne(() => Item, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'itemId' })
  item: Item;

  @Column()
  proposerId: number; // Quem est� propondo

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'proposerId' })
  proposer: User;

  @Column('text')
  mensagem: string; // Mensagem da proposta

  @Column({ type: 'varchar', enum: ProposalStatus, default: ProposalStatus.PENDENTE })
  status: ProposalStatus; // 'pendente' | 'aceita' | 'recusada'
}
```

**Fluxo de Proposta:**
1. Usu�rio v� item de outro usu�rio
2. Cria proposta com mensagem
3. Dono do item recebe notifica��o
4. Dono aceita/recusa proposta
5. Se aceita, ambos recebem notifica��o para negociar via chat

#### **ChatMessage.ts** - Entidade de Mensagem

```typescript
@Entity('chat_messages')
export class ChatMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  conteudo: string;

  @Column()
  senderId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'senderId' })
  sender: User;

  @Column()
  receiverId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'receiverId' })
  receiver: User;

  @Column()
  itemId: number; // Contexto da conversa

  @ManyToOne(() => Item)
  @JoinColumn({ name: 'itemId' })
  item: Item;

  @Column({ type: 'boolean', default: false })
  lida: boolean; // Status de leitura
}
```

**Caracter�sticas:**
- **Contexto por Item**: Cada conversa � vinculada a um item espec�fico
- **Status de Leitura**: Controla se mensagem foi lida
- **Sender/Receiver**: Identifica origem e destino

### 4.3 Camada de Services (`services/`)

#### **user.service.ts** - L�gica de Usu�rios

**Principais M�todos:**

```typescript
class UserService {
  // Registra novo usu�rio
  async register(nome: string, email: string, senha: string) {
    // 1. Valida se email j� existe
    // 2. Criptografa senha com bcrypt (10 rounds)
    // 3. Cria usu�rio no banco
    // 4. Gera token JWT
    // 5. Retorna { user, token }
  }

  // Autentica usu�rio
  async login(email: string, senha: string) {
    // 1. Busca usu�rio por email
    // 2. Compara senha com bcrypt.compare()
    // 3. Gera token JWT
    // 4. Retorna { user, token }
  }

  // Atualiza dados do usu�rio
  async update(id: number, data: UpdateUserDTO) {
    // 1. Busca usu�rio
    // 2. Se mudou senha, criptografa novamente
    // 3. Atualiza dados
    // 4. Salva no banco
  }
}
```

#### **item.service.ts** - L�gica de Itens

**Principais M�todos:**

```typescript
class ItemService {
  // Cria novo item
  async create(titulo, descricao, categoria, ownerId, imagens, location) {
    // 1. Cria entidade Item
    // 2. Associa ao dono (ownerId)
    // 3. Adiciona imagens e localiza��o
    // 4. Salva no banco
    // 5. Retorna item com relacionamentos
  }

  // Lista itens com filtros e pagina��o
  async findAll(filters: ItemFilters) {
    // 1. Cria query builder TypeORM
    // 2. Aplica filtros (categoria, busca, status)
    // 3. Adiciona pagina��o (limit, offset)
    // 4. Carrega relacionamentos (owner)
    // 5. Retorna { items, total, page, totalPages }
  }

  // Atualiza status do item
  async updateStatus(id: number, status: ItemStatus, userId: number) {
    // 1. Busca item
    // 2. Verifica se usu�rio � dono ou admin
    // 3. Atualiza status
    // 4. Salva
  }
}
```

#### **proposal.service.ts** - L�gica de Propostas

**Principais M�todos:**

```typescript
class ProposalService {
  // Cria nova proposta
  async create(itemId: number, proposerId: number, mensagem: string) {
    // 1. Busca item
    // 2. Verifica se item est� dispon�vel
    // 3. Verifica se proposer n�o � dono do item
    // 4. Cria proposta
    // 5. Cria notifica��o para dono do item
    // 6. Retorna proposta
  }

  // Atualiza status da proposta (aceitar/recusar)
  async updateStatus(id: number, status: ProposalStatus, userId: number) {
    // 1. Busca proposta com item e proposer
    // 2. Verifica se userId � dono do item
    // 3. Atualiza status
    // 4. Se aceita, atualiza item para "em_negociacao"
    // 5. Cria notifica��o para proposer
    // 6. Retorna proposta atualizada
  }
}
```

#### **chat.service.ts** - L�gica de Chat

**Principais M�todos:**

```typescript
class ChatService {
  // Cria nova mensagem
  async createMessage(senderId, receiverId, itemId, conteudo) {
    // 1. Cria mensagem no banco
    // 2. Cria notifica��o para receiver
    // 3. Retorna mensagem com relacionamentos
  }

  // Busca conversas do usu�rio
  async getConversations(userId: number) {
    // 1. Busca todas mensagens onde userId � sender OU receiver
    // 2. Agrupa por (otherUserId, itemId)
    // 3. Para cada conversa, pega �ltima mensagem e contador de n�o lidas
    // 4. Retorna array de conversas ordenadas por data
  }

  // Marca mensagens como lidas
  async markAsRead(userId, otherUserId, itemId) {
    // 1. Busca mensagens n�o lidas
    // 2. Onde receiverId = userId
    // 3. E senderId = otherUserId
    // 4. E itemId = itemId
    // 5. Atualiza lida = true
  }
}
```

### 4.4 Camada de Controllers (`controllers/`)

**Responsabilidade**: Lidar com requisi��es HTTP, validar entrada, chamar services, retornar respostas.

**Padr�o Comum:**

```typescript
class ItemController {
  private itemService = new ItemService();

  // Handler de rota
  create = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      // 1. Extrai dados da requisi��o
      const { userId } = req; // Adicionado pelo authMiddleware
      const { titulo, descricao } = req.body;
      
      // 2. Valida autentica��o
      if (!userId) {
        res.status(401).json({ error: 'N�o autenticado' });
        return;
      }

      // 3. Chama service com l�gica de neg�cio
      const item = await this.itemService.create(titulo, descricao, userId);

      // 4. Retorna resposta de sucesso
      res.status(201).json(item);
    } catch (error) {
      // 5. Trata erros
      res.status(400).json({ 
        error: error instanceof Error ? error.message : 'Erro ao criar item' 
      });
    }
  };
}
```

### 4.5 Middlewares (`middlewares/`)

#### **auth.middleware.ts** - Autentica��o JWT

```typescript
// Valida token JWT em rotas protegidas
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Extrai token do header Authorization
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Token n�o fornecido' });
    }

    // 2. Verifica e decodifica token
    const decoded = jwt.verify(token, getJwtSecret()) as JwtPayload;

    // 3. Adiciona userId ao request para pr�ximos handlers
    (req as AuthRequest).userId = decoded.userId;

    // 4. Continua para pr�ximo middleware/handler
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inv�lido' });
  }
};
```

#### **validation.middleware.ts** - Valida��o de DTOs

```typescript
// Valida dados de entrada usando class-validator
export const validateDTO = (dtoClass: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // 1. Transforma body em inst�ncia do DTO
    const dto = plainToInstance(dtoClass, req.body);

    // 2. Valida usando decoradores do class-validator
    const errors = await validate(dto);

    // 3. Se houver erros, retorna 400
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    // 4. Continua se v�lido
    next();
  };
};
```

### 4.6 WebSocket (`websocket/chat.socket.ts`)

```typescript
export class ChatSocketHandler {
  // Inicializa Socket.IO com autentica��o JWT
  initialize(io: Server) {
    // Middleware de autentica��o WebSocket
    io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      
      try {
        const decoded = jwt.verify(token, getJwtSecret());
        socket.data.userId = decoded.userId;
        next();
      } catch {
        next(new Error('Autentica��o falhou'));
      }
    });

    // Handler de conex�o
    io.on('connection', (socket) => {
      const userId = socket.data.userId;

      // Usu�rio entra na sua "sala" pessoal
      socket.join(`user:${userId}`);

      // Escuta evento de envio de mensagem
      socket.on('message:send', async (data) => {
        // 1. Salva mensagem no banco via ChatService
        const message = await chatService.createMessage(...);

        // 2. Emite mensagem para o destinat�rio
        io.to(`user:${data.receiverId}`).emit('message:received', message);

        // 3. Emite confirma��o para remetente
        socket.emit('message:sent', message);

        // 4. Atualiza contador de mensagens n�o lidas
        io.to(`user:${data.receiverId}`).emit('unread:update', count);
      });

      // Outros eventos: typing, read, etc.
    });
  }
}
```

**Eventos WebSocket:**
- `message:send` - Cliente envia mensagem
- `message:received` - Servidor notifica destinat�rio
- `message:sent` - Servidor confirma envio ao remetente
- `user:typing` - Notifica que usu�rio est� digitando
- `unread:update` - Atualiza contador de n�o lidas

---

## 5. Frontend - An�lise Detalhada

### 5.1 Gerenciamento de Estado (`stores/`)

#### **auth.ts** - Store de Autentica��o

```typescript
import { defineStore } from 'pinia';
import api from '@/services/api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: false
  }),

  getters: {
    // Verifica se usu�rio � admin
    isAdmin: (state) => state.user?.role === 'admin',
    
    // Verifica se usu�rio � verificado
    isVerified: (state) => state.user?.role === 'verified'
  },

  actions: {
    // Login
    async login(email: string, senha: string) {
      const response = await api.post('/auth/login', { email, senha });
      
      this.token = response.data.token;
      this.user = response.data.user;
      this.isAuthenticated = true;
      
      // Salva token no localStorage
      localStorage.setItem('token', this.token);
      
      // Configura header Authorization para futuras requisi��es
      api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
    },

    // Logout
    logout() {
      this.user = null;
      this.token = null;
      this.isAuthenticated = false;
      
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
    },

    // Busca dados do usu�rio logado
    async fetchMe() {
      if (this.token) {
        const response = await api.get('/auth/me');
        this.user = response.data;
        this.isAuthenticated = true;
      }
    }
  }
});
```

#### **item.ts** - Store de Itens

```typescript
export const useItemStore = defineStore('item', {
  state: () => ({
    items: [] as Item[],
    loading: false,
    currentItem: null as Item | null,
    total: 0,
    page: 1,
    totalPages: 1
  }),

  actions: {
    // Lista itens com filtros
    async fetchItems(filters?: ItemFilters) {
      this.loading = true;
      try {
        const response = await api.get('/items', { params: filters });
        
        this.items = response.data.items;
        this.total = response.data.total;
        this.page = response.data.page;
        this.totalPages = response.data.totalPages;
      } finally {
        this.loading = false;
      }
    },

    // Cria novo item
    async createItem(formData: FormData) {
      const response = await api.post('/items', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Adiciona item criado � lista local
      this.items.unshift(response.data);
      
      return response.data;
    },

    // Deleta item
    async deleteItem(id: number) {
      await api.delete(`/items/${id}`);
      
      // Remove item da lista local
      this.items = this.items.filter(item => item.id !== id);
    }
  }
});
```

#### **chat.ts** - Store de Chat

```typescript
import { io, Socket } from 'socket.io-client';

export const useChatStore = defineStore('chat', {
  state: () => ({
    conversations: [] as Conversation[],
    messages: [] as ChatMessage[],
    unreadCount: 0,
    socket: null as Socket | null,
    isConnected: false
  }),

  actions: {
    // Conecta ao WebSocket
    connectSocket(token: string) {
      this.socket = io('http://localhost:3000', {
        auth: { token }
      });

      // Escuta eventos do servidor
      this.socket.on('connect', () => {
        this.isConnected = true;
      });

      this.socket.on('message:received', (message) => {
        // Adiciona mensagem recebida
        this.messages.push(message);
        
        // Atualiza conversa
        this.updateConversation(message);
        
        // Incrementa contador de n�o lidas
        this.unreadCount++;
      });

      this.socket.on('unread:update', (count) => {
        this.unreadCount = count;
      });
    },

    // Envia mensagem
    sendMessage(receiverId: number, itemId: number, conteudo: string) {
      if (!this.socket) return;

      this.socket.emit('message:send', {
        receiverId,
        itemId,
        conteudo
      });
    },

    // Busca conversas do usu�rio
    async fetchConversations() {
      const response = await api.get('/chat/conversations');
      this.conversations = response.data;
    },

    // Busca mensagens de uma conversa
    async fetchMessages(otherUserId: number, itemId: number) {
      const response = await api.get(`/chat/messages/${otherUserId}/${itemId}`);
      this.messages = response.data;
      
      // Marca como lidas
      await api.post('/chat/read', { otherUserId, itemId });
    }
  }
});
```

### 5.2 Componentes Principais

#### **ItemCard.vue** - Card de Item

```vue
<script setup lang="ts">
import { computed } from 'vue';
import type { Item } from '@/types';

const props = defineProps<{ item: Item }>();

// Computed: traduz status para portugu�s
const statusLabel = computed(() => {
  const labels = {
    disponivel: 'Dispon�vel',
    em_negociacao: 'Em Negocia��o',
    trocado: 'Trocado'
  };
  return labels[props.item.status];
});

// Computed: classe CSS baseada no status
const statusClass = computed(() => {
  return `badge badge-${props.item.status}`;
});
</script>

<template>
  <!-- RouterLink torna o card clic�vel -->
  <RouterLink :to="`/items/${item.id}`" class="card hover:shadow-lg transition-all">
    
    <!-- Badge de status -->
    <span :class="statusClass">{{ statusLabel }}</span>

    <!-- T�tulo -->
    <h3 class="font-bold text-lg">{{ item.titulo }}</h3>

    <!-- Descri��o (truncada em 2 linhas) -->
    <p class="text-gray-600 line-clamp-2">{{ item.descricao }}</p>

    <!-- Footer com dono e categoria -->
    <div class="flex justify-between items-center">
      <div class="flex items-center">
        <!-- Avatar com inicial do nome -->
        <div class="avatar">
          {{ item.owner.nome.charAt(0).toUpperCase() }}
        </div>
        <span>{{ item.owner.nome }}</span>
      </div>
      
      <!-- Badge de categoria -->
      <span class="badge">{{ item.categoria }}</span>
    </div>
  </RouterLink>
</template>
```

#### **FloatingChat.vue** - Chat Flutuante

```vue
<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useChatStore } from '@/stores/chat';
import { useAuthStore } from '@/stores/auth';

const chatStore = useChatStore();
const authStore = useAuthStore();

const isOpen = ref(false);
const selectedConversation = ref<Conversation | null>(null);
const messageInput = ref('');

// Computed: conversas com indicador de n�o lidas
const conversations = computed(() => {
  return chatStore.conversations.map(conv => ({
    ...conv,
    hasUnread: conv.unreadCount > 0
  }));
});

// Ao montar, conecta socket e busca conversas
onMounted(() => {
  if (authStore.token) {
    chatStore.connectSocket(authStore.token);
    chatStore.fetchConversations();
  }
});

// Watch: quando seleciona conversa, busca mensagens
watch(selectedConversation, async (newConv) => {
  if (newConv) {
    await chatStore.fetchMessages(newConv.otherUserId, newConv.itemId);
  }
});

// Envia mensagem
const sendMessage = () => {
  if (!messageInput.value.trim() || !selectedConversation.value) return;

  chatStore.sendMessage(
    selectedConversation.value.otherUserId,
    selectedConversation.value.itemId,
    messageInput.value
  );

  messageInput.value = '';
};
</script>

<template>
  <!-- Bot�o flutuante -->
  <div class="fixed bottom-4 right-4 z-50">
    <button @click="isOpen = !isOpen" class="btn-float">
      ??
      <!-- Badge de n�o lidas -->
      <span v-if="chatStore.unreadCount > 0" class="badge-notification">
        {{ chatStore.unreadCount }}
      </span>
    </button>

    <!-- Janela de chat -->
    <div v-if="isOpen" class="chat-window">
      
      <!-- Sem conversa selecionada: lista de conversas -->
      <div v-if="!selectedConversation" class="conversations-list">
        <h3>Mensagens</h3>
        
        <div
          v-for="conv in conversations"
          :key="`${conv.otherUserId}-${conv.itemId}`"
          @click="selectedConversation = conv"
          class="conversation-item"
        >
          <div class="flex justify-between">
            <strong>{{ conv.otherUserName }}</strong>
            <span v-if="conv.hasUnread" class="dot-unread"></span>
          </div>
          <p class="text-sm text-gray-600">{{ conv.itemTitle }}</p>
          <p class="text-xs text-gray-400">{{ conv.lastMessage }}</p>
        </div>
      </div>

      <!-- Conversa selecionada: mensagens -->
      <div v-else class="messages-view">
        
        <!-- Header com voltar -->
        <div class="header">
          <button @click="selectedConversation = null">? Voltar</button>
          <strong>{{ selectedConversation.otherUserName }}</strong>
        </div>

        <!-- Lista de mensagens -->
        <div class="messages-container">
          <div
            v-for="msg in chatStore.messages"
            :key="msg.id"
            :class="['message', msg.senderId === authStore.user?.id ? 'sent' : 'received']"
          >
            {{ msg.conteudo }}
          </div>
        </div>

        <!-- Input de envio -->
        <div class="input-container">
          <input
            v-model="messageInput"
            @keyup.enter="sendMessage"
            placeholder="Digite sua mensagem..."
          />
          <button @click="sendMessage">Enviar</button>
        </div>
      </div>
    </div>
  </div>
</template>
```

### 5.3 Roteamento (`router/index.ts`)

```typescript
import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const routes = [
  {
    path: '/',
    name: 'landing',
    component: () => import('@/views/LandingHome.vue')
  },
  {
    path: '/home',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
    meta: { requiresAuth: true } // Rota protegida
  },
  {
    path: '/items/:id',
    name: 'item-details',
    component: () => import('@/views/ItemDetailsView.vue')
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('@/views/AdminView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true } // Apenas admin
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Guard de navega��o global
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  // Se rota requer autentica��o
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login'); // Redireciona para login
    return;
  }

  // Se rota requer admin
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next('/'); // Redireciona para home
    return;
  }

  next(); // Permite navega��o
});

export default router;
```

---

## 6. Fluxo de Dados e Intera��es

### Cen�rio 1: Usu�rio Faz Login

```
1. Usu�rio acessa /login
   ?
2. Preenche formul�rio (email, senha)
   ?
3. Clica em "Entrar"
   ?
4. LoginView.vue chama authStore.login(email, senha)
   ?
5. authStore faz POST /auth/login
   ?
6. Backend: authRoutes ? UserController.login()
   ?
7. UserService.login()
   - Busca usu�rio por email
   - Compara senha com bcrypt
   - Gera token JWT
   ?
8. Retorna { user, token }
   ?
9. authStore salva token no localStorage
   ?
10. Configura header Authorization
   ?
11. Redireciona para /home
   ?
12. HomeView.vue carrega itens dispon�veis
```

### Cen�rio 2: Usu�rio Cria Item

```
1. Usu�rio acessa /items/new
   ?
2. Preenche formul�rio (t�tulo, descri��o, categoria)
   ?
3. Seleciona imagens (at� 5)
   ?
4. Marca localiza��o no mapa (latitude, longitude)
   ?
5. Clica em "Publicar Item"
   ?
6. NewItemView.vue cria FormData
   - Adiciona campos de texto
   - Adiciona arquivos de imagem
   - Adiciona coordenadas
   ?
7. Chama itemStore.createItem(formData)
   ?
8. itemStore faz POST /items (multipart/form-data)
   ?
9. Backend: Middlewares processam
   - authMiddleware: valida token JWT
   - upload.array('imagens', 5): processa imagens com Multer
   - validateDTO: valida CreateItemDTO
   ?
10. ItemController.create()
    - Extrai dados do req.body
    - Extrai nomes de arquivos salvos por Multer
    ?
11. ItemService.create()
    - Cria entidade Item
    - Associa ao usu�rio (ownerId)
    - Salva imagens, localiza��o
    - Salva no banco
    ?
12. Retorna item criado
    ?
13. itemStore adiciona item � lista local
    ?
14. Redireciona para /items/{id}
    ?
15. ItemDetailsView.vue exibe item rec�m-criado
```

### Cen�rio 3: Usu�rio Faz Proposta

```
1. Usu�rio v� item de interesse
   ?
2. Clica em "Fazer Proposta"
   ?
3. Preenche mensagem da proposta
   ?
4. Clica em "Enviar Proposta"
   ?
5. ItemDetailsView.vue chama proposalStore.createProposal()
   ?
6. proposalStore faz POST /proposals
   - itemId: ID do item desejado
   - mensagem: texto da proposta
   ?
7. Backend: ProposalController.create()
   ?
8. ProposalService.create()
   - Busca item
   - Verifica se dispon�vel
   - Verifica se proposer n�o � dono
   - Cria proposta no banco
   - Cria notifica��o para dono do item
   ?
9. Retorna proposta criada
   ?
10. Frontend: exibe mensagem de sucesso
    ?
11. Dono do item recebe notifica��o
    - Aparece badge no �cone de notifica��es
    - (Opcional) Push notification
    ?
12. Dono acessa /proposals/received
    ?
13. V� lista de propostas recebidas
    ?
14. Clica em "Aceitar" ou "Recusar"
    ?
15. proposalStore.updateProposalStatus(id, 'aceita')
    ?
16. Backend: PATCH /proposals/{id}/status
    ?
17. ProposalService.updateStatus()
    - Atualiza status da proposta
    - Se aceita: atualiza item para "em_negociacao"
    - Cria notifica��o para proposer
    ?
18. Ambos usu�rios recebem notifica��o
    ?
19. Chat � aberto automaticamente para negocia��o
```

### Cen�rio 4: Chat em Tempo Real

```
1. Usu�rio acessa FloatingChat.vue
   ?
2. onMounted: chatStore.connectSocket(token)
   ?
3. Frontend: cria conex�o WebSocket
   - new io('http://localhost:3000', { auth: { token } })
   ?
4. Backend: Socket.IO recebe conex�o
   - Middleware de autentica��o valida token
   - Extrai userId do token
   - Armazena em socket.data.userId
   ?
5. Evento 'connection' disparado
   - socket.join(`user:${userId}`) - usu�rio entra na sua sala
   ?
6. Frontend: isConnected = true
   ?
7. Usu�rio seleciona conversa
   - chatStore.fetchMessages(otherUserId, itemId)
   - GET /chat/messages/{otherUserId}/{itemId}
   ?
8. Backend retorna mensagens
   - Marca mensagens como lidas automaticamente
   ?
9. Frontend exibe mensagens
   ?
10. Usu�rio digita mensagem e pressiona Enter
    ?
11. chatStore.sendMessage(receiverId, itemId, conteudo)
    ?
12. Frontend emite evento WebSocket
    - socket.emit('message:send', { receiverId, itemId, conteudo })
    ?
13. Backend recebe evento 'message:send'
    ?
14. ChatService.createMessage()
    - Salva mensagem no banco
    - Cria notifica��o para receiver
    ?
15. Backend emite eventos:
    - Para receiver: io.to(`user:${receiverId}`).emit('message:received', message)
    - Para sender: socket.emit('message:sent', message)
    - Para receiver: io.to(`user:${receiverId}`).emit('unread:update', count)
    ?
16. Frontend do receiver (se conectado):
    - Escuta 'message:received'
    - Adiciona mensagem � lista
    - Atualiza conversa
    - Incrementa unreadCount
    - (Opcional) Toca som de notifica��o
    ?
17. Frontend do sender:
    - Escuta 'message:sent'
    - Adiciona mensagem � lista (confirma��o)
```

---

## 7. Banco de Dados

### Diagrama de Relacionamentos (ERD)

```
+-------------+
�    User     �
+-------------�
� id          �--+
� nome        �  �
� email       �  �
� senha       �  �
� role        �  �
� telefone    �  �
� cidade      �  �
� estado      �  �
� latitude    �  �
� longitude   �  �
+-------------+  �
                 � 1:N
                 �
    +-------------------------+
    �                         �
    ?                         ?
+-------------+         +-------------+
�    Item     �         �  Proposal   �
+-------------�         +-------------�
� id          �?------+ � id          �
� ownerId     �       � � itemId      �
� titulo      �       � � proposerId  �
� descricao   �       � � mensagem    �
� categoria   �       � � status      �
� status      �       � +-------------+
� imagens[]   �       �
� latitude    �       � 1:N
� longitude   �       �
+-------------+       �
        �             �
        � 1:N         �
        �             �
        ?             �
+-------------+       �
�ChatMessage  �       �
+-------------�       �
� id          �       �
� senderId    �       �
� receiverId  �       �
� itemId      �-------+
� conteudo    �
� lida        �
+-------------+

+-------------+         +-------------+
�Notification �         �   Rating    �
+-------------�         +-------------�
� id          �         � id          �
� userId      �         � fromUserId  �
� type        �         � toUserId    �
� title       �         � itemId      �
� message     �         � stars       �
� read        �         � comment     �
+-------------+         +-------------+

+-------------+
�   Report    �
+-------------�
� id          �
� reporterId  �
� type        �
� reportedId  �
� reason      �
� description �
� status      �
+-------------+
```

### Esquema Detalhado

#### Tabela: `users`

| Coluna     | Tipo        | Constraints        | Descri��o                    |
|------------|-------------|--------------------|------------------------------|
| id         | INTEGER     | PRIMARY KEY        | ID �nico do usu�rio          |
| nome       | VARCHAR(100)| NOT NULL           | Nome completo                |
| email      | VARCHAR(100)| UNIQUE, NOT NULL   | Email (login)                |
| senha      | VARCHAR(255)| NOT NULL           | Hash bcrypt da senha         |
| role       | VARCHAR(20) | DEFAULT 'common'   | Papel (admin/verified/common)|
| telefone   | VARCHAR(20) | NULL               | Telefone de contato          |
| cidade     | VARCHAR(100)| NULL               | Cidade do usu�rio            |
| estado     | VARCHAR(2)  | NULL               | UF do usu�rio                |
| latitude   | DECIMAL(10,7)| NULL              | Latitude do usu�rio          |
| longitude  | DECIMAL(10,7)| NULL              | Longitude do usu�rio         |
| createdAt  | DATETIME    | DEFAULT NOW()      | Data de cria��o              |
| updatedAt  | DATETIME    | DEFAULT NOW()      | Data de atualiza��o          |

**�ndices:**
- `email` (UNIQUE)

#### Tabela: `items`

| Coluna     | Tipo        | Constraints        | Descri��o                    |
|------------|-------------|--------------------|------------------------------|
| id         | INTEGER     | PRIMARY KEY        | ID �nico do item             |
| ownerId    | INTEGER     | FK ? users.id      | Dono do item                 |
| titulo     | VARCHAR(200)| NOT NULL           | T�tulo do item               |
| descricao  | TEXT        | NOT NULL           | Descri��o detalhada          |
| categoria  | VARCHAR(50) | NULL               | Categoria do item            |
| status     | VARCHAR(20) | DEFAULT 'disponivel'| Status (disponivel/em_negociacao/trocado) |
| imagens    | JSON        | NULL               | Array de nomes de arquivo    |
| latitude   | DECIMAL(10,7)| NULL              | Latitude do item             |
| longitude  | DECIMAL(10,7)| NULL              | Longitude do item            |
| createdAt  | DATETIME    | DEFAULT NOW()      | Data de cria��o              |
| updatedAt  | DATETIME    | DEFAULT NOW()      | Data de atualiza��o          |
| deletedAt  | DATETIME    | NULL               | Data de exclus�o (soft delete)|

**�ndices:**
- `ownerId` (FK)
- `status`
- `categoria`

**Relacionamentos:**
- `ownerId` ? `users.id` ON DELETE CASCADE

#### Tabela: `proposals`

| Coluna     | Tipo        | Constraints        | Descri��o                    |
|------------|-------------|--------------------|------------------------------|
| id         | INTEGER     | PRIMARY KEY        | ID �nico da proposta         |
| itemId     | INTEGER     | FK ? items.id      | Item desejado                |
| proposerId | INTEGER     | FK ? users.id      | Quem est� propondo           |
| mensagem   | TEXT        | NOT NULL           | Mensagem da proposta         |
| status     | VARCHAR(20) | DEFAULT 'pendente' | Status (pendente/aceita/recusada) |
| createdAt  | DATETIME    | DEFAULT NOW()      | Data de cria��o              |
| updatedAt  | DATETIME    | DEFAULT NOW()      | Data de atualiza��o          |

**Relacionamentos:**
- `itemId` ? `items.id` ON DELETE CASCADE
- `proposerId` ? `users.id` ON DELETE CASCADE

#### Tabela: `chat_messages`

| Coluna     | Tipo        | Constraints        | Descri��o                    |
|------------|-------------|--------------------|------------------------------|
| id         | INTEGER     | PRIMARY KEY        | ID �nico da mensagem         |
| senderId   | INTEGER     | FK ? users.id      | Quem enviou                  |
| receiverId | INTEGER     | FK ? users.id      | Quem recebeu                 |
| itemId     | INTEGER     | FK ? items.id      | Contexto (item da conversa)  |
| conteudo   | TEXT        | NOT NULL           | Texto da mensagem            |
| lida       | BOOLEAN     | DEFAULT FALSE      | Se foi lida                  |
| createdAt  | DATETIME    | DEFAULT NOW()      | Data de envio                |
| updatedAt  | DATETIME    | DEFAULT NOW()      | Data de atualiza��o          |

**�ndices:**
- `senderId, receiverId, itemId` (para buscar conversas)
- `receiverId, lida` (para contar n�o lidas)

### Queries Importantes

#### Buscar Conversas do Usu�rio

```sql
-- Busca todas as conversas �nicas (otherUserId, itemId) do usu�rio
SELECT DISTINCT
  CASE
    WHEN senderId = ? THEN receiverId
    ELSE senderId
  END as otherUserId,
  itemId,
  MAX(createdAt) as lastMessageAt
FROM chat_messages
WHERE senderId = ? OR receiverId = ?
GROUP BY otherUserId, itemId
ORDER BY lastMessageAt DESC
```

#### Contar Mensagens N�o Lidas

```sql
-- Conta mensagens n�o lidas para um usu�rio
SELECT COUNT(*) as unreadCount
FROM chat_messages
WHERE receiverId = ? AND lida = FALSE
```

#### Buscar Itens Pr�ximos (Geolocaliza��o)

```sql
-- Busca itens em um raio de 50km (aproximado)
-- Usa f�rmula de Haversine simplificada
SELECT *,
  (
    6371 * acos(
      cos(radians(?)) * cos(radians(latitude)) *
      cos(radians(longitude) - radians(?)) +
      sin(radians(?)) * sin(radians(latitude))
    )
  ) AS distance
FROM items
WHERE status = 'disponivel'
  AND deletedAt IS NULL
HAVING distance < 50
ORDER BY distance ASC
```

---

## 8. Autentica��o e Seguran�a

### 8.1 Fluxo de Autentica��o JWT

```
+-------------+                  +-------------+
�   Cliente   �                  �   Servidor  �
+-------------+                  +-------------+
       �                                �
       �  POST /auth/login              �
       �  { email, senha }              �
       +-------------------------------?�
       �                                �
       �                                � 1. Busca usu�rio por email
       �                                � 2. Compara senha com bcrypt
       �                                � 3. Gera token JWT
       �                                �
       �  { user, token }               �
       �?-------------------------------�
       �                                �
       � Salva token em localStorage    �
       � Configura header Authorization �
       �                                �
       �  GET /api/items                �
       �  Authorization: Bearer <token> �
       +-------------------------------?�
       �                                �
       �                                � authMiddleware:
       �                                � 1. Extrai token do header
       �                                � 2. Verifica com jwt.verify()
       �                                � 3. Adiciona userId ao req
       �                                �
       �  { items: [...] }              �
       �?-------------------------------�
       �                                �
```

### 8.2 Estrutura do Token JWT

```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "userId": 123,
    "email": "usuario@example.com",
    "role": "common",
    "iat": 1697654400,
    "exp": 1698259200
  },
  "signature": "..."
}
```

**Campos do Payload:**
- `userId`: ID do usu�rio no banco
- `email`: Email do usu�rio
- `role`: Papel do usu�rio (admin/verified/common)
- `iat` (issued at): Timestamp de cria��o
- `exp` (expiration): Timestamp de expira��o (7 dias por padr�o)

### 8.3 Seguran�a de Senhas

```typescript
// Registro: Criptografa senha antes de salvar
const hashedPassword = await bcrypt.hash(senha, 10);
// 10 rounds de salt (boa pr�tica)

// Login: Compara senha fornecida com hash
const isValid = await bcrypt.compare(senhaFornecida, senhaHashNoBank);
```

**Por que bcrypt?**
- ? Algoritmo de hash lento (resistente a brute-force)
- ? Salt autom�tico (protege contra rainbow tables)
- ? Configur�vel (rounds de salt ajust�veis)

### 8.4 Prote��o de Rotas

#### Backend

```typescript
// Rota protegida: requer autentica��o
router.get('/items/my', authMiddleware, itemController.findMyItems);

// Rota protegida: requer admin
router.delete('/users/:id', authMiddleware, roleMiddleware(['admin']), userController.delete);
```

#### Frontend

```typescript
// Guard de navega��o
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login');
    return;
  }

  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next('/');
    return;
  }

  next();
});
```

### 8.5 Valida��o de Dados (DTOs)

```typescript
// CreateItemDTO - valida dados de entrada
export class CreateItemDTO {
  @IsString()
  @IsNotEmpty({ message: 'T�tulo � obrigat�rio' })
  @Length(3, 200, { message: 'T�tulo deve ter entre 3 e 200 caracteres' })
  titulo: string;

  @IsString()
  @IsNotEmpty({ message: 'Descri��o � obrigat�ria' })
  @Length(10, 2000, { message: 'Descri��o deve ter entre 10 e 2000 caracteres' })
  descricao: string;

  @IsString()
  @IsOptional()
  categoria?: string;

  @IsNumber()
  @IsOptional()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @IsNumber()
  @IsOptional()
  @Min(-180)
  @Max(180)
  longitude?: number;
}
```

---

## 9. WebSocket e Chat em Tempo Real

### 9.1 Inicializa��o do WebSocket

**Backend (`server.ts`):**

```typescript
import { Server } from 'socket.io';
import { ChatSocketHandler } from './websocket/chat.socket';

// Cria servidor HTTP
const server = createServer(app);

// Inicializa Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5000',
    credentials: true
  }
});

// Inicializa handler de chat
const chatSocketHandler = new ChatSocketHandler();
chatSocketHandler.initialize(io);
```

**Frontend (`stores/chat.ts`):**

```typescript
import { io, Socket } from 'socket.io-client';

export const useChatStore = defineStore('chat', {
  state: () => ({
    socket: null as Socket | null
  }),

  actions: {
    connectSocket(token: string) {
      this.socket = io('http://localhost:3000', {
        auth: { token }
      });

      this.setupListeners();
    },

    setupListeners() {
      if (!this.socket) return;

      this.socket.on('connect', () => {
        console.log('WebSocket conectado');
      });

      this.socket.on('message:received', (message) => {
        this.handleNewMessage(message);
      });

      this.socket.on('disconnect', () => {
        console.log('WebSocket desconectado');
      });
    }
  }
});
```

### 9.2 Autentica��o WebSocket

```typescript
// Backend: Middleware de autentica��o Socket.IO
io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error('Token n�o fornecido'));
  }

  try {
    // Verifica token JWT
    const decoded = jwt.verify(token, getJwtSecret()) as JwtPayload;
    
    // Armazena userId nos dados do socket
    socket.data.userId = decoded.userId;
    
    next(); // Permite conex�o
  } catch (error) {
    next(new Error('Token inv�lido'));
  }
});
```

### 9.3 Sistema de Salas (Rooms)

**Cada usu�rio tem sua pr�pria "sala" para receber eventos:**

```typescript
io.on('connection', (socket) => {
  const userId = socket.data.userId;

  // Usu�rio entra na sua sala pessoal
  socket.join(`user:${userId}`);
  
  console.log(`Usu�rio ${userId} conectado na sala user:${userId}`);
});
```

**Enviar mensagem para usu�rio espec�fico:**

```typescript
// Envia evento apenas para o receiver
io.to(`user:${receiverId}`).emit('message:received', message);

// Envia para todos na sala (broadcast)
io.to('room-name').emit('event', data);

// Envia para todos exceto o sender
socket.broadcast.to('room-name').emit('event', data);
```

### 9.4 Eventos do Chat

#### Cliente ? Servidor

**`message:send`** - Enviar mensagem

```typescript
// Frontend
socket.emit('message:send', {
  receiverId: 456,
  itemId: 789,
  conteudo: 'Ol�, gostaria de fazer uma troca!'
});
```

**`user:typing`** - Notificar que est� digitando

```typescript
// Frontend
socket.emit('user:typing', {
  receiverId: 456,
  itemId: 789,
  isTyping: true
});
```

#### Servidor ? Cliente

**`message:received`** - Nova mensagem recebida

```typescript
// Backend
io.to(`user:${receiverId}`).emit('message:received', {
  id: 123,
  senderId: 456,
  receiverId: 789,
  itemId: 101,
  conteudo: 'Ol�!',
  lida: false,
  createdAt: '2025-10-18T12:00:00Z'
});
```

**`message:sent`** - Confirma��o de envio

```typescript
// Backend (para o remetente)
socket.emit('message:sent', message);
```

**`unread:update`** - Atualizar contador de n�o lidas

```typescript
// Backend
io.to(`user:${userId}`).emit('unread:update', {
  count: 5
});
```

---

## 10. Funcionalidades Principais

### 10.1 Sistema de Items

#### Cria��o de Item

1. Usu�rio acessa `/items/new`
2. Preenche formul�rio:
   - T�tulo (3-200 caracteres)
   - Descri��o (10-2000 caracteres)
   - Categoria (opcional)
   - Imagens (at� 5, 5MB cada)
   - Localiza��o no mapa (opcional)
3. Submit ? `POST /api/items`
4. Multer processa upload de imagens
5. ItemService salva item no banco
6. Redireciona para p�gina do item

#### Listagem e Filtros

```typescript
// Buscar itens com filtros
GET /api/items?category=eletronicos&search=smartphone&status=disponivel&page=1&limit=12

// Resposta
{
  items: [...],
  total: 145,
  page: 1,
  totalPages: 13
}
```

**Filtros Dispon�veis:**
- `category`: Filtra por categoria
- `search`: Busca por t�tulo ou descri��o
- `status`: Filtra por status (disponivel/em_negociacao/trocado)
- `page`: P�gina atual (pagina��o)
- `limit`: Itens por p�gina (padr�o: 12)

#### Ciclo de Vida do Item

```
+--------------+
�  DISPON�VEL  � ?--- Item criado
+--------------+
       �
       � Proposta aceita
       ?
+--------------+
� EM_NEGOCIA��O� ?--- Usu�rios conversando
+--------------+
       �
       � Troca realizada
       ?
+--------------+
�   TROCADO    � ?--- Item n�o aparece mais em buscas
+--------------+
```

### 10.2 Sistema de Propostas

#### Criar Proposta

```typescript
// Frontend
const createProposal = async (itemId: number, mensagem: string) => {
  await api.post('/proposals', {
    itemId,
    mensagem
  });
};
```

#### Aceitar/Recusar Proposta

```typescript
// Frontend
const updateProposalStatus = async (proposalId: number, status: 'aceita' | 'recusada') => {
  await api.patch(`/proposals/${proposalId}/status`, { status });
};
```

**O que acontece ao aceitar:**
1. Status da proposta ? 'aceita'
2. Status do item ? 'em_negociacao'
3. Notifica��o enviada ao proposer
4. Chat habilitado entre ambos os usu�rios

### 10.3 Sistema de Avalia��es

```typescript
// Criar avalia��o
POST /api/ratings
{
  toUserId: 456,      // Quem est� sendo avaliado
  stars: 5,           // 1-5 estrelas
  comment: "�tima negocia��o!" // Opcional
}
```

**Exibi��o:**
- M�dia de avalia��es na p�gina de perfil do usu�rio
- Badge de "Usu�rio Verificado" se m�dia > 4.5 e > 10 avalia��es

### 10.4 Sistema de Den�ncias

```typescript
// Denunciar usu�rio ou item
POST /api/reports
{
  type: 'user' | 'item',
  reportedId: 123,
  reason: 'Spam',
  description: 'Detalhes da den�ncia...'
}
```

**Status de Den�ncia:**
- `pendente`: Aguardando an�lise
- `em_analise`: Admin est� analisando
- `resolvida`: A��o foi tomada

**A��es do Admin:**
1. Lista den�ncias em `/admin/reports`
2. Analisa detalhes
3. Atualiza status
4. Registra a��o tomada (ban, warning, etc.)

### 10.5 Painel Administrativo

**Rota:** `/admin`

**Funcionalidades:**
- ?? **Dashboard**: Estat�sticas gerais
  - Total de usu�rios
  - Total de items
  - Total de trocas realizadas
  - Itens por categoria (gr�fico)
- ?? **Gerenciar Usu�rios**
  - Listar todos usu�rios
  - Editar role (admin/verified/common)
  - Deletar usu�rio
  - Ver hist�rico de atividades
- ?? **Gerenciar Items**
  - Listar todos items
  - Editar item
  - Deletar item
  - Alterar status
- ?? **Gerenciar Den�ncias**
  - Listar den�ncias
  - Filtrar por status/tipo
  - Analisar e tomar a��o
  - Registrar decis�o

---

## ?? Resumo da Arquitetura

### Backend (Node.js + TypeScript + Express)

```
Routes ? Controllers ? Services ? Entities ? Database
  ?          ?           ?          ?
HTTP      Valida��o    L�gica    TypeORM    SQLite
          Handlers     Neg�cio   Models
```

### Frontend (Vue 3 + TypeScript + Vite)

```
Views ? Components ? Stores (Pinia) ? Services ? Backend API
  ?         ?            ?              ?
Pages     UI         State Mgmt     HTTP/WS
                     Reactive       Calls
```

### Comunica��o

- **REST API**: CRUD operations (HTTP)
- **WebSocket**: Real-time chat (Socket.IO)
- **JWT**: Autentica��o stateless
- **Middleware**: Valida��o e autoriza��o

---

## ?? Pr�ximos Passos

Este documento serve como base completa para entender o projeto TrocaAi. Para informa��es adicionais, consulte:

- **MAPA_MENTAL.md** - Visualiza��o estrutural do sistema
- **CODIGO_COMENTADO.md** - Explica��o linha por linha de arquivos-chave
- **MELHORIAS_SUGERIDAS.md** - Sugest�es de novas funcionalidades
- Documenta��o inline no c�digo-fonte

---

**Documenta��o criada em:** Outubro 2025  
**Vers�o do TrocaAi:** 1.0.0  
**�ltima atualiza��o:** 18/10/2025




