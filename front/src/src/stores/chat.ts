import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { io, Socket } from 'socket.io-client';
import api from '@/services/api';
import { useAuthStore } from './auth';
import { type Conversation, type ChatMessage, type User, type Item, ItemStatus } from '@/types/index';
import { useProposalStore } from './proposal';
import { useToast } from '@/composables/useToast';
import { useNotificationStore } from './notification';

// Tipo para a mensagem recebida via WebSocket, que é mais rica que a ChatMessage padrão
type IncomingChatMessage = ChatMessage & {
  sender: User;
  receiver: User;
  item: Item;
};

export const useChatStore = defineStore('chat', () => {
  const authStore = useAuthStore();
  const proposalStore = useProposalStore();
  const notificationStore = useNotificationStore();
  const toast = useToast();

  const socket = ref<Socket | null>(null);
  const conversations = ref<Conversation[]>([]);
  const currentMessages = ref<ChatMessage[]>([]);
  const loading = ref(false);
  const onlineUsers = ref<Set<number>>(new Set());
  const typingUsers = ref<Set<number>>(new Set()); // Simplificado para Set de userIds

  // --- ESTADOS PARA CONTROLAR A UI DO CHAT ---
  const isChatOpen = ref(false);
  const selectedConversation = ref<Conversation | null>(null);
  const conversationToOpen = ref<{ otherUserId: number; itemId: number } | null>(null);

  const connected = computed(() => socket.value?.connected ?? false);
  const unreadCount = computed(() => conversations.value.reduce((sum: number, conv: Conversation) => sum + conv.unreadCount, 0));

  // --- AÇÃO PARA ABRIR CHAT (chamada de fora, ex: página de propostas) ---
  const openChatWithConversation = (otherUserId: number, itemId: number) => {
    // console.log(`[ChatStore] Sinalizando para abrir chat com User: ${otherUserId}`);
    isChatOpen.value = true;
    conversationToOpen.value = { otherUserId, itemId };
  };

  // --- CONEXÃO WEBSOCKET ---
  const connect = () => {
    if (socket.value?.connected || !authStore.isAuthenticated) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    socket.value = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', { 
      auth: { token },
      transports: ['websocket', 'polling']
    });
    
    setupSocketListeners();
  };

  const setupSocketListeners = () => {
    if (!socket.value) return;

    socket.value.on('connect', () => {
      // console.log('✓ WebSocket conectado');
      // Solicita lista de usuários online ao conectar
      socket.value?.emit('user:request_online_list');
    });

    socket.value.on('disconnect', () => {
      // console.log('✗ WebSocket desconectado');
    });

    // 🆕 Listener para receber lista de usuários online
    socket.value.on('user:online_list', (userIds: number[]) => {
      // console.log('📋 Lista de usuários online recebida:', userIds);
      onlineUsers.value = new Set(userIds);
    });
    
    socket.value.on('message:received', (message: IncomingChatMessage) => {
      // console.log('📩 Mensagem recebida do servidor:', message);
      
      // Normaliza o campo 'content' caso venha como 'conteudo'
      if (!message.content && (message as any).conteudo) {
        message.content = (message as any).conteudo;
      }
      
      // --- LÓGICA OTIMIZADA PARA ATUALIZAR CONVERSAS LOCALMENTE (EVITA LOOP) ---
      const otherUserId = message.senderId === authStore.user?.id ? message.receiverId : message.senderId;
      let conversation = conversations.value.find((c: Conversation) => c.otherUser.id === otherUserId);

      if (conversation) {
        // Atualiza a última mensagem e move a conversa para o topo
        conversation.lastMessage = message;
        if (message.receiverId === authStore.user?.id && selectedConversation.value?.otherUser.id !== message.senderId) {
          conversation.unreadCount++;
        }
        // Move para o topo
        conversations.value = [conversation, ...conversations.value.filter((c: Conversation) => c.otherUser.id !== otherUserId)];
      } else {
        // Se a conversa não existe, cria uma nova dinamicamente.
        // Isso evita a necessidade de chamar fetchConversations() a cada nova conversa.
        const otherUser = message.sender; // O objeto completo vem no payload do websocket
        const item = message.item;

        if (otherUser && item) {
            const newConversation: Conversation = {
                otherUser: { 
                  id: otherUser.id, 
                  nome: otherUser.nome, 
                  email: otherUser.email,
                  role: 'common', // Assume 'common' role as a safe default
                  isBlocked: false, // Adicionado para satisfazer a interface User
                  createdAt: new Date().toISOString(), // Provide a default value
                  updatedAt: new Date().toISOString(), // Provide a default value
                },
                item: { 
                  id: item.id, 
                  titulo: item.titulo, 
                  createdAt: item.createdAt || new Date().toISOString(),
                  // Add required default values to satisfy the Item type
                  descricao: '',
                  categoria: '', // Categoria pode ser vazia se não vier
                  status: ItemStatus.DISPONIVEL, // Usa o enum para o status
                  ownerId: otherUser.id, // This is a reasonable assumption
                  owner: otherUser,
                  updatedAt: new Date().toISOString(),
                  imagens: [], // ✅ Propriedade obrigatória adicionada
                  tradePreferences: [], // ✅ Propriedade obrigatória adicionada
                },
                lastMessage: message,
                unreadCount: message.receiverId === authStore.user?.id ? 1 : 0,
            };
            conversations.value.unshift(newConversation); // Adiciona no topo
            console.log('[ChatStore] Nova conversa criada localmente.');
        } else {
            console.warn('[ChatStore] Não foi possível criar a conversa localmente: otherUser ou item ausentes na mensagem.');
        }
      }
      
      // Atualiza notificações
      
      // --- LÓGICA CORRIGIDA PARA ADICIONAR MENSAGEM À CONVERSA ABERTA ---
      // A verificação agora é apenas pelo ID do outro usuário, não mais pelo item.
      if (selectedConversation.value && otherUserId === selectedConversation.value.otherUser.id) {
        const isRelevantMessage = 
          message.senderId === selectedConversation.value.otherUser.id || // Mensagem recebida do outro
          message.receiverId === selectedConversation.value.otherUser.id; // Mensagem enviada para o outro
        
        if (isRelevantMessage) {
          // Verifica se a mensagem já não está na lista (evita duplicatas)
          const exists = currentMessages.value.some((m: ChatMessage) => 
            // Compara por ID real ou por conteúdo+timestamp para mensagens temporárias
            m.id === message.id || 
            (m.content === message.content && Math.abs(new Date(m.createdAt).getTime() - new Date(message.createdAt).getTime()) < 2000)
          );
          
          if (!exists) {
            currentMessages.value.push(message);
            // console.log('✅ Nova mensagem adicionada à conversa');
          } else {
            // Atualiza mensagem temporária com dados reais do servidor
            const tempIndex = currentMessages.value.findIndex((m: ChatMessage) => 
              m.content === message.content && 
              Math.abs(new Date(m.createdAt).getTime() - new Date(message.createdAt).getTime()) < 2000 &&
              m.id !== message.id
            );
            if (tempIndex !== -1) {
              currentMessages.value[tempIndex] = message;
              // console.log('✅ Mensagem temporária substituída por mensagem real do servidor');
            }
          }
          
          // Marca como lida automaticamente se a mensagem é RECEBIDA e a conversa está aberta
          if (message.senderId === selectedConversation.value.otherUser.id) {
            markAsRead(message.senderId); // A chamada já estava correta aqui
          }
        }
      }
    });

    // Listener para atualização de contador de não lidas
    socket.value.on('unread:update', ({ count }: { count: number }) => {
      // console.log('🔔 Contador de não lidas atualizado:', count);
      // --- LÓGICA OTIMIZADA: Apenas busca as conversas se o contador global não bater ---
      const localUnreadCount = conversations.value.reduce((sum: number, conv: Conversation) => sum + conv.unreadCount, 0);
      if (localUnreadCount !== count) {
        fetchConversations();
      }
    });

    socket.value.on('proposal:new', (data: { message: string }) => {
      toast.info(data.message);
      proposalStore.fetchReceivedProposals();
      notificationStore.fetchNotifications();
    });
    
    socket.value.on('user:online', (userId: number) => {
      // console.log(`👤 Usuário ${userId} online`);
      onlineUsers.value.add(userId);
    });
    
    socket.value.on('user:offline', (userId: number) => {
      // console.log(`👤 Usuário ${userId} offline`);
      onlineUsers.value.delete(userId);
    });
    
    // Listener de "typing" simplificado
    socket.value.on('user:typing', (data: { senderId: number; isTyping: boolean }) => {
      if (data.isTyping) {
        typingUsers.value.add(data.senderId);
      } else {
        typingUsers.value.delete(data.senderId);
      }
    });
  };

  const disconnect = () => {
    if (socket.value) {
      socket.value.disconnect();
      socket.value = null;
    }
    onlineUsers.value.clear();
    typingUsers.value.clear();
    isChatOpen.value = false;
    selectedConversation.value = null;
    conversationToOpen.value = null;
    currentMessages.value = [];
  };

  // --- BUSCAR CONVERSAS ---
  const fetchConversations = async () => {
    if (!authStore.isAuthenticated) {
      console.warn('⚠️ Usuário não autenticado');
      return;
    }
    
    loading.value = true;
    try {
      // console.log('📋 GET /api/chat/conversations');
      const response = await api.get<Conversation[]>('/api/chat/conversations');
      conversations.value = response.data;
      // console.log(`✅ ${response.data.length} conversas carregadas`);
    } catch (error: any) {
      console.error('❌ Erro ao buscar conversas:', error);
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);
      
      if (error.response?.status === 404) {
        toast.error('Rota de conversas não encontrada');
      } else if (error.response?.status === 401) {
        toast.error('Sessão expirada. Faça login novamente.');
      } else {
        toast.error('Erro ao carregar conversas');
      }
    } finally {
      loading.value = false;
    }
  };

  // --- BUSCAR MENSAGENS DE UMA CONVERSA ---
  const fetchMessages = async (otherUserId: number) => {
    loading.value = true;
    try {
      // console.log(`💬 GET /api/chat/messages/${otherUserId}`);
      
      // ✅ CORREÇÃO: Parâmetros na URL (não em query params)
      const response = await api.get<ChatMessage[]>(
        `/api/chat/messages/${otherUserId}` // <-- Remove itemId
      );
      
      // Normaliza as mensagens
      currentMessages.value = response.data.map((msg: ChatMessage) => ({
        ...msg,
        content: msg.content || (msg as any).conteudo || ''
      }));
      
      // console.log(`✅ ${response.data.length} mensagens carregadas`);
      
      // Marca como lidas automaticamente
      await markAsRead(otherUserId);
    } catch (error: any) {
      console.error('❌ Erro ao buscar mensagens:', error);
      console.error('URL tentada:', `/api/chat/messages/${otherUserId}`);
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);
      
      if (error.response?.status === 404) {
        toast.error('Rota de mensagens não encontrada');
      } else {
        toast.error('Erro ao carregar mensagens');
      }
    } finally {
      loading.value = false;
    }
  };

  // --- ENVIAR MENSAGEM ---
  const sendMessage = async (otherUserId: number, itemId: number, content: string) => {
    if (!socket.value?.connected) {
      toast.error('Conexão perdida. Reconectando...');
      connect();
      return;
    }

    if (!content.trim() || !authStore.user) return;

    // Declara a mensagem temporária fora do try para que seja acessível no catch
    let tempMessage: ChatMessage | null = null;

    try {
      // console.log(`📤 Enviando mensagem para User: ${otherUserId}, Item: ${itemId}`);
      
      // ATUALIZAÇÃO OTIMISTA: Adiciona a mensagem localmente IMEDIATAMENTE
      const tempMessage: ChatMessage = {
        id: Date.now(), // ID temporário único
        content: content.trim(),
        senderId: authStore.user.id,
        receiverId: otherUserId,
        itemId,
        read: false,
        createdAt: new Date().toISOString()
      };
      // Adiciona na lista de mensagens atual
      currentMessages.value.push(tempMessage);
      // console.log('✅ Mensagem adicionada localmente (atualização otimista)');
      
      // Envia via WebSocket
      socket.value.emit('message:send', {
        receiverId: otherUserId,
        itemId,
        content: content.trim()
      });

      // console.log('✅ Mensagem enviada via WebSocket');
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      toast.error('Erro ao enviar mensagem');
      
      // Remove a mensagem otimista em caso de erro
      if (tempMessage) {
        // Remove a última mensagem adicionada (que é a temporária que falhou)
        // Isso é mais seguro do que filtrar por ID, especialmente se houver múltiplas ações rápidas.
        currentMessages.value.pop();
      }
    }
  };

  // --- MARCAR MENSAGENS COMO LIDAS ---
  const markAsRead = async (otherUserId: number) => {
    try {
      // Via HTTP
      await api.post('/api/chat/read', { otherUserId });
      
      // Também notifica via WebSocket para atualização em tempo real
      if (socket.value?.connected) {
        socket.value.emit('message:read', { otherUserId });
      }
      
      // Atualiza o contador localmente
      const conv = conversations.value.find(
        (c: Conversation) => c.otherUser.id === otherUserId
      );
      if (conv) {
        conv.unreadCount = 0;
      }
      
      // console.log('✅ Mensagens marcadas como lidas');
    } catch (error) {
      console.error('❌ Erro ao marcar como lida:', error);
    }
  };

  // --- NOTIFICAR QUE ESTÁ DIGITANDO ---
  const notifyTyping = (isTyping: boolean) => {
    if (socket.value?.connected && selectedConversation.value) {
      socket.value.emit('user:typing', {
        receiverId: selectedConversation.value.otherUser.id,
        isTyping,
        itemId: selectedConversation.value.item.id // Mantido para compatibilidade, mas não é mais a chave principal
      });
    }
  };

  // --- SELECIONAR CONVERSA ---
  const selectConversation = (conversation: Conversation) => {
    // console.log('🔍 Selecionando conversa:', conversation);
    selectedConversation.value = conversation;

    // Entra na sala de chat da conversa selecionada
    if (socket.value?.connected) {
      socket.value.emit('chat:join', { otherUserId: conversation.otherUser.id });
      console.log(`[ChatStore] Entrando na sala de chat com ${conversation.otherUser.id}`);
    }

    fetchMessages(conversation.otherUser.id);
  };

  // --- FECHAR CHAT ---
  const closeChat = () => {
    isChatOpen.value = false;
    selectedConversation.value = null;
    currentMessages.value = [];
  };

  // --- LIMPAR MENSAGENS ATUAIS ---
  const clearCurrentMessages = () => {
    currentMessages.value = [];
  };

  // --- ALTERNAR VISIBILIDADE DO CHAT ---
  const toggleChat = () => {
    isChatOpen.value = !isChatOpen.value;
    if (isChatOpen.value) {
      fetchConversations();
    }
  };

  const prepareAndSelectConversation = async (otherUserId: number, itemId: number) => {
    loading.value = true;
    try {
      // Garante que a lista principal de conversas esteja carregada
      if (conversations.value.length === 0) {
        await fetchConversations();
      }

      // Tenta encontrar uma conversa existente
      let conversation = conversations.value.find((c: Conversation) => c.otherUser.id === otherUserId);

      if (conversation) {
        // Se encontrou, apenas seleciona
        await selectConversation(conversation);
      } else {
        // Se NÃO encontrou, precisa criar uma "conversa virtual" para ser exibida
        console.log(`Preparando nova conversa com usuário ${otherUserId}`);
        
        // Mock dos dados por enquanto. Em um cenário real, buscaria da API.
        // Ex: const otherUserResponse = await api.get(`/users/${otherUserId}`);
        // Ex: const itemResponse = await api.get(`/items/${itemId}`);
        const otherUserDetails = { id: otherUserId, nome: `Usuário ${otherUserId}`, email: '', role: 'common', createdAt: '', updatedAt: '' } as User;
        const itemDetails = { id: itemId, titulo: `Item ${itemId}`, descricao: '', categoria: '', status: 'disponivel', ownerId: 0, owner: otherUserDetails, createdAt: '', updatedAt: '' } as Item;

        if (!otherUserDetails || !itemDetails) {
          throw new Error("Dados incompletos: Não foi possível buscar detalhes do usuário ou do item.");
        }

        // Cria e seleciona a nova conversa temporária
        selectedConversation.value = {
          otherUser: otherUserDetails,
          item: itemDetails,
          lastMessage: { id: 0, content: 'Inicie a conversa!', read: true, senderId: 0, receiverId: 0, itemId: 0, createdAt: new Date().toISOString() },
          unreadCount: 0,
        } as Conversation;
        
        // Limpa as mensagens atuais, pois é uma nova conversa
        currentMessages.value = [];
      }
    } catch (error) {
      console.error("Erro ao preparar a conversa:", error);
      selectedConversation.value = null; // Limpa em caso de erro
      throw error; // Propaga o erro para o componente poder tratar
    } finally {
      loading.value = false;
    }
  };

  const clearConversationToOpen = () => {
    conversationToOpen.value = null;
  };

  /**
   * Reseta completamente o estado da store para os valores iniciais.
   * Usado principalmente durante o logout do usuário.
   */
  const resetStore = () => {
    disconnect(); // A função disconnect já limpa a maior parte do estado.
    conversations.value = [];
    loading.value = false;
    // Garante que todos os estados reativos voltem ao padrão.
    isChatOpen.value = false;
    selectedConversation.value = null;
    conversationToOpen.value = null;
    currentMessages.value = [];
  };

  return {
    // Estados
    socket,
    conversations,
    currentMessages,
    loading,
    onlineUsers,
    typingUsers,
    isChatOpen,
    selectedConversation,
    conversationToOpen,
    
    // Computed
    connected,
    unreadCount,
    
    // Ações
    connect,
    disconnect,
    fetchConversations,
    fetchMessages,
    sendMessage,
    markAsRead,
    notifyTyping,
    selectConversation,
    openChatWithConversation,
    closeChat,
    clearCurrentMessages,
    toggleChat,
    prepareAndSelectConversation,
    clearConversationToOpen,
    resetStore, // Exporta a nova função

    /**
     * Arquiva (soft-delete) uma conversa inteira.
     */
    async deleteConversation(otherUserId: number, itemId: number) {
      console.log(`[ChatStore] Arquivando conversa com User: ${otherUserId}, Item: ${itemId}`);
      try {
        await api.delete(`/api/chat/conversations/${otherUserId}/${itemId}`);
        // Remove a conversa da lista local
        conversations.value = conversations.value.filter(c => !(c.otherUser.id === otherUserId && c.item.id === itemId));
        if (selectedConversation.value?.otherUser.id === otherUserId && selectedConversation.value?.item.id === itemId) {
          selectedConversation.value = null;
          currentMessages.value = [];
        }
        toast.success('Conversa arquivada com sucesso!');
      } catch (error) {
        console.error('Erro ao arquivar conversa:', error);
        toast.error('Erro ao arquivar a conversa.');
      }
    }
  };
});
