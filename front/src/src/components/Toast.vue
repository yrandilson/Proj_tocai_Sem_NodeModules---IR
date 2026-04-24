<script setup lang="ts">
import { ref, watch } from 'vue';

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

const messages = ref<ToastMessage[]>([]);
let nextId = 1;

const show = (message: string, type: ToastMessage['type'] = 'info', duration = 3000) => {
  const toast: ToastMessage = {
    id: nextId++,
    message,
    type
  };

  messages.value.push(toast);

  setTimeout(() => {
    remove(toast.id);
  }, duration);
};

const remove = (id: number) => {
  const index = messages.value.findIndex(m => m.id === id);
  if (index > -1) {
    messages.value.splice(index, 1);
  }
};

// Expor métodos
defineExpose({
  show,
  success: (message: string, duration?: number) => show(message, 'success', duration),
  error: (message: string, duration?: number) => show(message, 'error', duration),
  warning: (message: string, duration?: number) => show(message, 'warning', duration),
  info: (message: string, duration?: number) => show(message, 'info', duration)
});

const getIcon = (type: string) => {
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };
  return icons[type as keyof typeof icons];
};

const getColorClasses = (type: string) => {
  const classes = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    warning: 'bg-yellow-500 text-white',
    info: 'bg-blue-500 text-white'
  };
  return classes[type as keyof typeof classes];
};
</script>

<template>
  <div class="fixed top-4 right-4 z-50 space-y-2">
    <transition-group name="toast">
      <div
        v-for="toast in messages"
        :key="toast.id"
        :class="[getColorClasses(toast.type)]"
        class="flex items-center gap-3 px-4 py-3 rounded-lg shadow-soft-lg min-w-[300px] max-w-md"
      >
        <span class="text-xl font-bold">{{ getIcon(toast.type) }}</span>
        <p class="flex-1 text-sm font-medium">{{ toast.message }}</p>
        <button
          @click="remove(toast.id)"
          class="text-white hover:text-gray-200 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </transition-group>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100px) scale(0.9);
}
</style>
