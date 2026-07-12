import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/services/api';
import type { User, Item } from '@/types/index';

interface AdminStats {
  totalUsers: number;
  totalItems: number;
  totalProposals: number;
  totalMessages: number;
  activeUsers: number;
  newUsersThisMonth: number;
  // Adicionado para o dashboard
  messagesToday: number;
  averageMessagesPerDay: number;
  acceptanceRate: number;
  itemsThisMonth: number;
  itemsDisponiveis: number;
  itemsTrocados: number;
}

export const useAdminStore = defineStore('admin', () => {
  // State
  const stats = ref<AdminStats | null>(null);
  const recentUsers = ref<User[]>([]);
  const recentItems = ref<Item[]>([]);
  const topCategories = ref<{ name: string; count: number; trend: number }[]>([]);
  const recentActivity = ref<any[]>([]);
  const growthData = ref<any[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const adminStats = computed(() => stats.value);

  // Actions
  const fetchDashboardData = async () => {
    if (loading.value) return;
    loading.value = true;
    error.value = null;

    try {
      // Busca todas as estatísticas de um único endpoint otimizado no backend
      const [statsResponse, usersResponse, itemsResponse, categoriesResponse, activityResponse, growthResponse] = await Promise.all([
        api.get<AdminStats>('/api/admin/stats'), // Endpoint ideal que retorna todas as estatísticas
        api.get<{ data: User[] }>('/api/users?limit=5&sort=createdAt:desc'),
        api.get<{ data: Item[] }>('/api/items?limit=5&sort=createdAt:desc'),
        api.get<{ name: string; count: number; trend: number }[]>('/api/admin/top-categories'),
        api.get<any[]>('/api/admin/recent-activity'),
        api.get<any[]>('/api/admin/growth-data')
      ]);

      stats.value = statsResponse.data;
      recentUsers.value = usersResponse.data.data;
      recentItems.value = itemsResponse.data.data;
      topCategories.value = categoriesResponse.data;
      recentActivity.value = activityResponse.data;
      growthData.value = growthResponse.data;
      
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Erro ao carregar dados do dashboard';
      console.error(error.value);
    } finally {
      loading.value = false;
    }
  };

  return {
    // State
    stats,
    recentUsers,
    recentItems,
    topCategories,
    recentActivity,
    growthData,
    loading,
    error,
    // Getters
    adminStats,
    // Actions
    fetchDashboardData,
  };
});