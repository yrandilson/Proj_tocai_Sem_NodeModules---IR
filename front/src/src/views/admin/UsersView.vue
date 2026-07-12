// frontend/src/views/admin/UsersView.vue
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/composables/useToast';
import api from '@/services/api';

interface User {
  id: number;
  nome: string;
  email: string;
  role: 'admin' | 'verified' | 'common';
  createdAt: string;
  updatedAt: string;
  _count?: {
    items: number;
    sentProposals: number;
    receivedProposals: number;
  };
}

const authStore = useAuthStore();
const toast = useToast();

const users = ref<User[]>([]);
const loading = ref(true);
const searchQuery = ref('');
const selectedRole = ref<string>('all');
const showUserModal = ref(false);
const selectedUser = ref<User | null>(null);
const showDeleteConfirm = ref(false);
const userToDelete = ref<User | null>(null);

onMounted(async () => {
  await loadUsers();
});

const loadUsers = async () => {
  loading.value = true;
  try {
    const response = await api.get<User[]>('/api/users');
    users.value = response.data;
    console.log('Usuários carregados:', users.value);
  } catch (error: any) {
    console.error('Erro ao carregar usuários:', error);
    toast.error(error.response?.data?.error || 'Erro ao carregar usuários');
  } finally {
    loading.value = false;
  }
};

const filteredUsers = computed(() => {
  let filtered = users.value;

  // Filtro por busca
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(user => 
      user.nome.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );
  }

  // Filtro por role
  if (selectedRole.value !== 'all') {
    filtered = filtered.filter(user => user.role === selectedRole.value);
  }

  return filtered;
});

const userStats = computed(() => {
  return {
    total: users.value.length,
    admins: users.value.filter(u => u.role === 'admin').length,
    verified: users.value.filter(u => u.role === 'verified').length,
    common: users.value.filter(u => u.role === 'common').length
  };
});

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
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

const openUserModal = (user: User) => {
  selectedUser.value = user;
  showUserModal.value = true;
};

const closeUserModal = () => {
  showUserModal.value = false;
  selectedUser.value = null;
};

const handleChangeRole = async (userId: number, newRole: string) => {
  if (!confirm(`Alterar papel do usuário para ${getRoleLabel(newRole)}?`)) return;

  try {
    await api.patch(`/api/users/${userId}/role`, { role: newRole });
    toast.success('Papel do usuário alterado com sucesso');
    await loadUsers();
    closeUserModal();
  } catch (error: any) {
    console.error('Erro ao alterar papel:', error);
    toast.error(error.response?.data?.error || 'Erro ao alterar papel');
  }
};

const confirmDeleteUser = (user: User) => {
  userToDelete.value = user;
  showDeleteConfirm.value = true;
};

const handleDeleteUser = async () => {
  if (!userToDelete.value) return;

  try {
    await api.delete(`/api/users/${userToDelete.value.id}`);
    toast.success('Usuário deletado com sucesso');
    await loadUsers();
    showDeleteConfirm.value = false;
    userToDelete.value = null;
    closeUserModal();
  } catch (error: any) {
    console.error('Erro ao deletar usuário:', error);
    toast.error(error.response?.data?.error || 'Erro ao deletar usuário');
  }
};

const cancelDelete = () => {
  showDeleteConfirm.value = false;
  userToDelete.value = null;
};
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Gerenciar Usuários</h1>
        <p class="text-sm text-gray-600 mt-1">
          Total de {{ userStats.total }} usuário{{ userStats.total !== 1 ? 's' : '' }} cadastrado{{ userStats.total !== 1 ? 's' : '' }}
        </p>
      </div>
      <button
        @click="loadUsers"
        :disabled="loading"
        class="btn btn-secondary"
      >
        <svg v-if="!loading" class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <svg v-else class="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        {{ loading ? 'Atualizando...' : 'Atualizar' }}
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Total</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">{{ userStats.total }}</p>
          </div>
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Admins</p>
            <p class="text-2xl font-bold text-purple-600 mt-1">{{ userStats.admins }}</p>
          </div>
          <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Verificados</p>
            <p class="text-2xl font-bold text-blue-600 mt-1">{{ userStats.verified }}</p>
          </div>
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Comuns</p>
            <p class="text-2xl font-bold text-gray-600 mt-1">{{ userStats.common }}</p>
          </div>
          <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Search -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Buscar
          </label>
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Nome ou email..."
              class="input pl-10"
            />
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <!-- Role Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Filtrar por papel
          </label>
          <select v-model="selectedRole" class="input">
            <option value="all">Todos</option>
            <option value="admin">Admin</option>
            <option value="verified">Verificado</option>
            <option value="common">Comum</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Users Table -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <!-- Loading -->
      <div v-if="loading" class="p-12 text-center">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        <p class="text-gray-600 mt-4">Carregando usuários...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredUsers.length === 0" class="p-12 text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <h3 class="mt-4 text-lg font-medium text-gray-900">Nenhum usuário encontrado</h3>
        <p class="mt-2 text-sm text-gray-600">
          {{ searchQuery || selectedRole !== 'all' ? 'Tente ajustar os filtros' : 'Nenhum usuário cadastrado ainda' }}
        </p>
      </div>

      <!-- Table -->
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuário
              </th>
              <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Papel
              </th>
              <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cadastro
              </th>
              <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="user in filteredUsers"
              :key="user.id"
              class="hover:bg-gray-50 transition-colors"
            >
              <!-- User Info -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span class="text-white font-bold">
                      {{ user.nome.charAt(0).toUpperCase() }}
                    </span>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ user.nome }}</div>
                    <div class="text-sm text-gray-500">{{ user.email }}</div>
                  </div>
                </div>
              </td>

              <!-- Role -->
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <span :class="['inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border', getRoleColor(user.role)]">
                  {{ getRoleLabel(user.role) }}
                </span>
              </td>

              <!-- Created At -->
              <td class="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                {{ formatDate(user.createdAt) }}
              </td>

              <!-- Actions -->
              <td class="px-6 py-4 whitespace-nowrap text-center text-sm">
                <div class="flex items-center justify-center space-x-2">
                  <button
                    @click="openUserModal(user)"
                    class="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    title="Ver detalhes"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button
                    v-if="user.id !== authStore.user?.id"
                    @click="confirmDeleteUser(user)"
                    class="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

    <!-- User Modal -->
    <transition name="modal">
      <div
        v-if="showUserModal && selectedUser"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        @click.self="closeUserModal"
      >
        <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
          <!-- Modal Header -->
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

          <!-- User Info -->
          <div class="space-y-6">
            <!-- Avatar -->
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

            <!-- Details -->
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-gray-50 rounded-lg p-4">
                <p class="text-xs text-gray-600 mb-1">ID</p>
                <p class="text-sm font-semibold text-gray-900">#{{ selectedUser.id }}</p>
              </div>
              <div class="bg-gray-50 rounded-lg p-4">
                <p class="text-xs text-gray-600 mb-1">Status</p>
                <p class="text-sm font-semibold text-green-600">Ativo</p>
              </div>
              <div class="bg-gray-50 rounded-lg p-4">
                <p class="text-xs text-gray-600 mb-1">Cadastrado em</p>
                <p class="text-sm font-semibold text-gray-900">{{ formatDate(selectedUser.createdAt) }}</p>
              </div>
              <div class="bg-gray-50 rounded-lg p-4">
                <p class="text-xs text-gray-600 mb-1">Atualizado em</p>
                <p class="text-sm font-semibold text-gray-900">{{ formatDate(selectedUser.updatedAt) }}</p>
              </div>
            </div>

            <!-- Change Role -->
            <div v-if="selectedUser.id !== authStore.user?.id">
              <label class="block text-sm font-medium text-gray-700 mb-2">Alterar Papel</label>
              <div class="grid grid-cols-3 gap-2">
                <button
                  @click="handleChangeRole(selectedUser.id, 'common')"
                  :class="[
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    selectedUser.role === 'common'
                      ? 'bg-gray-200 text-gray-900 ring-2 ring-gray-400'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  ]"
                >
                  Comum
                </button>
                <button
                  @click="handleChangeRole(selectedUser.id, 'verified')"
                  :class="[
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    selectedUser.role === 'verified'
                      ? 'bg-blue-200 text-blue-900 ring-2 ring-blue-400'
                      : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                  ]"
                >
                  Verificado
                </button>
                <button
                  @click="handleChangeRole(selectedUser.id, 'admin')"
                  :class="[
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    selectedUser.role === 'admin'
                      ? 'bg-purple-200 text-purple-900 ring-2 ring-purple-400'
                      : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                  ]"
                >
                  Admin
                </button>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex space-x-3 pt-4 border-t border-gray-200">
              <button
                @click="closeUserModal"
                class="flex-1 btn btn-secondary"
              >
                Fechar
              </button>
              <button
                v-if="selectedUser.id !== authStore.user?.id"
                @click="confirmDeleteUser(selectedUser)"
                class="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Deletar Usuário
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Delete Confirmation Modal -->
    <transition name="modal">
      <div
        v-if="showDeleteConfirm && userToDelete"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        @click.self="cancelDelete"
      >
        <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
          <div class="text-center">
            <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-2">Confirmar Exclusão</h3>
            <p class="text-sm text-gray-600 mb-6">
              Tem certeza que deseja deletar o usuário <strong>{{ userToDelete.nome }}</strong>?
              Esta ação não pode ser desfeita.
            </p>
            <div class="flex space-x-3">
              <button
                @click="cancelDelete"
                class="flex-1 btn btn-secondary"
              >
                Cancelar
              </button>
              <button
                @click="handleDeleteUser"
                class="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Deletar
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
