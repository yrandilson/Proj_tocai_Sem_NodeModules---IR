<template>
  <div class="space-y-4">
    <h3 class="text-lg font-semibold text-gray-800">Avaliações Recebidas ({{ ratings.length }})</h3>
    <div v-if="isLoading" class="text-center p-4">
      <p>Carregando avaliações...</p>
    </div>
    <div v-else-if="ratings.length === 0" class="text-center p-4 bg-gray-50 rounded-lg">
      <p class="text-gray-500">Este usuário ainda não recebeu avaliações.</p>
    </div>
    <ul v-else class="space-y-3">
      <li v-for="rating in ratings" :key="rating.id" class="bg-white p-4 rounded-lg shadow-sm border">
        <div class="flex items-start space-x-3">
          <div class="flex-shrink-0">
            <!-- Ícone ou Avatar do avaliador -->
            <span class="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
              {{ rating.fromUser.nome.charAt(0) }}
            </span>
          </div>
          <div class="flex-1">
            <div class="flex items-center justify-between">
              <p class="font-semibold text-gray-900">{{ rating.fromUser.nome }}</p>
              <!-- Estrelas da avaliação -->
              <div class="flex items-center">
                <span v-for="i in 5" :key="i" class="text-yellow-400" :class="{ 'text-gray-300': i > rating.value }">★</span>
              </div>
            </div>
            <p class="text-gray-600 mt-1">{{ rating.comment }}</p>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { Rating } from '@/types/index';

defineProps<{
  ratings: Rating[];
  isLoading: boolean;
}>();
</script>