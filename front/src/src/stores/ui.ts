import { defineStore } from 'pinia';
import { ref } from 'vue';

/**
 * Store para gerenciar o estado global da interface do usuário (UI).
 */
export const useUiStore = defineStore('ui', () => {
  const isLoading = ref(false);
  // Usamos um contador para lidar com múltiplas requisições simultâneas.
  // O spinner só some quando a última requisição terminar.
  let loadingCount = 0;

  /**
   * Incrementa o contador e ativa o estado de carregamento.
   */
  const startLoading = () => {
    loadingCount++;
    if (!isLoading.value) {
      isLoading.value = true;
    }
  };

  /**
   * Decrementa o contador e desativa o estado de carregamento se não houver mais requisições ativas.
   */
  const stopLoading = () => {
    loadingCount--;
    if (loadingCount <= 0) {
      loadingCount = 0; // Garante que não fique negativo
      isLoading.value = false;
    }
  };

  return { isLoading, startLoading, stopLoading };
});