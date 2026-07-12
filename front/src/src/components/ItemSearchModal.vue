<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 bg-black bg-opacity-50 z-[100] flex justify-center items-center p-4"
      @click.self="$emit('update:modelValue', false)"
    >
      <div class="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col">
        <!-- Header -->
        <header class="p-4 border-b flex justify-between items-center bg-gradient-to-r from-primary-50 to-primary-100">
          <div>
            <h2 class="text-xl font-bold text-gray-800">Adicionar Itens Desejados</h2>
            <p class="text-sm text-gray-600 mt-1">Busque itens existentes ou adicione novos para trocar</p>
          </div>
          <button @click="$emit('update:modelValue', false)" class="text-gray-500 hover:text-gray-800 transition-colors">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <!-- Search Input -->
        <div class="p-4 border-b bg-gray-50">
          <div class="relative">
            <input
              ref="searchInput"
              v-model="searchQuery"
              type="text"
              placeholder="Digite o nome do item desejado (ex: Teclado Mecânico, iPhone 13, etc.)"
              class="w-full p-3 pr-10 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
              @input="debouncedSearch"
              @keydown.enter="handleEnterKey"
            />
            <div class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <!-- Opção de adicionar texto livre -->
          <div v-if="canAddFreeText" class="mt-3 p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
            <div class="flex items-start space-x-3">
              <div class="flex-shrink-0 mt-1">
                <svg class="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div class="flex-grow">
                <p class="text-sm font-semibold text-blue-800">Item não encontrado?</p>
                <p class="text-xs text-blue-600 mt-1">Adicione "{{ searchQuery }}" como preferência mesmo que ainda não exista no sistema</p>
              </div>
              <button
                @click="addFreeTextPreference"
                class="flex-shrink-0 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
              >
                + Adicionar
              </button>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="flex border-b bg-gray-50">
          <button
            @click="activeTab = 'search'"
            :class="[
              'flex-1 px-4 py-3 font-semibold transition-colors',
              activeTab === 'search' 
                ? 'border-b-2 border-primary-600 text-primary-600 bg-white' 
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            ]"
          >
            🔍 Resultados da Busca
            <span v-if="searchResults.length > 0" class="ml-2 text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full">
              {{ searchResults.length }}
            </span>
          </button>
          <button
            @click="activeTab = 'categories'"
            :class="[
              'flex-1 px-4 py-3 font-semibold transition-colors',
              activeTab === 'categories' 
                ? 'border-b-2 border-primary-600 text-primary-600 bg-white' 
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            ]"
          >
            📂 Por Categoria
          </button>
          <button
            @click="activeTab = 'selected'"
            :class="[
              'flex-1 px-4 py-3 font-semibold transition-colors',
              activeTab === 'selected' 
                ? 'border-b-2 border-primary-600 text-primary-600 bg-white' 
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            ]"
          >
            ✓ Selecionados
            <span v-if="localSelection.length > 0" class="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              {{ localSelection.length }}
            </span>
          </button>
        </div>

        <!-- Content Area -->
        <main class="flex-grow overflow-y-auto p-4">
          <!-- Tab: Resultados da Busca -->
          <div v-if="activeTab === 'search'">
            <div v-if="!searchQuery" class="text-center py-12 text-gray-500">
              <svg class="h-16 w-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p class="font-semibold">Digite para buscar itens existentes</p>
              <p class="text-sm mt-2">Ou adicione um texto livre como preferência</p>
            </div>
            <div v-else-if="itemStore.loadingFetchItems" class="text-center py-12">
              <div class="animate-spin h-10 w-10 border-4 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
              <p class="mt-4 text-gray-600">Buscando itens...</p>
            </div>
            <div v-else-if="!searchResults.length" class="text-center py-12 text-gray-500">
              <svg class="h-16 w-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="font-semibold">Nenhum item encontrado</p>
              <p class="text-sm mt-2">Use o botão azul acima para adicionar como preferência</p>
            </div>
            <ul v-else class="grid grid-cols-1 gap-3">
              <li
                v-for="item in searchResults"
                :key="item.id"
                @click="toggleItemSelection(item)"
                :class="[
                  'p-3 border-2 rounded-lg flex items-center justify-between cursor-pointer transition-all hover:shadow-md',
                  isItemSelected(item.id) 
                    ? 'bg-primary-50 border-primary-500 shadow-sm' 
                    : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                ]"
              >
                <div class="flex items-center space-x-3 flex-grow">
                  <img 
                    :src="item.imagens?.[0]?.url || '/placeholder.png'" 
                    alt="" 
                    class="w-14 h-14 object-cover rounded-lg border-2 border-gray-200"
                  />
                  <div>
                    <p class="font-semibold text-gray-800">{{ item.titulo }}</p>
                    <p class="text-sm text-gray-500">{{ item.categoria }}</p>
                    <span class="inline-block mt-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                      Item existente
                    </span>
                  </div>
                </div>
                <div v-if="isItemSelected(item.id)" class="text-primary-600">
                  <svg class="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                </div>
              </li>
            </ul>
          </div>

          <!-- Tab: Por Categoria -->
          <div v-if="activeTab === 'categories'">
            <div v-if="loadingCategories" class="text-center py-12">
              <div class="animate-spin h-10 w-10 border-4 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
            </div>
            <div v-else>
              <div v-for="category in itemStore.categories" :key="category" class="mb-6">
                <button
                  @click="toggleCategory(category)"
                  class="w-full flex items-center justify-between p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <span class="font-semibold text-gray-800">{{ category }}</span>
                  <svg 
                    :class="['h-5 w-5 transition-transform', expandedCategories.includes(category) ? 'rotate-180' : '']"
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                <div v-if="expandedCategories.includes(category)" class="mt-2 space-y-2">
                  <div v-if="categoryItems[category]?.loading" class="text-center py-4 text-gray-500">
                    Carregando...
                  </div>
                  <div v-else-if="!categoryItems[category]?.items?.length" class="text-center py-4 text-gray-500">
                    Nenhum item nesta categoria
                  </div>
                  <ul v-else class="space-y-2">
                    <li
                      v-for="item in categoryItems[category].items"
                      :key="item.id"
                      @click="toggleItemSelection(item)"
                      :class="[
                        'p-3 border-2 rounded-lg flex items-center justify-between cursor-pointer transition-all',
                        isItemSelected(item.id) 
                          ? 'bg-primary-50 border-primary-500' 
                          : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                      ]"
                    >
                      <div class="flex items-center space-x-3">
                        <img 
                          :src="item.imagens?.[0]?.url || '/placeholder.png'" 
                          alt="" 
                          class="w-12 h-12 object-cover rounded-lg"
                        />
                        <div>
                          <p class="font-semibold">{{ item.titulo }}</p>
                          <p class="text-xs text-gray-500">{{ item.categoria }}</p>
                        </div>
                      </div>
                      <div v-if="isItemSelected(item.id)" class="text-primary-600">
                        <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- Tab: Selecionados -->
          <div v-if="activeTab === 'selected'">
            <div v-if="!localSelection.length" class="text-center py-12 text-gray-500">
              <svg class="h-16 w-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p class="font-semibold">Nenhum item selecionado</p>
              <p class="text-sm mt-2">Busque itens ou adicione preferências personalizadas</p>
            </div>
            <ul v-else class="space-y-2">
              <li
                v-for="(pref, index) in localSelection"
                :key="`${pref.id || pref.titulo}-${index}`"
                class="p-4 border-2 rounded-lg flex items-center justify-between bg-white hover:shadow-md transition-all"
                :class="pref.id ? 'border-primary-200' : 'border-blue-200'"
              >
                <div class="flex items-center space-x-3 flex-grow">
                  <img 
                    v-if="pref.id"
                    :src="pref.imagens?.[0]?.url || '/placeholder.png'" 
                    alt="" 
                    class="w-14 h-14 object-cover rounded-lg"
                  />
                  <div 
                    v-else 
                    class="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-white text-2xl font-bold"
                  >
                    ?
                  </div>
                  <div>
                    <p class="font-semibold text-gray-800">{{ pref.titulo }}</p>
                    <p v-if="pref.categoria" class="text-sm text-gray-500">{{ pref.categoria }}</p>
                    <span 
                      class="inline-block mt-1 text-xs px-2 py-0.5 rounded"
                      :class="pref.id 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-blue-100 text-blue-700'"
                    >
                      {{ pref.id ? 'Item existente' : 'Preferência personalizada' }}
                    </span>
                  </div>
                </div>
                <button
                  @click="removeSelection(index)"
                  class="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                >
                  <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </li>
            </ul>
          </div>
        </main>

        <!-- Footer -->
        <footer class="p-4 border-t bg-gray-50 flex justify-between items-center">
          <p class="text-sm text-gray-600">
            {{ localSelection.length }} {{ localSelection.length === 1 ? 'item selecionado' : 'itens selecionados' }}
          </p>
          <div class="flex space-x-3">
            <button
              @click="$emit('update:modelValue', false)"
              class="bg-gray-200 text-gray-700 font-semibold py-2 px-6 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              @click="confirmSelection"
              class="bg-primary-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              :disabled="localSelection.length === 0"
            >
              Confirmar Seleção
            </button>
          </div>
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, computed, nextTick } from 'vue';
import { useItemStore } from '@/stores/item';
import type { Item } from '@/types/index';
import { debounce } from 'lodash-es';

const props = defineProps<{
  modelValue: boolean;
  alreadySelected: Item[];
}>();

const emit = defineEmits(['update:modelValue', 'confirm']);

const itemStore = useItemStore();
const searchInput = ref<HTMLInputElement | null>(null);
const searchQuery = ref('');
const searchResults = ref<Item[]>([]);
const localSelection = ref<Item[]>([]);
const activeTab = ref<'search' | 'categories' | 'selected'>('search');
const expandedCategories = ref<string[]>([]);
const categoryItems = ref<Record<string, { items: Item[], loading: boolean }>>({});
const loadingCategories = ref(false);

// Computed: Verifica se pode adicionar texto livre
const canAddFreeText = computed(() => {
  return searchQuery.value.length >= 3 && 
         !searchResults.value.length && 
         !itemStore.loadingFetchItems &&
         !localSelection.value.some(item => item.titulo.toLowerCase() === searchQuery.value.toLowerCase());
});

// Watch: Reseta o modal quando abrir
watch(() => props.modelValue, async (isOpen) => {
  if (isOpen) {
    localSelection.value = [...props.alreadySelected];
    searchQuery.value = '';
    searchResults.value = [];
    activeTab.value = 'search';
    expandedCategories.value = [];
    
    // Carrega categorias
    if (itemStore.categories.length === 0) {
      loadingCategories.value = true;
      await itemStore.fetchCategories();
      loadingCategories.value = false;
    }
    
    // Foca no input de busca
    nextTick(() => {
      searchInput.value?.focus();
    });
  }
});

// Busca com debounce
const debouncedSearch = debounce(async () => {
  if (searchQuery.value.length < 2) {
    searchResults.value = [];
    return;
  }
  await itemStore.fetchItems({ search: searchQuery.value, limit: 20 });
  searchResults.value = itemStore.items;
}, 300);

// Adiciona preferência de texto livre
const addFreeTextPreference = () => {
  const trimmedQuery = searchQuery.value.trim();
  
  if (trimmedQuery.length < 3) {
    return;
  }
  
  // Verifica se já não foi adicionado
  const alreadyExists = localSelection.value.some(
    item => item.titulo.toLowerCase() === trimmedQuery.toLowerCase()
  );
  
  if (alreadyExists) {
    return;
  }
  
  // Adiciona como "item virtual" (sem ID)
  localSelection.value.push({
    titulo: trimmedQuery,
    // Outros campos não são necessários para preferências de texto livre
  } as Item);
  
  // Limpa a busca e muda para aba de selecionados
  searchQuery.value = '';
  searchResults.value = [];
  activeTab.value = 'selected';
};

// Manipula Enter no input
const handleEnterKey = () => {
  if (canAddFreeText.value) {
    addFreeTextPreference();
  }
};

// Verifica se um item está selecionado (por ID)
const isItemSelected = (itemId: number) => {
  return localSelection.value.some(item => item.id === itemId);
};

// Toggle seleção de item existente
const toggleItemSelection = (item: Item) => {
  if (isItemSelected(item.id)) {
    localSelection.value = localSelection.value.filter(i => i.id !== item.id);
  } else {
    localSelection.value.push(item);
  }
};

// Remove item da seleção
const removeSelection = (index: number) => {
  localSelection.value.splice(index, 1);
};

// Toggle categoria
const toggleCategory = async (category: string) => {
  if (expandedCategories.value.includes(category)) {
    expandedCategories.value = expandedCategories.value.filter(c => c !== category);
  } else {
    expandedCategories.value.push(category);
    
    // Carrega itens da categoria se ainda não carregou
    if (!categoryItems.value[category]) {
      categoryItems.value[category] = { items: [], loading: true };
      await itemStore.fetchItems({ category, limit: 50 });
      categoryItems.value[category] = { items: itemStore.items, loading: false };
    }
  }
};

// Confirma seleção
const confirmSelection = () => {
  emit('confirm', localSelection.value);
  emit('update:modelValue', false);
};
</script>