<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/composables/useToast';
import api from '@/services/api';

interface Item {
  id: number;
  titulo: string;
  descricao: string;
  categoria: string;
  status: string;
  imagens?: string[];
  createdAt: string;
  owner: {
    id: number;
    nome: string;
    email: string;
  };
}

interface PaginatedResponse {
  data: Item[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const authStore = useAuthStore();
const toast = useToast();

const items = ref<Item[]>([]);
const loading = ref(true);
const searchQuery = ref('');
const selectedCategory = ref('all');
const selectedStatus = ref('all');
const categories = ref<string[]>([]);

const currentPage = ref(1);
const itemsPerPage = ref(12);
const totalItems = ref(0);
const totalPages = ref(0);

const showItemModal = ref(false);
const selectedItem = ref<Item | null>(null);
const showDeleteConfirm = ref(false);
const itemToDelete = ref<Item | null>(null);

onMounted(async () => {
  await loadCategories();
  await loadItems();
});

const loadCategories = async () => {
  try {
    const response = await api.get<string[]>('/api/items/categories');
    categories.value = response.data;
  } catch (error: any) {
    console.error('Erro ao carregar categorias:', error);
  }
};

const loadItems = async () => {
  loading.value = true;
  try {
    const params = new URLSearchParams({
      page: currentPage.value.toString(),
      limit: itemsPerPage.value.toString()
    });

    if (searchQuery.value) {
      params.append('search', searchQuery.value);
    }
    if (selectedCategory.value !== 'all') {
      params.append('category', selectedCategory.value);
    }
    if (selectedStatus.value !== 'all') {
      params.append('status', selectedStatus.value);
    }

    const response = await api.get<PaginatedResponse>(`/api/items?${params.toString()}`);
    
    items.value = response.data.data;
    totalItems.value = response.data.pagination.total;
    totalPages.value = response.data.pagination.totalPages;
    
    console.log('Itens carregados:', items.value.length);
  } catch (error: any) {
    console.error('Erro ao carregar itens:', error);
    toast.error(error.response?.data?.error || 'Erro ao carregar itens');
  } finally {
    loading.value = false;
  }
};

const itemStats = computed(() => {
  return {
    total: totalItems.value,
    disponivel: items.value.filter(i => i.status === 'disponivel').length,
    em_negociacao: items.value.filter(i => i.status === 'em_negociacao').length,
    trocado: items.value.filter(i => i.status === 'trocado').length
  };
});

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const getStatusColor = (status: string) => {
  const colors = {
    disponivel: 'bg-green-100 text-green-800 border-green-200',
    em_negociacao: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    trocado: 'bg-gray-100 text-gray-800 border-gray-200'
  };
  return colors[status as keyof typeof colors] || colors.disponivel;
};

const getStatusLabel = (status: string) => {
  const labels = {
    disponivel: 'Disponível',
    em_negociacao: 'Em Negociação',
    trocado: 'Trocado'
  };
  return labels[status as keyof typeof labels] || 'Disponível';
};

const openItemModal = (item: Item) => {
  selectedItem.value = item;
  showItemModal.value = true;
};

const closeItemModal = () => {
  showItemModal.value = false;
  selectedItem.value = null;
};

const confirmDeleteItem = (item: Item) => {
  itemToDelete.value = item;
  showDeleteConfirm.value = true;
};

const handleDeleteItem = async () => {
  if (!itemToDelete.value) return;

  try {
    await api.delete(`/api/items/${itemToDelete.value.id}`);
    toast.success('Item deletado com sucesso');
    await loadItems();
    showDeleteConfirm.value = false;
    itemToDelete.value = null;
    closeItemModal();
  } catch (error: any) {
    console.error('Erro ao deletar item:', error);
    toast.error(error.response?.data?.error || 'Erro ao deletar item');
  }
};

const cancelDelete = () => {
  showDeleteConfirm.value = false;
  itemToDelete.value = null;
};

const clearFilters = () => {
  searchQuery.value = '';
  selectedCategory.value = 'all';
  selectedStatus.value = 'all';
  currentPage.value = 1;
  loadItems();
};

const changePage = (page: number) => {
  currentPage.value = page;
  loadItems();
};

const getImageUrl = (imageName: string) => {
  return `${import.meta.env.VITE_API_URL}/api/uploads/${imageName}`;
};
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Gerenciar Itens</h1>
        <p class="text-sm text-gray-600 mt-1">
          Total de {{ itemStats.total }} ite{{ itemStats.total !== 1 ? 'ns' : 'm' }} cadastrado{{ itemStats.total !== 1 ? 's' : '' }}
        </p>
      </div>
      <button
        @click="loadItems"
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
            <p class="text-2xl font-bold text-gray-900 mt-1">{{ itemStats.total }}</p>
          </div>
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Disponíveis</p>
            <p class="text-2xl font-bold text-green-600 mt-1">{{ itemStats.disponivel }}</p>
          </div>
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Em Negociação</p>
            <p class="text-2xl font-bold text-yellow-600 mt-1">{{ itemStats.em_negociacao }}</p>
          </div>
          <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Trocados</p>
            <p class="text-2xl font-bold text-gray-600 mt-1">{{ itemStats.trocado }}</p>
          </div>
          <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
          <input
            v-model="searchQuery"
            @input="loadItems"
            type="text"
            placeholder="Título ou descrição..."
            class="input"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
          <select v-model="selectedCategory" @change="loadItems" class="input">
            <option value="all">Todas</option>
            <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select v-model="selectedStatus" @change="loadItems" class="input">
            <option value="all">Todos</option>
            <option value="disponivel">Disponível</option>
            <option value="em_negociacao">Em Negociação</option>
            <option value="trocado">Trocado</option>
          </select>
        </div>
      </div>
      
      <div class="mt-4 flex justify-end">
        <button @click="clearFilters" class="text-sm text-purple-600 hover:text-purple-700">
          Limpar Filtros
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      <p class="text-gray-600 mt-4">Carregando itens...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="items.length === 0" class="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
      <h3 class="mt-4 text-lg font-medium text-gray-900">Nenhum item encontrado</h3>
      <p class="mt-2 text-sm text-gray-600">Tente ajustar os filtros</p>
    </div>

    <!-- Items Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="item in items"
        :key="item.id"
        class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
        @click="openItemModal(item)"
      >
        <div class="aspect-video bg-gray-200 relative">
          <img
            v-if="item.imagens && item.imagens.length > 0"
            :src="getImageUrl(item.imagens[0])"
            :alt="item.titulo"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
            <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <span :class="['absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-medium border', getStatusColor(item.status)]">
            {{ getStatusLabel(item.status) }}
          </span>
        </div>
        <div class="p-4">
          <h3 class="font-bold text-gray-900 mb-2">{{ item.titulo }}</h3>
          <p class="text-sm text-gray-600 mb-3 line-clamp-2">{{ item.descricao }}</p>
          <div class="flex items-center justify-between text-xs text-gray-500">
            <span>{{ item.categoria }}</span>
            <span>{{ formatDate(item.createdAt) }}</span>
          </div>
          <div class="mt-3 pt-3 border-t border-gray-200">
            <p class="text-xs text-gray-600">
              <span class="font-medium">Dono:</span> {{ item.owner.nome }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex justify-center items-center space-x-2 mt-6">
      <button
        @click="changePage(currentPage - 1)"
        :disabled="currentPage === 1"
        class="px-3 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        Anterior
      </button>
      
      <span class="px-4 py-2 text-sm text-gray-600">
        Página {{ currentPage }} de {{ totalPages }}
      </span>
      
      <button
        @click="changePage(currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="px-3 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        Próxima
      </button>
    </div>

    <!-- Item Modal -->
    <transition name="modal">
      <div
        v-if="showItemModal && selectedItem"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        @click.self="closeItemModal"
      >
        <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-bold text-gray-900">Detalhes do Item</h3>
            <button @click="closeItemModal" class="p-2 hover:bg-gray-100 rounded-lg">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="space-y-4">
            <div>
              <h4 class="font-bold text-lg">{{ selectedItem.titulo }}</h4>
              <span :class="['inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border mt-2', getStatusColor(selectedItem.status)]">
                {{ getStatusLabel(selectedItem.status) }}
              </span>
            </div>

            <div>
              <p class="text-sm font-medium text-gray-700 mb-1">Descrição:</p>
              <p class="text-gray-600">{{ selectedItem.descricao }}</p>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-sm font-medium text-gray-700 mb-1">Categoria:</p>
                <p class="text-gray-600">{{ selectedItem.categoria }}</p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-700 mb-1">Data:</p>
                <p class="text-gray-600">{{ formatDate(selectedItem.createdAt) }}</p>
              </div>
            </div>

            <div>
              <p class="text-sm font-medium text-gray-700 mb-1">Proprietário:</p>
              <p class="text-gray-600">{{ selectedItem.owner.nome }} ({{ selectedItem.owner.email }})</p>
            </div>

            <div class="flex space-x-3 pt-4 border-t">
              <button @click="closeItemModal" class="flex-1 btn btn-secondary">
                Fechar
              </button>
              <button
                @click="confirmDeleteItem(selectedItem)"
                class="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Deletar Item
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Delete Confirmation -->
    <transition name="modal">
      <div
        v-if="showDeleteConfirm && itemToDelete"
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
              Tem certeza que deseja deletar <strong>{{ itemToDelete.titulo }}</strong>?
              Esta ação não pode ser desfeita.
            </p>
            <div class="flex space-x-3">
              <button @click="cancelDelete" class="flex-1 btn btn-secondary">
                Cancelar
              </button>
              <button
                @click="handleDeleteItem"
                class="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium"
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
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
