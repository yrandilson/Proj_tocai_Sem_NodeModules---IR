<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  disabled: boolean;
}>();

const emit = defineEmits<{
  (e: 'sendMessage', content: string): void;
  (e: 'typing'): void;
}>();

const messageInput = ref('');
const quickEmojis = ['👍', '❤️', '😊', '🎉', '🔥', '✅'];

const handleSendMessage = () => {
  if (!messageInput.value.trim()) return;
  emit('sendMessage', messageInput.value);
  messageInput.value = '';
};

const handleSendQuickEmoji = (emoji: string) => {
  emit('sendMessage', emoji);
};

const handleTyping = () => {
  emit('typing');
};
</script>

<template>
  <div class="flex-shrink-0 border-t bg-white">
    <!-- Emojis rápidos -->
    <div class="p-2 flex space-x-2 overflow-x-auto">
      <button
        v-for="emoji in quickEmojis"
        :key="emoji"
        @click="handleSendQuickEmoji(emoji)"
        class="text-2xl hover:scale-125 transition-transform"
        :disabled="props.disabled"
      >
        {{ emoji }}
      </button>
    </div>

    <!-- Input de mensagem -->
    <div class="p-3">
      <form @submit.prevent="handleSendMessage" class="flex items-center space-x-2">
        <input
          v-model="messageInput"
          @input="handleTyping"
          type="text"
          placeholder="Digite sua mensagem..."
          class="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 h-11 box-border"
          :disabled="props.disabled"
        />
        <button
          type="submit"
          :disabled="props.disabled || !messageInput.trim()"
          class="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-medium hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed h-11"
        >
          Enviar
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* Garante que a barra de rolagem dos emojis seja discreta */
.overflow-x-auto::-webkit-scrollbar {
  height: 4px;
}
.overflow-x-auto::-webkit-scrollbar-thumb {
  background-color: #e5e7eb;
  border-radius: 20px;
}
</style>