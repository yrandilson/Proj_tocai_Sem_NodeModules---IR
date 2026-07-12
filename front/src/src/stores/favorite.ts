import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '@/services/api';
import { useToast } from '@/composables/useToast';
import type { Item } from '@/types/index';

export const useFavoriteStore = defineStore('favorite', () => {
  const favorites = ref<Item[]>([]);
  const favoriteIds = ref<Set<number>>(new Set());
  const loading = ref(false);
  const toast = useToast();

  async function fetchFavorites() {
    loading.value = true;
    try {
      const { data } = await api.get<Item[]>('/api/favorites');
      favorites.value = data;
      favoriteIds.value = new Set(data.map(item => item.id));
    } catch (error) {
      console.error('Erro ao buscar favoritos:', error);
      toast.error('Não foi possível carregar seus favoritos.');
    } finally {
      loading.value = false;
    }
  }

  async function addFavorite(item: Item) {
    if (favoriteIds.value.has(item.id)) return;

    favorites.value.unshift(item); // Adiciona no início para feedback visual rápido
    favoriteIds.value.add(item.id);

    try {
      await api.post(`/api/favorites/${item.id}`);
    } catch (error) {
      // Reverte em caso de erro
      favorites.value = favorites.value.filter(fav => fav.id !== item.id);
      favoriteIds.value.delete(item.id);
      toast.error('Erro ao adicionar aos favoritos.');
    }
  }

  async function removeFavorite(itemId: number) {
    if (!favoriteIds.value.has(itemId)) return;

    const originalFavorites = [...favorites.value];
    favorites.value = favorites.value.filter(fav => fav.id !== itemId);
    favoriteIds.value.delete(itemId);

    try {
      await api.delete(`/api/favorites/${itemId}`);
    } catch (error) {
      favorites.value = originalFavorites; // Reverte
      favoriteIds.value.add(itemId);
      toast.error('Erro ao remover dos favoritos.');
    }
  }

  function isFavorited(itemId: number): boolean {
    return favoriteIds.value.has(itemId);
  }

  return { favorites, loading, fetchFavorites, addFavorite, removeFavorite, isFavorited };
});