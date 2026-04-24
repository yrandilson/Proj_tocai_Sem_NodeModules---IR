<script setup lang="ts">
import { ref, nextTick } from 'vue';
import type { ChatMessage } from '@/types/index';
import { formatTime } from './date-utils';

const props = defineProps<{
  messages: ChatMessage[];
  loading: boolean;
  isTyping: boolean;
  currentUserId: number | undefined;
}>();

const containerRef = ref<HTMLElement | null>(null);

const scrollToBottom = () => {
  // nextTick garante que o DOM foi atualizado antes de tentar rolar
  nextTick(() => {
    if (containerRef.value) {
      containerRef.value.scrollTop = containerRef.value.scrollHeight;
    }
  });
};

// Expõe a função para ser chamada pelo componente pai
defineExpose({ scrollToBottom });
</script>

<template>
  <div ref="containerRef" class="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3">
    <div v-if="loading" class="flex justify-center items-center h-full">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
    </div>
    <template v-else>
      <div
        v-for="message in messages"
        :key="message.id"
        :class="['flex', message.senderId === currentUserId ? 'justify-end' : 'justify-start']"
      >
        <div
          :class="[
            'max-w-[70%] rounded-2xl px-4 py-2 shadow-sm',
            message.senderId === currentUserId
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
              : 'bg-white text-gray-900',
          ]"
        >
          <p class="break-words">{{ message.content || 'Mensagem vazia' }}</p>
          <span
            :class="[
              'text-xs block mt-1',
              message.senderId === currentUserId ? 'text-white/70' : 'text-gray-500',
            ]"
          >
            {{ formatTime(message.createdAt) }}
          </span>
        </div>
      </div>
      <div v-if="isTyping" class="flex justify-start">
        <div class="bg-white rounded-2xl px-4 py-2 shadow-sm">
          <div class="flex space-x-1">
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>