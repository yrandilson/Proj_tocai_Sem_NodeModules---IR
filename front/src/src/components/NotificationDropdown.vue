<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useNotificationStore, type Notification } from '@/stores/notification';
import { useRouter } from 'vue-router';

const notificationStore = useNotificationStore();
const router = useRouter();

// Estado para controlar a visibilidade do dropdown
const isOpen = ref(false);

const unreadCount = computed(() => notificationStore.unreadCount);
const notifications = computed(() => notificationStore.notifications);

onMounted(() => {
  notificationStore.fetchNotifications();
});

const handleNotificationClick = (notification: Notification) => {
  notificationStore.markAsRead(notification.id);
  if (notification.link) {
    router.push(notification.link);
  }
  isOpen.value = false; // Fecha o dropdown ao clicar em um item
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
};
</script>

<template>
  <!-- O contêiner principal que escuta os eventos do mouse -->
  <div
    class="relative"
    @mouseenter="isOpen = true"
    @mouseleave="isOpen = false"
  >
    <!-- Ícone do Sino (o gatilho) -->
    <button class="relative p-2 rounded-full hover:bg-gray-100 focus:outline-none">
      <svg class="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.000 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.248 24.248 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
      </svg>
      <span v-if="unreadCount > 0" class="absolute top-1 right-1 block h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center border-2 border-white">
        {{ unreadCount }}
      </span>
    </button>

    <!-- O Menu Dropdown -->
    <transition name="fade">
      <div v-if="isOpen" class="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
        <div class="p-4 font-bold border-b">Notificações</div>
        <div v-if="notifications.length === 0" class="p-4 text-center text-gray-500">
          Nenhuma notificação.
        </div>
        <ul v-else class="max-h-96 overflow-y-auto">
          <li
            v-for="notification in notifications"
            :key="notification.id"
            @click="handleNotificationClick(notification)"
            class="p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors"
            :class="{ 'bg-blue-50': !notification.read }"
          >
            <p class="text-sm text-gray-800" :class="{ 'font-semibold': !notification.read }">{{ notification.message }}</p>
            <p class="text-xs text-gray-500 mt-1">{{ formatDate(notification.createdAt) }}</p>
          </li>
        </ul>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease-in-out, transform 0.2s ease-in-out; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-10px); }
</style>