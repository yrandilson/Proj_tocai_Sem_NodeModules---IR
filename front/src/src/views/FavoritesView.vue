<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Título da Página -->
    <h1 class="text-3xl font-bold text-gray-800 mb-6">Meus Favoritos</h1>

    <div v-if="favoriteStore.loading" class="text-center py-10">
      <p>Carregando seus itens favoritos...</p>
    </div>

    <div v-else-if="favoriteStore.favorites.length === 0" class="text-center py-20 bg-gray-50 rounded-lg">
      <p class="text-xl text-gray-600">Você ainda não favoritou nenhum item.</p>
      <p class="text-gray-500 mt-2">Clique no coração ❤️ nos itens que você gostar!</p>
      <router-link to="/mapa" class="mt-6 inline-block bg-primary-600 text-white font-bold py-2 px-4 rounded hover:bg-primary-700 transition-colors">
        Explorar Itens
      </router-link>
    </div>

    <!-- Grid de Itens Favoritados -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <ItemCard
        v-for="item in favoriteStore.favorites"
        :key="item.id"
        :item="item"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useFavoriteStore } from '@/stores/favorite';
import ItemCard from '@/components/ItemCard.vue'; // Corrigido: Importa o componente ItemCard

const favoriteStore = useFavoriteStore();

onMounted(() => {
  favoriteStore.fetchFavorites();
});
</script>