// frontend/src/stores/notification.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/services/api';

export interface Notification {
  id: number;
  title: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt: string;
}

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref<Notification[]>([]);
  const loading = ref(false);

  const unreadCount = computed(() => notifications.value.filter(n => !n.read).length);

  const fetchNotifications = async () => {
    loading.value = true;
    try {
      const response = await api.get<Notification[]>('/api/notifications');
      notifications.value = response.data;
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
    } finally {
      loading.value = false;
    }
  };

  const markAsRead = async (id: number) => {
    const notification = notifications.value.find(n => n.id === id);
    if (notification && !notification.read) {
      notification.read = true; // Atualização otimista para resposta rápida da UI
      try {
        await api.patch(`/api/notifications/${id}/read`);
      } catch (error) {
        notification.read = false; // Reverte em caso de erro no backend
        console.error('Erro ao marcar notificação como lida:', error);
      }
    }
  };

  const clearAll = () => {
    notifications.value = [];
    loading.value = false;
  };

  return {
    notifications,
    loading,
    unreadCount,
    fetchNotifications,
    markAsRead,
    clearAll,
  };
});
