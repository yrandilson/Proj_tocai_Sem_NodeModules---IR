<!-- DOC-META: status=ativo; ultima_revisao=2026-04-10; proxima_revisao=trimestral -->
# ?? GUIA COMPLETO: Criar TrocaAi do Zero - PARTE 3

## Frontend - Setup e Implementa��o Completa

---

## 8. Frontend - Setup Inicial

### Passo 8.1: Criar projeto Vue com Vite

```bash
cd .. # voltar para raiz
npm create vite@latest frontend -- --template vue-ts
cd frontend
```

### Passo 8.2: Instalar depend�ncias

```bash
# Core
npm install vue-router pinia axios socket.io-client

# UI/UX
npm install -D tailwindcss postcss autoprefixer
npm install lucide-vue-next

# Utils
npm install chart.js vue-chartjs
```

### Passo 8.3: Configurar TailwindCSS

```bash
npx tailwindcss init -p
```

Editar `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        accent: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
        }
      },
      boxShadow: {
        'soft': '0 2px 15px rgba(0, 0, 0, 0.1)',
        'soft-lg': '0 10px 40px rgba(0, 0, 0, 0.15)',
      }
    },
  },
  plugins: [],
}
```

### Passo 8.4: Criar `frontend/src/assets/main.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * {
    @apply border-gray-200;
  }
  body {
    @apply bg-gray-50 text-gray-900;
  }
}

@layer components {
  /* Bot�es */
  .btn {
    @apply px-4 py-2 rounded-lg font-medium transition-all duration-200 inline-flex items-center justify-center gap-2;
  }
  
  .btn-primary {
    @apply bg-gradient-to-r from-primary-500 to-accent-500 text-white hover:from-primary-600 hover:to-accent-600 shadow-md hover:shadow-lg;
  }
  
  .btn-secondary {
    @apply bg-gray-200 text-gray-700 hover:bg-gray-300;
  }
  
  .btn-danger {
    @apply bg-red-500 text-white hover:bg-red-600;
  }

  /* Cards */
  .card {
    @apply bg-white rounded-xl shadow-soft p-6 transition-all duration-300;
  }
  
  /* Inputs */
  .input {
    @apply w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all;
  }
  
  /* Badges */
  .badge {
    @apply px-3 py-1 rounded-full text-xs font-medium;
  }
  
  .badge-disponivel {
    @apply bg-green-100 text-green-700;
  }
  
  .badge-em_negociacao {
    @apply bg-yellow-100 text-yellow-700;
  }
  
  .badge-trocado {
    @apply bg-gray-100 text-gray-700;
  }
}
```

### Passo 8.5: Configurar Vite (`vite.config.ts`)

```typescript
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5000,
    strictPort: true,
    hmr: {
      clientPort: 5000,
      protocol: 'ws'
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
});
```

---

## 9. Frontend - Estrutura Base

### Passo 9.1: Criar `frontend/src/types/index.ts`

```typescript
export interface User {
  id: number;
  nome: string;
  email: string;
  role: 'admin' | 'verified' | 'common';
  telefone?: string;
  cidade?: string;
  estado?: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Item {
  id: number;
  ownerId: number;
  owner: User;
  titulo: string;
  descricao: string;
  categoria: string;
  status: 'disponivel' | 'em_negociacao' | 'trocado';
  imagens?: string[];
  latitude?: number;
  longitude?: number;
  cidade?: string;
  estado?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Proposal {
  id: number;
  itemId: number;
  item: Item;
  proposerId: number;
  proposer: User;
  mensagem: string;
  status: 'pendente' | 'aceita' | 'recusada';
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: number;
  senderId: number;
  sender?: User;
  receiverId: number;
  receiver?: User;
  itemId: number;
  item?: Item;
  conteudo: string;
  lida: boolean;
  createdAt: string;
}

export interface Conversation {
  otherUserId: number;
  otherUserName: string;
  itemId: number;
  itemTitle: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export interface Notification {
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface Rating {
  id: number;
  raterId: number;
  ratedId: number;
  itemId?: number;
  stars: number;
  comment?: string;
  createdAt: string;
}
```

### Passo 9.2: Criar `frontend/src/services/api.ts`

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para adicionar token em todas as requisi��es
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para lidar com erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token inv�lido ou expirado
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## 10. Frontend - Stores (Pinia)

### Passo 10.1: Criar `frontend/src/stores/auth.ts`

```typescript
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/services/api';
import type { User } from '@/types';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(localStorage.getItem('token'));
  const loading = ref(false);

  const isAuthenticated = computed(() => !!token.value && !!user.value);
  const isAdmin = computed(() => user.value?.role === 'admin');
  const isVerified = computed(() => user.value?.role === 'verified' || user.value?.role === 'admin');

  async function login(email: string, senha: string) {
    loading.value = true;
    try {
      const response = await api.post('/auth/login', { email, senha });
      
      token.value = response.data.token;
      user.value = response.data.user;
      
      localStorage.setItem('token', token.value);
      api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;
      
      return true;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erro ao fazer login');
    } finally {
      loading.value = false;
    }
  }

  async function register(nome: string, email: string, senha: string) {
    loading.value = true;
    try {
      const response = await api.post('/auth/register', { nome, email, senha });
      
      token.value = response.data.token;
      user.value = response.data.user;
      
      localStorage.setItem('token', token.value);
      api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;
      
      return true;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erro ao registrar');
    } finally {
      loading.value = false;
    }
  }

  async function fetchMe() {
    if (!token.value) return;
    
    try {
      const response = await api.get('/auth/me');
      user.value = response.data;
    } catch (error) {
      logout();
    }
  }

  function logout() {
    user.value = null;
    token.value = null;
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  }

  return {
    user,
    token,
    loading,
    isAuthenticated,
    isAdmin,
    isVerified,
    login,
    register,
    fetchMe,
    logout
  };
});
```

### Passo 10.2: Criar `frontend/src/stores/item.ts`

```typescript
import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '@/services/api';
import type { Item } from '@/types';

export const useItemStore = defineStore('item', () => {
  const items = ref<Item[]>([]);
  const currentItem = ref<Item | null>(null);
  const myItems = ref<Item[]>([]);
  const loading = ref(false);
  const total = ref(0);
  const page = ref(1);
  const totalPages = ref(1);

  async function fetchItems(filters?: any) {
    loading.value = true;
    try {
      const response = await api.get('/items', { params: filters });
      items.value = response.data.data;
      total.value = response.data.pagination.total;
      page.value = response.data.pagination.page;
      totalPages.value = response.data.pagination.totalPages;
    } finally {
      loading.value = false;
    }
  }

  async function fetchItemById(id: number) {
    loading.value = true;
    try {
      const response = await api.get(`/items/${id}`);
      currentItem.value = response.data;
      return response.data;
    } finally {
      loading.value = false;
    }
  }

  async function fetchMyItems() {
    loading.value = true;
    try {
      const response = await api.get('/items/my');
      myItems.value = response.data;
    } finally {
      loading.value = false;
    }
  }

  async function createItem(formData: FormData) {
    const response = await api.post('/items', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    items.value.unshift(response.data);
    return response.data;
  }

  async function updateItem(id: number, formData: FormData) {
    const response = await api.put(`/items/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    const index = items.value.findIndex(item => item.id === id);
    if (index !== -1) {
      items.value[index] = response.data;
    }
    
    return response.data;
  }

  async function deleteItem(id: number) {
    await api.delete(`/items/${id}`);
    items.value = items.value.filter(item => item.id !== id);
    myItems.value = myItems.value.filter(item => item.id !== id);
  }

  async function updateItemStatus(id: number, status: string) {
    const response = await api.patch(`/items/${id}/status`, { status });
    
    const index = items.value.findIndex(item => item.id === id);
    if (index !== -1) {
      items.value[index].status = status as any;
    }
    
    return response.data;
  }

  async function fetchCategories() {
    const response = await api.get('/items/categories');
    return response.data;
  }

  return {
    items,
    currentItem,
    myItems,
    loading,
    total,
    page,
    totalPages,
    fetchItems,
    fetchItemById,
    fetchMyItems,
    createItem,
    updateItem,
    deleteItem,
    updateItemStatus,
    fetchCategories
  };
});
```

### Passo 10.3: Criar `frontend/src/stores/chat.ts`

```typescript
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { io, Socket } from 'socket.io-client';
import api from '@/services/api';
import type { ChatMessage, Conversation } from '@/types';

export const useChatStore = defineStore('chat', () => {
  const socket = ref<Socket | null>(null);
  const conversations = ref<Conversation[]>([]);
  const messages = ref<ChatMessage[]>([]);
  const unreadCount = ref(0);
  const isConnected = ref(false);
  const currentConversation = ref<{ otherUserId: number; itemId: number } | null>(null);

  const hasUnread = computed(() => unreadCount.value > 0);

  function connectSocket(token: string) {
    if (socket.value?.connected) return;

    socket.value = io('http://localhost:3000', {
      auth: { token }
    });

    socket.value.on('connect', () => {
      isConnected.value = true;
      console.log('? WebSocket conectado');
    });

    socket.value.on('disconnect', () => {
      isConnected.value = false;
      console.log('? WebSocket desconectado');
    });

    socket.value.on('message:received', (message: ChatMessage) => {
      // Adiciona mensagem � lista
      messages.value.push(message);
      
      // Atualiza conversa
      updateConversationWithNewMessage(message);
      
      // Incrementa n�o lidas
      unreadCount.value++;
    });

    socket.value.on('unread:update', (data: { count: number }) => {
      unreadCount.value = data.count;
    });

    socket.value.on('user:typing', (data: { userId: number; itemId: number; isTyping: boolean }) => {
      // Handle typing indicator
      console.log('User typing:', data);
    });
  }

  function disconnectSocket() {
    if (socket.value) {
      socket.value.disconnect();
      socket.value = null;
      isConnected.value = false;
    }
  }

  function sendMessage(receiverId: number, itemId: number, conteudo: string) {
    if (!socket.value || !conteudo.trim()) return;

    socket.value.emit('message:send', {
      receiverId,
      itemId,
      conteudo: conteudo.trim()
    });
  }

  function markAsRead(otherUserId: number, itemId: number) {
    if (!socket.value) return;

    socket.value.emit('message:read', {
      otherUserId,
      itemId
    });
  }

  function notifyTyping(receiverId: number, itemId: number, isTyping: boolean) {
    if (!socket.value) return;

    socket.value.emit('user:typing', {
      receiverId,
      itemId,
      isTyping
    });
  }

  async function fetchConversations() {
    const response = await api.get('/chat/conversations');
    conversations.value = response.data;
  }

  async function fetchMessages(otherUserId: number, itemId: number) {
    const response = await api.get(`/chat/messages/${otherUserId}/${itemId}`);
    messages.value = response.data;
    
    currentConversation.value = { otherUserId, itemId };
    
    // Marca como lidas
    await api.post('/chat/read', { otherUserId, itemId });
    markAsRead(otherUserId, itemId);
  }

  async function fetchUnreadCount() {
    const response = await api.get('/chat/unread-count');
    unreadCount.value = response.data.count;
  }

  function updateConversationWithNewMessage(message: ChatMessage) {
    const convIndex = conversations.value.findIndex(
      conv => conv.itemId === message.itemId &&
      (conv.otherUserId === message.senderId || conv.otherUserId === message.receiverId)
    );

    if (convIndex !== -1) {
      conversations.value[convIndex].lastMessage = message.conteudo;
      conversations.value[convIndex].lastMessageAt = message.createdAt;
      conversations.value[convIndex].unreadCount++;
    }
  }

  function clearMessages() {
    messages.value = [];
    currentConversation.value = null;
  }

  return {
    socket,
    conversations,
    messages,
    unreadCount,
    isConnected,
    currentConversation,
    hasUnread,
    connectSocket,
    disconnectSocket,
    sendMessage,
    markAsRead,
    notifyTyping,
    fetchConversations,
    fetchMessages,
    fetchUnreadCount,
    clearMessages
  };
});
```

### Passo 10.4: Criar demais stores

De forma similar, crie:
- `proposal.ts` - para propostas
- `notification.ts` - para notifica��es
- `admin.ts` - para painel admin

---

## 11. Frontend - Router

### Passo 11.1: Criar `frontend/src/router/index.ts`

```typescript
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'landing',
    component: () => import('@/views/LandingHome.vue')
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue')
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/RegisterView.vue')
  },
  {
    path: '/home',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/mapa',
    name: 'mapa',
    component: () => import('@/views/MapView.vue')
  },
  {
    path: '/items/new',
    name: 'new-item',
    component: () => import('@/views/NewItemView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/items/:id',
    name: 'item-details',
    component: () => import('@/views/ItemDetailsView.vue')
  },
  {
    path: '/items/:id/edit',
    name: 'edit-item',
    component: () => import('@/views/EditItemView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/my-items',
    name: 'my-items',
    component: () => import('@/views/MyItemsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/proposals/sent',
    name: 'my-proposals',
    component: () => import('@/views/MyProposalsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/proposals/received',
    name: 'received-proposals',
    component: () => import('@/views/ReceivedProposalsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/ProfileView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('@/views/AdminView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Guard de navega��o
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // Se rota requer autentica��o
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login');
    return;
  }

  // Se rota requer admin
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next('/');
    return;
  }

  next();
});

export default router;
```

---

## 12. Frontend - App Principal

### Passo 12.1: Criar `frontend/src/main.ts`

```typescript
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './assets/main.css';

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount('#app');
```

### Passo 12.2: Criar `frontend/src/App.vue`

```vue
<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useChatStore } from '@/stores/chat';
import { useRouter } from 'vue-router';
import AppHeader from '@/components/AppHeader.vue';
import AppFooter from '@/components/AppFooter.vue';
import FloatingChat from '@/components/FloatingChat.vue';
import ToastContainer from '@/components/ToastContainer.vue';

const authStore = useAuthStore();
const chatStore = useChatStore();
const router = useRouter();

onMounted(async () => {
  // Busca dados do usu�rio se tiver token
  if (authStore.token) {
    await authStore.fetchMe();
    
    // Conecta socket se autenticado
    if (authStore.isAuthenticated) {
      chatStore.connectSocket(authStore.token);
      chatStore.fetchUnreadCount();
    }
  }
});
</script>

<template>
  <div id="app" class="min-h-screen flex flex-col">
    <AppHeader v-if="authStore.isAuthenticated" />
    
    <main class="flex-1">
      <RouterView />
    </main>
    
    <AppFooter />
    
    <FloatingChat v-if="authStore.isAuthenticated" />
    
    <ToastContainer />
  </div>
</template>
```

---

## 13. Frontend - Componentes e Views

### Passo 13.1: Criar componentes essenciais

Crie os seguintes componentes em `frontend/src/components/`:

1. **AppHeader.vue** - Header com navega��o
2. **AppFooter.vue** - Footer
3. **ItemCard.vue** - Card de item
4. **FloatingChat.vue** - Chat flutuante
5. **ImageUpload.vue** - Upload de imagens
6. **ItemsMap.vue** - Mapa de items
7. **LocationPicker.vue** - Seletor de localiza��o

### Passo 13.2: Criar views essenciais

Crie as seguintes views em `frontend/src/views/`:

1. **LandingHome.vue** - P�gina inicial p�blica
2. **LoginView.vue** - Login
3. **RegisterView.vue** - Registro
4. **HomeView.vue** - Home autenticada
5. **ItemDetailsView.vue** - Detalhes do item
6. **NewItemView.vue** - Criar item
7. **MyItemsView.vue** - Meus items
8. **MapView.vue** - Visualiza��o no mapa
9. **AdminView.vue** - Painel admin

---

## 14. Teste e Deploy

### Passo 14.1: Testar localmente

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Acesse: `http://localhost:5000`

### Passo 14.2: Criar usu�rio admin inicial

Execute manualmente no backend ou crie um script:

```bash
cd backend
npx ts-node src/scripts/create-admin.ts
```

Crie `backend/src/scripts/create-admin.ts`:

```typescript
import 'reflect-metadata';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import bcrypt from 'bcryptjs';
import { UserRole } from '../types';

async function createAdmin() {
  await AppDataSource.initialize();

  const userRepository = AppDataSource.getRepository(User);

  const existingAdmin = await userRepository.findOne({
    where: { email: 'admin@trocaai.com' }
  });

  if (existingAdmin) {
    console.log('? Admin j� existe');
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash('Admin@123', 10);

  const admin = userRepository.create({
    nome: 'Administrador',
    email: 'admin@trocaai.com',
    senha: hashedPassword,
    role: UserRole.ADMIN
  });

  await userRepository.save(admin);

  console.log('? Admin criado com sucesso!');
  console.log('?? Email: admin@trocaai.com');
  console.log('?? Senha: Admin@123');
  
  process.exit(0);
}

createAdmin();
```

### Passo 14.3: Build para produ��o

```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

---

## ? CHECKLIST FINAL

- [ ] Backend configurado e rodando
- [ ] Frontend configurado e rodando
- [ ] Banco de dados criado
- [ ] Usu�rio admin criado
- [ ] WebSocket funcionando
- [ ] Upload de imagens funcionando
- [ ] Todas as rotas testadas
- [ ] Chat em tempo real funcionando
- [ ] Notifica��es funcionando
- [ ] Responsividade testada

---

## ?? Projeto Completo!

Agora voc� tem o TrocaAi funcionando completamente do zero!

**Pr�ximos passos sugeridos:**
1. Implementar testes automatizados
2. Adicionar Google Maps API
3. Implementar push notifications
4. Melhorar SEO
5. Deploy em produ��o (Replit, Vercel, etc.)

---

**Criado em:** Outubro 2025  
**Guia completo para:** TrocaAi - Plataforma de Trocas e Doa��es




