<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useItemStore } from '@/stores/item';
import type { Item } from '@/types/index';
import { MapPin, Package, Navigation, Filter } from 'lucide-vue-next';
import ItemsMap from '@/components/ItemsMap.vue';

const itemStore = useItemStore();
const route = useRoute();
const router = useRouter();

const selectedItem = ref<Item | null>(null); // Certifique-se que Item tem lat/lng
const userLocation = ref<{ lat: number; lng: number } | null>(null);
const mapCenter = ref<{ lat: number; lng: number } | null>(null);
const searchRadius = ref(50); // Aumentado para uma melhor experiência inicial
const categoryFilter = ref(route.query.category as string || '');
const searchQuery = ref(route.query.search as string || '');
const categories = ref<string[]>([]);

const getUserLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
        userLocation.value = loc;
        mapCenter.value = loc; // Define o centro inicial do mapa
      },
      () => {
        const defaultLoc = { lat: -23.5505, lng: -46.6333 }; // São Paulo como padrão
        userLocation.value = defaultLoc;
        mapCenter.value = defaultLoc;
      }
    );
  } else {
    const defaultLoc = { lat: -23.5505, lng: -46.6333 };
    userLocation.value = defaultLoc;
    mapCenter.value = defaultLoc;
  }
};

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

onMounted(async () => {
  getUserLocation();
  // A busca inicial agora considera os filtros da URL
  await itemStore.fetchItems({ 
    status: 'disponivel', 
    limit: 500,
    search: searchQuery.value,
    category: categoryFilter.value
  });
  // categories.value = await itemStore.fetchCategories(); // Esta função não existe na store, vamos remover por enquanto.
});

// Observa mudanças nos filtros e atualiza a URL
watch([searchQuery, categoryFilter], () => {
  router.replace({ query: { search: searchQuery.value, category: categoryFilter.value } });
});

const filteredItems = computed(() => {
  if (!userLocation.value) return [];
  return itemStore.items
    .map(item => ({
      ...item,
      distancia: calculateDistance(userLocation.value!.lat, userLocation.value!.lng, Number(item.latitude || 0), Number(item.longitude || 0)),
    }))
    .filter(item => {
      if (item.latitude == null || item.longitude == null) return false;
      // Filtros agora são aplicados no backend, mas mantemos no frontend para reatividade
      if (categoryFilter.value && item.categoria !== categoryFilter.value) return false;
      if (searchQuery.value && !item.titulo.toLowerCase().includes(searchQuery.value.toLowerCase())) return false;

      if (item.distancia > searchRadius.value) return false;
      return true;
    })
    .sort((a, b) => a.distancia - b.distancia);
});

watch(filteredItems, (newItems) => {
    if (newItems.length > 0) {
        selectedItem.value = newItems[0];
    } else {
        selectedItem.value = null;
    }
});

// Observa o item selecionado e atualiza o centro do mapa
watch(selectedItem, (newItem) => {
  if (newItem && newItem.latitude && newItem.longitude) {
    // Atualiza o centro do mapa para as coordenadas do item selecionado
    mapCenter.value = { lat: newItem.latitude, lng: newItem.longitude };
  }
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-4 sm:p-8">
    <div class="max-w-7xl mx-auto">
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">🗺️ Itens Próximos</h1>
        <p class="text-gray-600">Encontre itens disponíveis na sua região</p>
      </div>

      <div class="card mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Buscar por nome</label>
            <input v-model="searchQuery" type="text" placeholder="Ex: Cadeira de escritório" class="input w-full" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
            <select v-model="categoryFilter" class="input w-full">
              <option value="">Todas</option>
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Raio de busca: {{ searchRadius }} km</label>
            <input v-model.number="searchRadius" type="range" min="1" max="200" class="w-full" />
          </div>
        </div>
      </div>

      <div v-if="itemStore.loadingFetchItems" class="text-center py-16">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p class="mt-4 text-gray-600">Carregando itens no mapa...</p>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ItemsMap 
          :items="filteredItems"
          :user-location="userLocation"
          :map-center="mapCenter"
          :radius="searchRadius"
          :selected-item="selectedItem as any"
          @item-click="(item) => selectedItem = item"
        />

        <div class="space-y-4">
          <div class="card">
            <h2 class="text-xl font-bold text-gray-900 mb-1">Itens Encontrados</h2>
            <p class="text-sm text-gray-600">{{ filteredItems.length }} {{ filteredItems.length === 1 ? 'item encontrado' : 'itens encontrados' }}</p>
          </div>
          <div class="space-y-3 max-h-[520px] overflow-y-auto pr-2">
            <template v-if="filteredItems.length > 0">
              <div v-for="item in filteredItems" :key="item.id" @click="selectedItem = item"
                   :class="['card cursor-pointer transition-all border-2', selectedItem?.id === item.id ? 'border-primary-500 bg-primary-50' : 'border-transparent hover:border-primary-300']">
                <div class="flex items-start justify-between">
                  <div class="flex items-start space-x-3">
                    <div class="w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0"><Package class="w-6 h-6 text-white" /></div>
                    <div>
                      <h3 class="font-bold text-gray-900 mb-1">{{ item.titulo }}</h3>
                      <p class="text-sm text-gray-600">{{ item.categoria }}</p>
                    </div>
                  </div>
                  <span class="badge badge-disponivel">{{ item.distancia.toFixed(1) }} km</span>
                </div>
                <div v-if="item.cidade || item.estado" class="flex items-center text-sm text-gray-600 mt-2"><MapPin class="w-4 h-4 mr-1" /><span>{{ item.cidade }}, {{ item.estado }}</span></div>
                <RouterLink v-if="selectedItem?.id === item.id" :to="`/items/${item.id}`" class="btn btn-primary w-full mt-4 text-center">Ver Detalhes</RouterLink>
              </div>
            </template>
            <div v-else class="card text-center p-8">
              <h3 class="text-lg font-semibold text-gray-900 mb-2">Nenhum item encontrado</h3>
              <p class="text-gray-600 text-sm">Tente aumentar o raio de busca ou alterar os filtros.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
