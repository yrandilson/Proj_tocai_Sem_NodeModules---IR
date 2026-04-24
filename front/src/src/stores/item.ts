import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/services/api';
import { type Item, type ItemStatus, type PaginatedResponse, type ItemSearchParams } from '@/types/index';

export const useItemStore = defineStore('item', () => {
  // Estado
  const items = ref<Item[]>([]); // Para todos os itens (ex: home, busca)
  const myItems = ref<Item[]>([]); // Para itens do usuário logado
  const currentItem = ref<Item | null>(null); // Para detalhes de um item específico
  const categories = ref<string[]>([]); // Para a lista de categorias
  const error = ref<string | null>(null);

  // Estados de carregamento granulares
  const loadingFetchItems = ref(false); // Para buscar listas de itens
  const loadingFetchMyItems = ref(false); // Para buscar os itens do usuário
  const loadingFetchItemDetails = ref(false); // Para buscar detalhes de um item
  const loadingAction = ref(false); // Para criar, atualizar, deletar itens
  const loadingCategories = ref(false);

  /**
   * Busca todos os itens disponíveis (com filtros, se houver)
   */
  const fetchItems = async (params?: ItemSearchParams) => {
    loadingFetchItems.value = true;
    error.value = null;
    try {
      // A API retorna uma resposta paginada, então usamos o tipo PaginatedResponse<Item>.
      const response = await api.get<PaginatedResponse<Item>>('/api/items', { params });
      // Atribuímos apenas a propriedade 'data' da resposta, que contém o array de itens.
      items.value = response.data.data;
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Erro ao buscar itens';
      items.value = [];
    } finally {
      loadingFetchItems.value = false;
    }
  };

  /**
   * Busca os itens pertencentes ao usuário autenticado
   */
  const fetchMyItems = async () => {
    loadingFetchMyItems.value = true;
    error.value = null;
    try {
      const response = await api.get<Item[]>('/api/items/my');
      myItems.value = response.data;
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Erro ao buscar meus itens';
      myItems.value = [];
    } finally {
      loadingFetchMyItems.value = false;
    }
  };

  /**
   * Busca os detalhes de um item específico
   */
  const fetchItemDetails = async (id: number) => {
    loadingFetchItemDetails.value = true;
    error.value = null;
    try {
      const response = await api.get<Item>(`/api/items/${id}`);
      currentItem.value = response.data;
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Erro ao buscar detalhes do item';
      currentItem.value = null;
      throw err;
    } finally {
      loadingFetchItemDetails.value = false;
    }
  };

  /**
   * Busca todas as categorias de itens disponíveis.
   */
  const fetchCategories = async () => {
    loadingCategories.value = true;
    const defaultCategories = [
      'Eletrônicos',
      'Jogos e Consoles',
      'Livros e Revistas',
      'Roupas e Acessórios',
      'Móveis e Decoração',
      'Esportes e Lazer',
      'Instrumentos Musicais',
      'Brinquedos e Hobbies',
      'Ferramentas',
      'Veículos e Peças',
      'Outros'
    ];

    try {
      const response = await api.get<string[]>('/api/items/categories');
      const fetchedCategories = response.data || [];
      // Combina as categorias padrão com as buscadas, sem duplicatas, e ordena.
      const combined = [...new Set([...defaultCategories, ...fetchedCategories])].sort();
      categories.value = combined;
      return combined;
    } catch (err: any) {
      console.error('Erro ao buscar categorias:', err);
      categories.value = defaultCategories.sort(); // Em caso de erro, usa a lista padrão.
      return defaultCategories;
    } finally {
      loadingCategories.value = false;
    }
  };

  /**
   * Cria um novo item
   */
  const createItem = async (itemData: Partial<Item>, files: File[], preferredItemTitles: string[] = []) => { // NOSONAR
  loadingAction.value = true;
  error.value = null;
  
  try {
    const formData = new FormData();
    for (const key in itemData) {
      // Garante que a chave existe no objeto antes de tentar acessá-la
      if (Object.prototype.hasOwnProperty.call(itemData, key)) {
        const value = (itemData as any)[key];
        if (value !== null && value !== undefined) {
          formData.append(key, String(value));
        }
      }
    }
    
    files.forEach(file => formData.append('imagens', file));
    
    preferredItemTitles.forEach(title => formData.append('preferredItemTitles[]', title));

    const response = await api.post<Item>('/api/items', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    myItems.value.unshift(response.data);
    return response.data;
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Erro ao criar item'; // NOSONAR
    throw err;
  } finally {
    loadingAction.value = false;
  }
};

  /**
   * Atualiza um item existente
   */
  const updateItem = async (id: number, itemData: Partial<Item>, files: File[], preferredItemTitles: string[] = []) => {
    loadingAction.value = true;
    error.value = null;
    try {
      const formData = new FormData();
      for (const key in itemData) {
        if (Object.prototype.hasOwnProperty.call(itemData, key)) {
          const value = (itemData as any)[key];
          if (value !== null && value !== undefined) {
            formData.append(key, String(value));
          }
        }
      }

      // Adiciona novas imagens
      files.forEach(file => formData.append('imagens', file));
      // Adiciona os títulos das preferências
      preferredItemTitles.forEach(title => formData.append('preferredItemTitles[]', title));

      const response = await api.put<Item>(`/api/items/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      // Atualiza nas listas
      const indexMy = myItems.value.findIndex(item => item.id === id);
      if (indexMy !== -1) myItems.value[indexMy] = response.data;
      const indexAll = items.value.findIndex(item => item.id === id);
      if (indexAll !== -1) items.value[indexAll] = response.data;
      if (currentItem.value?.id === id) currentItem.value = response.data;
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Erro ao atualizar item';
      throw err;
    } finally {
      loadingAction.value = false;
    }
  };

  /**
   * Deleta um item
   */
  const deleteItem = async (id: number) => {
    loadingAction.value = true;
    error.value = null;
    try {
      await api.delete(`/api/items/${id}`);
      myItems.value = myItems.value.filter(item => item.id !== id);
      items.value = items.value.filter(item => item.id !== id);
      if (currentItem.value?.id === id) currentItem.value = null;
      return true;
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Erro ao deletar item';
      throw err;
    } finally {
      loadingAction.value = false;
    }
  };

  return {
    // State
    items,
    myItems,
    currentItem,
    categories,
    error,
    loadingFetchItems,
    loadingFetchMyItems,
    loadingFetchItemDetails,
    loadingAction,
    // Actions
    fetchItems,
    fetchCategories,
    fetchMyItems,
    fetchItemDetails,
    createItem,
    updateItem,
    deleteItem,
  };
});