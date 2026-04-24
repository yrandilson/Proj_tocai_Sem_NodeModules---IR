<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useChatStore } from '@/stores/chat';
import { useAuthStore } from '@/stores/auth';
import { formatTime, formatRelativeTime } from './date-utils';
// A store usa uma definição de Conversation mais completa, vamos usar a mesma.
// Assumindo que a store exporta seus tipos de um arquivo de índice.
import type { Conversation } from '@/types/index';
import MessageInput from './MessageInput.vue';
import ConversationList from './ConversationList.vue';
import MessageArea from './MessageArea.vue';
import ChatHeader from './ChatHeader.vue';

const chatStore = useChatStore();
const authStore = useAuthStore();

// --- ESTADO CONTROLADO PELA STORE ---
const isOpen = computed({
  get: () => chatStore.isChatOpen,
  set: (value) => (chatStore.isChatOpen = value),
});

const selectedConversation = computed({
  get: () => chatStore.selectedConversation,
  set: (value) => (chatStore.selectedConversation = value),
});

const showConversationList = computed(() => !selectedConversation.value);

// --- ESTADOS LOCAIS ---
const isMinimized = ref(false);
const typingTimeout = ref<ReturnType<typeof setTimeout> | null>(null);
const messageAreaRef = ref<InstanceType<typeof MessageArea> | null>(null);

// --- COMPUTED PROPERTIES ---
const totalUnread = computed(() => chatStore.unreadCount);

const isUserOnline = computed(() => {
  if (!selectedConversation.value) return false;
  return chatStore.onlineUsers.has(selectedConversation.value.otherUser.id);
});

const headerTitle = computed(() => {
  if (showConversationList.value) {
    return '💬 Conversas';
  }
  if (selectedConversation.value) {
    return selectedConversation.value.otherUser.nome;
  }
  return 'Chat'; // Título de fallback
});

const isUserTyping = computed(() => {
  if (!selectedConversation.value) return false;  
  return chatStore.typingUsers.has(selectedConversation.value.otherUser.id);
});

// --- OBSERVADOR CRÍTICO: Reage ao sinal para abrir conversa ---
watch(
  () => chatStore.conversationToOpen,
  async (info) => {
    if (!info) return;

    console.log(`[FloatingChat] Recebeu sinal para abrir conversa com usuário ${info.otherUserId} sobre o item ${info.itemId}.`);

    try {
      // 1. Garante que a janela do chat esteja aberta e não minimizada
      if (!isOpen.value) {
        chatStore.toggleChat();
      }
      isMinimized.value = false;

      // 2. Delega a lógica de encontrar ou preparar a conversa para a store.
      // A store será responsável por buscar os detalhes do usuário/item se for uma nova conversa.
      await chatStore.prepareAndSelectConversation(info.otherUserId, info.itemId);

      // 3. Garante que a área de mensagens role para o final após a seleção.
      await nextTick(() => {
        messageAreaRef.value?.scrollToBottom();
      });

    } catch (error) {
      console.error(`[FloatingChat] Erro ao tentar abrir a conversa:`, error);
      // Aqui você pode exibir uma notificação de erro para o usuário (ex: com um sistema de toast)
      // alert('Não foi possível iniciar o chat. Verifique sua conexão ou tente novamente.');
    } finally {
      // 4. Limpa o sinal para não ser processado novamente.
      chatStore.clearConversationToOpen();
    }
  }
);

// Observador para rolar para baixo quando o outro usuário está digitando
watch(isUserTyping, (isTyping) => {
  if (isTyping) {
    messageAreaRef.value?.scrollToBottom();
  }
});

// --- OBSERVADOR PARA MUDANÇA DE CONVERSA ---
// Reage apenas quando o ID do outro usuário muda, evitando loops de recarregamento.
// Este watch não é mais necessário, pois a lógica foi centralizada na ação `selectConversation` da store.
// watch(
//   () => selectedConversation.value?.otherUser.id,
//   (newUserId, oldUserId) => {
//     if (newUserId && newUserId !== oldUserId) {
//       // A conversa realmente mudou para um usuário diferente.
//       chatStore.fetchMessages(newUserId);
//     } else if (!newUserId && oldUserId) {
//       // O usuário voltou para a lista de conversas.
//       chatStore.clearCurrentMessages();
//     }
//   }
// );

// --- LIFECYCLE ---
onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
  chatStore.clearCurrentMessages();
});

// --- FUNÇÕES DE AÇÃO ---
const toggleChat = () => {
  if (!authStore.isAuthenticated) return;
  chatStore.toggleChat();
  if (isOpen.value) {
    isMinimized.value = false;
  }
};

const toggleMinimize = () => {
  isMinimized.value = !isMinimized.value;
};

const closeChat = () => {
  isOpen.value = false;
  selectedConversation.value = null;
  chatStore.clearCurrentMessages();
};

const handleArchiveConversation = () => {
  if (!selectedConversation.value) return;

  const otherUserId = selectedConversation.value.otherUser.id;
  const itemId = selectedConversation.value.item.id;

  if (confirm(`Tem certeza que deseja arquivar a conversa com ${selectedConversation.value.otherUser.nome} sobre o item "${selectedConversation.value.item.titulo}"?`)) {
    chatStore.deleteConversation(otherUserId, itemId);
    selectedConversation.value = null; // Volta para a lista de conversas
  }
};

const selectConversationFunc = async (conversation: Conversation) => {
  console.log('[FloatingChat] Selecionando conversa:', conversation);
  await chatStore.selectConversation(conversation);
  // Força a rolagem após as mensagens serem carregadas
  messageAreaRef.value?.scrollToBottom();
};

const backToList = () => {
  selectedConversation.value = null;
};

const handleSendMessage = (content: string) => {
  if (!content.trim() || !selectedConversation.value) return;

  chatStore.sendMessage(
    selectedConversation.value.otherUser.id,
    selectedConversation.value.item.id,
    content.trim()
  );
  // Força a rolagem após enviar a mensagem
  messageAreaRef.value?.scrollToBottom();
  stopTyping();
};

const handleTyping = () => {
  if (!selectedConversation.value) return;
  chatStore.notifyTyping(true);
  if (typingTimeout.value) clearTimeout(typingTimeout.value);
  typingTimeout.value = setTimeout(stopTyping, 2000);
};

const stopTyping = () => {
  if (!selectedConversation.value) return;
  chatStore.notifyTyping(false);
};

const handleKeydown = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    toggleChat();
  }
  if (e.key === 'Escape' && isOpen.value) {
    closeChat();
  }
};

</script>

<template>
  <!-- Container principal que posiciona tudo no canto inferior direito -->
  <div v-if="authStore.isAuthenticated" class="fixed bottom-6 right-4 sm:right-6 z-50 flex flex-col items-end">
    <!-- JANELA DO CHAT -->
    <transition name="chat-slide">
      <div 
        v-if="isOpen" 
        :class="[
          'bg-white shadow-2xl rounded-2xl overflow-hidden transition-all duration-300 mb-4',
          'w-[calc(100vw-2rem)] sm:w-96', // Largura responsiva
          isMinimized ? 'h-16' : 'h-[70vh] max-h-[600px]' // Altura responsiva
        ]"
      >
        <!-- HEADER -->
          <ChatHeader
            :title="headerTitle"
            :is-online="isUserOnline"
            :show-back-button="!showConversationList"
            @back="backToList"
            @minimize="toggleMinimize"
            @close="closeChat"
            @archive="handleArchiveConversation"
          />

        <!-- CONTEÚDO -->
        <div v-if="!isMinimized" class="h-[calc(100%-4rem)] flex flex-col">
          <!-- LISTA DE CONVERSAS -->
          <ConversationList
            v-if="showConversationList"
            :conversations="chatStore.conversations"
            :loading="chatStore.loading"
            @select-conversation="selectConversationFunc"
          />

          <!-- TELA DE MENSAGENS -->
          <div v-else class="flex-1 flex flex-col min-h-0">
            <MessageArea
              ref="messageAreaRef"
              :messages="chatStore.currentMessages"
              :loading="chatStore.loading"
              :is-typing="isUserTyping"
              :current-user-id="authStore.user?.id"
            />

            <!-- Input de Mensagem Refatorado -->
            <MessageInput
              :disabled="chatStore.loading"
              @send-message="handleSendMessage"
              @typing="handleTyping"
            />
          </div>
        </div>
      </div>
    </transition>

    <!-- BOTÃO FLUTUANTE -->
    <button
      @click="toggleChat"
      class="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform"
    >
      <span
        v-if="totalUnread > 0"
        class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold animate-pulse"
      >
        {{ totalUnread > 99 ? '99+' : totalUnread }}
      </span>
      <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.chat-slide-enter-active,
.chat-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.chat-slide-enter-from,
.chat-slide-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

/* Scrollbar customizada */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #c084fc;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a855f7;
}
</style>
