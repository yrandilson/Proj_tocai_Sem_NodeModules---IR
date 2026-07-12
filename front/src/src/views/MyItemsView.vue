<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useItemStore } from '@/stores/item';
import { useToast } from '@/composables/useToast'; // 1. Importar o Toast

const router = useRouter();
const itemStore = useItemStore();
const toast = useToast(); // 2. Iniciar o Toast

onMounted(async () => {
  await itemStore.fetchMyItems();
});

const handleDelete = async (id: number, titulo: string) => {
  if (!confirm(`Tem certeza que deseja deletar "${titulo}"?`)) return;

  try {
    await itemStore.deleteItem(id);
    toast.success('Item deletado com sucesso!'); // 3. Usar toast de sucesso
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    toast.error(`Erro ao deletar item: ${errorMessage}`); // 4. Usar toast de erro
  }
};

const handleEdit = (id: number) => {
  router.push(`/editar-item/${id}`);
};

const statusLabel = (status: string) => {
  const labels: { [key: string]: string } = {
    disponivel: 'Disponível',
    em_negociacao: 'Em Negociação',
    trocado: 'Trocado'
  };
  return labels[status];
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('pt-BR');
};
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Meus Itens</h1>
        <p class="text-gray-600">Gerencie seus itens cadastrados</p>
      </div>
      <RouterLink to="/novo-item" class="btn btn-primary">
        + Novo Item
      </RouterLink>
    </div>

    <!-- Loading -->
    <div v-if="itemStore.loadingFetchMyItems" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>

    <!-- Lista de Itens -->
    <div v-else-if="itemStore.myItems.length > 0" class="grid grid-cols-1 gap-6">
      <div
        v-for="item in itemStore.myItems"
        :key="item.id"
        class="card hover:shadow-lg transition-shadow"
      >
        <div class="flex flex-col md:flex-row md:items-center md:justify-between">
          <!-- Info do Item -->
          <div class="flex-1 mb-4 md:mb-0">
            <div class="flex items-center space-x-3 mb-2">
              <h3 class="text-xl font-bold text-gray-900">{{ item.titulo }}</h3>
              <span :class="`badge badge-${item.status}`">
                {{ statusLabel(item.status) }}
              </span>
            </div>
            <p class="text-gray-600 mb-2 line-clamp-2">{{ item.descricao }}</p>
            <div class="flex items-center space-x-4 text-sm text-gray-500">
              <span>📁 {{ item.categoria }}</span>
              <span>📅 {{ formatDate(item.createdAt) }}</span>
            </div>
          </div>

          <!-- Ações -->
          <div class="flex space-x-2">
            <RouterLink
              :to="`/items/${item.id}`"
              class="btn btn-secondary"
            >
              Ver
            </RouterLink>
            <button
              @click="handleEdit(item.id)"
              class="btn btn-secondary"
            >
              Editar
            </button>
            <button
              @click="handleDelete(item.id, item.titulo)"
              class="btn btn-danger"
            >
              Deletar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Nenhum item -->
    <div v-else class="text-center py-12">
      <div class="text-6xl mb-4">📦</div>
      <h3 class="text-2xl font-bold text-gray-900 mb-2">
        Você ainda não tem itens cadastrados
      </h3>
      <p class="text-gray-600 mb-6">
        Comece cadastrando seu primeiro item para trocar ou doar!
      </p>
      <RouterLink to="/novo-item" class="btn btn-primary">
        Cadastrar Primeiro Item
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

