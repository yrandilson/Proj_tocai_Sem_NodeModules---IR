<template>
  <RouterLink :to="`/items/${item.id}`" class="group block bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:border-primary-200 transition-all duration-300">
    <div class="relative">
      <div class="aspect-video bg-gray-100">
        <img
          :src="item.imagens?.[0]?.url || '/placeholder.png'"
          :alt="item.titulo"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <button
        @click.stop.prevent="toggleFavorite"
        class="absolute top-3 right-3 bg-white/70 backdrop-blur-sm rounded-full p-2 text-gray-500 hover:text-red-500 transition-colors z-10"
        aria-label="Adicionar aos favoritos"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          :fill="favoriteStore.isFavorited(item.id) ? 'currentColor' : 'none'"
          :class="{ 'text-red-500': favoriteStore.isFavorited(item.id) }"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.682l1.318-1.364a4.5 4.5 0 016.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
        </svg>
      </button>
      <div class="absolute bottom-0 left-0 bg-gradient-to-t from-black/60 to-transparent w-full h-1/2"></div>
    </div>
    <div class="p-4">
      <p class="text-sm text-gray-500 mb-1">{{ item.categoria }}</p>
      <h3 class="font-bold text-gray-800 truncate group-hover:text-primary-600 transition-colors">
        {{ item.titulo }}
      </h3>
      <div class="flex items-center justify-between mt-3 text-sm">
        <p class="text-gray-600">
          {{ item.cidade || 'Local não informado' }}
        </p>
        <span :class="['px-2 py-1 rounded-full text-xs font-medium border', getStatusColor(item.status)]">
          {{ getStatusLabel(item.status) }}
        </span>
      </div>
    </div>
  </RouterLink>
</template>

<script setup lang="ts">
import { useFavoriteStore } from '@/stores/favorite';
import type { Item } from '@/types/index';

const props = defineProps<{ item: Item }>();
const favoriteStore = useFavoriteStore();

function toggleFavorite() {
  if (favoriteStore.isFavorited(props.item.id)) {
    favoriteStore.removeFavorite(props.item.id);
  } else {
    favoriteStore.addFavorite(props.item);
  }
}

// Funções auxiliares para status (você pode movê-las para um composable)
const getStatusColor = (status: string) => ({ 'disponivel': 'bg-green-100 text-green-800 border-green-200', 'em_negociacao': 'bg-yellow-100 text-yellow-800 border-yellow-200', 'trocado': 'bg-gray-100 text-gray-800 border-gray-200' }[status] || '');
const getStatusLabel = (status: string) => ({ 'disponivel': 'Disponível', 'em_negociacao': 'Em Negociação', 'trocado': 'Trocado' }[status] || '');
</script>