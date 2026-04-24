<template>
  <div class="p-6 bg-gray-50 min-h-full">
    <h1 class="text-2xl font-bold text-gray-800 mb-6">Gerenciamento de Avaliações</h1>

    <div v-if="isLoading" class="text-center py-10">
      <p>Carregando avaliações...</p>
    </div>

    <div v-else-if="error" class="text-center py-10 text-red-500">
      <p>Ocorreu um erro ao carregar as avaliações.</p>
    </div>

    <div v-else class="bg-white rounded-lg shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avaliador</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avaliado</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nota</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comentário</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="allRatings.length === 0">
              <td colspan="5" class="px-6 py-4 text-center text-gray-500">Nenhuma avaliação encontrada.</td>
            </tr>
            <tr v-for="rating in allRatings" :key="rating.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ rating.fromUser.nome }}</div>
                <div class="text-sm text-gray-500">{{ rating.fromUser.email }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ rating.toUser.nome }}</div>
                <div class="text-sm text-gray-500">{{ rating.toUser.email }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <span v-for="i in 5" :key="i" class="text-yellow-400" :class="{ 'text-gray-300': i > rating.value }">★</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <p class="text-sm text-gray-600 max-w-xs truncate" :title="rating.comment">{{ rating.comment || '-' }}</p>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ new Date(rating.createdAt).toLocaleDateString() }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '@/services/api';
import type { Rating } from '@/types/index';
import { useToast } from '@/composables/useToast';

const allRatings = ref<Rating[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);
const toast = useToast();

async function fetchAllRatings() {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await api.get('/api/ratings');
    // A API precisa ser atualizada para retornar 'toUser' também
    allRatings.value = response.data;
  } catch (err) {
    error.value = 'Falha ao buscar avaliações.';
    toast.error(error.value);
    console.error(err);
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  fetchAllRatings();
});
</script>