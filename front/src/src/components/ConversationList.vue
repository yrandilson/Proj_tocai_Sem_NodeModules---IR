<script setup lang="ts">
import { computed } from 'vue';
import type { Conversation } from '@/types/index';
import { formatRelativeTime } from './date-utils';

const props = defineProps<{
  conversations: Conversation[];
  loading: boolean;
}>();

// Computed property to filter out invalid conversations before rendering.
// This is cleaner and more performant than using v-if inside a v-for.
const validConversations = computed(() => props.conversations.filter(conv => conv.otherUser && conv.item));

const emit = defineEmits<{
  (e: 'select-conversation', conversation: Conversation): void;
}>();
</script>

<template>
  <div class="flex-1 overflow-y-auto">
    <div v-if="loading" class="p-8 text-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
    </div>
    <div v-else-if="validConversations.length > 0">
      <template v-for="conv in validConversations" :key="conv.lastMessage?.id || conv.item.id">
        <button
          @click="emit('select-conversation', conv)"
          class="w-full p-4 border-b hover:bg-purple-50 text-left transition group"
        >
          <div class="flex items-start space-x-3">
            <div class="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              {{ conv.otherUser.nome.charAt(0).toUpperCase() }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex justify-between items-start">
                <h4 class="font-semibold text-gray-900 truncate">
                  {{ conv.otherUser.nome }}
                </h4>
                <span class="text-xs text-gray-500 flex-shrink-0 ml-2">
                  {{ formatRelativeTime(conv.lastMessage?.createdAt || conv.item.createdAt) }}
                </span>
              </div>
              <p class="text-sm text-gray-600 truncate">{{ conv.item.titulo }}</p>
              <p v-if="conv.lastMessage" class="text-sm text-gray-500 truncate mt-1">
                {{ conv.lastMessage.content }}
              </p>
            </div>
            <span
              v-if="conv.unreadCount > 0"
              class="bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0"
            >
              {{ conv.unreadCount }}
            </span>
          </div>
        </button>
      </template>
    </div>
    <div v-else class="p-8 text-center text-gray-500">
      <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
      <p class="font-medium">Nenhuma conversa ainda</p>
      <p class="text-sm mt-1">Suas conversas aparecerão aqui</p>
    </div>
  </div>
</template>