// frontend/src/views/AdminView.vue - Dashboard Profissional
<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import api from '@/services/api';
import { useAdminStore } from '@/stores/admin';
import { useToast } from '@/composables/useToast';
import GrowthChart from '@/components/GrowthChart.vue'; // 1. Importar o novo componente

// Definindo um tipo para o usuário para melhorar a segurança e o autocompletar
import type { User as UserType, Item, Proposal } from '@/types/index';

interface User {
  id: number;
  nome: string;
  email: string;
  role: 'admin' | 'verified' | 'common';
  createdAt: string;
  updatedAt: string;
}

const authStore = useAuthStore();
const adminStore = useAdminStore();
const toast = useToast();
 
const selectedPeriod = ref<'week' | 'month' | 'year'>('month');
const periods = ['week', 'month', 'year'] as const;
const showUserModal = ref(false);
const selectedUser = ref<UserType | null>(null);

// Watch para recarregar dados quando o período muda (se o backend suportar)
watch(selectedPeriod, () => {
  loadDashboardData();
});

// Dados do dashboard agora vêm da store
const loading = computed(() => adminStore.loading);
const stats = computed(() => adminStore.stats);
const users = computed(() => adminStore.recentUsers as UserType[]);
const recentActivity = computed(() => adminStore.recentActivity);
const topCategories = computed(() => adminStore.topCategories);
const growthData = computed(() => adminStore.growthData);

onMounted(async () => {
  await loadDashboardData();
});

// Função principal que orquestra o carregamento dos dados
const loadDashboardData = async () => {
  // Agora, apenas chamamos a ação da store
  await adminStore.fetchDashboardData();
};

const openUserModal = (user: UserType) => {
  selectedUser.value = user;
  showUserModal.value = true;
};

const closeUserModal = () => {
  showUserModal.value = false;
  selectedUser.value = null;
};

const handleChangeRole = async (userId: number, newRole: string) => {
  if (!confirm(`Alterar papel do usuário para ${newRole}?`)) return;

  try {
    // A store poderia ter uma ação para isso, mas por enquanto mantemos aqui
    await api.patch(`/api/users/${userId}/role`, { role: newRole });
    toast.success(`Papel do usuário alterado para ${newRole}`);
    await loadDashboardData();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    toast.error(`Erro ao alterar papel: ${errorMessage}`);
  }
};

const handleDeleteUser = async (userId: number) => {
  if (!confirm('Tem certeza que deseja deletar este usuário?')) return;

  try {
    await api.delete(`/api/users/${userId}`);
    toast.success('Usuário deletado com sucesso');
    await loadDashboardData();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    toast.error(`Erro ao deletar usuário: ${errorMessage}`);
  }
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const getRoleColor = (role: string) => {
  const colors = {
    admin: 'bg-purple-100 text-purple-800 border-purple-200',
    verified: 'bg-blue-100 text-blue-800 border-blue-200',
    common: 'bg-gray-100 text-gray-800 border-gray-200'
  };
  return colors[role as keyof typeof colors] || colors.common;
};

const getRoleLabel = (role: string) => {
  const labels = {
    admin: 'Admin',
    verified: 'Verificado',
    common: 'Comum'
  };
  return labels[role as keyof typeof labels] || 'Comum';
};
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 class="text-xl font-bold text-gray-900">Dashboard</h1>
              <p class="text-sm text-gray-500">Painel Administrativo</p>
            </div>
          </div>

          <div class="flex items-center space-x-3">
            <!-- Period Selector -->
              <div class="bg-gray-100 rounded-lg p-1 flex space-x-1">
              <button
                v-for="period in periods"
                :key="period"
                @click="selectedPeriod = period"
                :class="[
                  'px-4 py-2 rounded-md text-sm font-medium transition-all',
                  selectedPeriod === period
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                ]"
              >
                {{ period === 'week' ? 'Semana' : period === 'month' ? 'Mês' : 'Ano' }}
              </button>
            </div>

            <button
              @click="loadDashboardData"
              class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Atualizar"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>

      <div v-else-if="stats" class="space-y-6">
        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- Total Users -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <span class="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                +{{ stats.newUsersThisMonth }}
              </span>
            </div>
            <h3 class="text-2xl font-bold text-gray-900">{{ stats.totalUsers }}</h3>
            <p class="text-sm text-gray-600 mt-1">Total de Usuários</p>
            <div class="mt-3 flex items-center text-xs text-gray-500">
              <svg class="w-4 h-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              {{ stats.activeUsers }} ativos esta semana
            </div> 
          </div>

          <!-- Total Items -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <span class="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                +{{ stats.itemsDisponiveis }}
              </span>
            </div>
            <h3 class="text-2xl font-bold text-gray-900">{{ stats.totalItems }}</h3>
            <p class="text-sm text-gray-600 mt-1">Itens Cadastrados</p>
            <div class="mt-3 flex items-center text-xs text-gray-500">
              <svg class="w-4 h-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              {{ stats.itemsTrocados }} trocados
            </div>
          </div>

          <!-- Total Proposals -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span v-if="stats.acceptanceRate" class="text-sm font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                {{ stats.acceptanceRate.toFixed(0) }}%
              </span>
            </div>
            <h3 class="text-2xl font-bold text-gray-900">{{ stats.totalProposals || 0 }}</h3>
            <p class="text-sm text-gray-600 mt-1">Propostas Realizadas</p>
            <div class="mt-3 flex items-center text-xs text-gray-500">
              <svg class="w-4 h-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Taxa de aceitação: {{ stats.acceptanceRate.toFixed(0) }}%
            </div>
          </div>

          <!-- Total Messages -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <span v-if="stats.messagesToday > 0" class="text-sm font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                +{{ stats.messagesToday }}
              </span>
            </div>
            <h3 class="text-2xl font-bold text-gray-900">{{ stats.totalMessages || 0 }}</h3>
            <p class="text-sm text-gray-600 mt-1">Mensagens Enviadas</p>
            <div class="mt-3 flex items-center text-xs text-gray-500">
              <svg class="w-4 h-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Média: {{ stats.averageMessagesPerDay.toFixed(0) }} mensagens/dia
            </div>
          </div>
        </div>

        <!-- Charts and Tables Row -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Growth Chart -->
          <div class="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-lg font-bold text-gray-900">Crescimento da Plataforma</h2>
              <div class="flex items-center space-x-2 text-sm">
                <span class="flex items-center">
                  <span class="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                  Usuários
                </span>
                <span class="flex items-center">
                  <span class="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                  Itens
                </span>
                <span class="flex items-center">
                  <span class="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
                  Propostas
                </span>
              </div>
            </div>

            <!-- Simple Line Chart -->
            <div class="h-64">
              <!-- 2. Usar o componente de gráfico -->
              <GrowthChart v-if="growthData && growthData.length > 0" :growth-data="growthData" />
              <p v-else class="text-center w-full text-gray-400">Gráfico de crescimento em breve.</p>
            </div>
          </div>

          <!-- Top Categories -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 class="text-lg font-bold text-gray-900 mb-6">Top Categorias</h2>
            <div class="space-y-4">
              <div
                v-for="(category, index) in topCategories"
                :key="index"
                class="flex items-center justify-between"
              >
                <div class="flex-1">
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-sm font-medium text-gray-900">{{ category.name }}</span>
                    <span class="text-sm text-gray-600">{{ category.count || 0 }}</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div
                      class="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all"
                      :style="{ width: `${(category.count / 120) * 100}%` }"
                    ></div>
                  </div>
                </div>
                <span
                  :class="[
                    'ml-3 text-xs font-medium px-2 py-1 rounded-full',
                    category.trend > 0
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  ]"
                >
                  {{ category.trend > 0 ? '+' : '' }}{{ category.trend }}%
                </span> 
              </div>
            </div>
            <p v-if="!topCategories || topCategories.length === 0" class="text-center w-full text-gray-400 mt-4">Dados de categorias em breve.</p>
          </div>
        </div>

        <!-- Recent Activity and Users Table -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <!-- Recent Activity -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
            <h2 class="text-lg font-bold text-gray-900 mb-6">Atividade Recente</h2>
            <div class="space-y-4">
              <div
                v-for="(activity, index) in recentActivity"
                :key="index"
                class="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div class="text-2xl">{{ activity.icon }}</div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm text-gray-900">
                    <span class="font-semibold">{{ activity.user }}</span> {{ activity.action }}
                  </p>
                  <p class="text-xs text-gray-500 mt-1">{{ activity.time }}</p>
                </div>
              </div>
            </div> 
            <p v-if="!recentActivity || recentActivity.length === 0" class="text-center w-full text-gray-400 mt-4">Feed de atividades em breve.</p>
          </div>

          <!-- Users Table -->
          <div class="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-lg font-bold text-gray-900">Usuários Recentes</h2>
              <RouterLink to="/admin/users" class="text-sm text-purple-600 hover:text-purple-700 font-medium">
                Ver todos →
              </RouterLink>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="border-b border-gray-200">
                    <th class="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Usuário</th>
                    <th class="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Papel</th>
                    <th class="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Cadastro</th>
                    <th class="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="user in users"
                    :key="user.id"
                    class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td class="py-3 px-4">
                      <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <span class="text-white font-bold text-sm">
                            {{ user.nome.charAt(0).toUpperCase() }}
                          </span>
                        </div>
                        <div>
                          <p class="font-medium text-gray-900 text-sm">{{ user.nome }}</p>
                          <p class="text-xs text-gray-500">{{ user.email }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="py-3 px-4 text-center">
                      <span :class="['inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border', getRoleColor(user.role)]">
                        {{ getRoleLabel(user.role) }}
                      </span>
                    </td>
                    <td class="py-3 px-4 text-center text-sm text-gray-600">
                      {{ formatDate(user.createdAt!) }}
                    </td>
                    <td class="py-3 px-4">
                      <div class="flex items-center justify-center space-x-2">
                        <button
                          @click="openUserModal(user)"
                          class="p-1 text-gray-600 hover:text-purple-600 transition-colors"
                          title="Ver detalhes"
                        >
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          v-if="user.id !== authStore.user?.id"
                          @click="handleDeleteUser(user.id)"
                          class="p-1 text-gray-600 hover:text-red-600 transition-colors"
                          title="Deletar"
                        >
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- User Modal -->
    <transition name="modal">
      <div
        v-if="showUserModal"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        @click.self="closeUserModal"
      >
        <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-slideUp">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-bold text-gray-900">Detalhes do Usuário</h3>
            <button
              @click="closeUserModal"
              class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div v-if="selectedUser" class="space-y-6">
            <!-- Avatar e Info Básica -->
            <div class="flex items-center space-x-4">
              <div class="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span class="text-white font-bold text-2xl">
                  {{ selectedUser.nome.charAt(0).toUpperCase() }}
                </span>
              </div>
              <div>
                <h4 class="text-lg font-bold text-gray-900">{{ selectedUser.nome }}</h4>
                <p class="text-sm text-gray-600">{{ selectedUser.email }}</p>
                <span :class="['inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border mt-2', getRoleColor(selectedUser.role)]">
                  {{ getRoleLabel(selectedUser.role) }}
                </span>
              </div>
            </div>

            <!-- Informações Detalhadas -->
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-gray-50 rounded-lg p-4">
                <p class="text-xs text-gray-600 mb-1">Cadastrado em</p>
                <p class="text-sm font-semibold text-gray-900">{{ formatDate(selectedUser.createdAt!) }}</p>
              </div>
              <div class="bg-gray-50 rounded-lg p-4">
                <p class="text-xs text-gray-600 mb-1">Última atualização</p>
                <p class="text-sm font-semibold text-gray-900">{{ formatDate(selectedUser.updatedAt!) }}</p>
              </div>
            </div>

            <!-- Alterar Papel -->
            <div v-if="selectedUser.id !== authStore.user?.id">
              <label class="block text-sm font-medium text-gray-700 mb-2">Alterar Papel</label>
              <div class="flex space-x-2">
                <button
                  @click="handleChangeRole(selectedUser.id, 'common')"
                  :class="[
                    'flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    selectedUser.role === 'common'
                      ? 'bg-gray-200 text-gray-900'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  ]"
                >
                  Comum
                </button>
                <button
                  @click="handleChangeRole(selectedUser.id, 'verified')"
                  :class="[
                    'flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    selectedUser.role === 'verified'
                      ? 'bg-blue-200 text-blue-900'
                      : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                  ]"
                >
                  Verificado
                </button>
                <button
                  @click="handleChangeRole(selectedUser.id, 'admin')"
                  :class="[
                    'flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    selectedUser.role === 'admin'
                      ? 'bg-purple-200 text-purple-900'
                      : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                  ]"
                >
                  Admin
                </button>
              </div>
            </div>

            <!-- Ações -->
            <div class="flex space-x-3 pt-4 border-t border-gray-200">
              <button
                @click="closeUserModal"
                class="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-medium transition-colors"
              >
                Fechar
              </button>
              <button
                v-if="selectedUser.id !== authStore.user?.id"
                @click="handleDeleteUser(selectedUser.id); closeUserModal()"
                class="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Deletar Usuário
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
/* Animações */
.animate-slideUp {
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .animate-slideUp,
.modal-leave-active .animate-slideUp {
  transition: transform 0.3s ease;
}

.modal-enter-from .animate-slideUp {
  transform: translateY(20px) scale(0.95);
}

.modal-leave-to .animate-slideUp {
  transform: translateY(20px) scale(0.95);
}

/* Hover effects */
.hover\:shadow-md:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #9333ea, #ec4899);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #7e22ce, #db2777);
}
</style>