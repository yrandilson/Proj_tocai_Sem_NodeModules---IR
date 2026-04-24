<template>
  <div>
    <header>
      <nav>
        <a href="#" class="logo">Trocaí</a>
        <router-link to="/register" class="btn btn-primary">Cadastrar</router-link>
      </nav>
    </header>

    <div class="container">
      <div class="page-header">
        <h1 class="page-title">Itens Próximos</h1>
        <p class="page-subtitle">Encontre itens disponíveis na sua região</p>
      </div>

      <div class="map-layout">
        <div class="map-container">
          <div class="map-wrapper">
            <ItemsMap
              :items="mapItems"
              :userLocation="userLocation"
              :radius="radius"
              :selectedItem="selectedItem"
              @item-click="onItemClick"
            />
          </div>
        </div>

        <div class="sidebar">
          <div class="search-box">
            <div class="search-input-wrapper">
              <span class="search-icon">🔍</span>
              <input v-model="query" type="text" class="search-input" placeholder="Buscar itens...">
            </div>
            <div class="filters">
              <button v-for="f in filters" :key="f" :class="['filter-chip', { active: f === activeFilter }]" @click="() => setFilter(f)">{{ f }}</button>
            </div>
          </div>

          <div class="results-container">
            <div class="results-header">
              <h2 class="results-title">Itens Encontrados</h2>
              <span class="results-count">{{ filteredItems.length }} itens encontrados</span>
            </div>

            <div v-if="filteredItems.length === 0" class="empty-state">
              <div class="empty-icon">📦</div>
              <h3>Nenhum item encontrado</h3>
              <p>Tente aumentar o raio de busca ou alterar os filtros.</p>
            </div>

            <ul v-else class="result-list">
              <li v-for="it in filteredItems" :key="it.id" class="result-item" @click="onItemClick(it)">
                <div class="result-title">{{ it.titulo }}</div>
                <div class="result-sub">{{ it.categoria }} • {{ formatDistance(it.distancia) }}</div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import ItemsMap from '@/components/ItemsMap.vue';
import { useItemStore } from '@/stores/item';
import type { Item } from '@/types/index';

const router = useRouter();
const itemStore = useItemStore();

const userLocation = ref<{ lat: number; lng: number } | null>(null);
const selectedItem = ref<any | null>(null);
const radius = ref(50); // km
const query = ref('');
const filters = ['Todos', 'Trocas', 'Doações', 'Livros', 'Eletrônicos'];
const activeFilter = ref('Todos');

const computeDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const toRad = (v: number) => v * Math.PI / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const mapItems = computed(() => {
  return itemStore.items.map((it) => ({
    ...it,
    distancia: computeDistance(userLocation.value?.lat ?? 0, userLocation.value?.lng ?? 0, Number((it as any).latitude) || 0, Number((it as any).longitude) || 0),
  }));
});

const filteredItems = computed(() => {
  const q = query.value.trim().toLowerCase();
  return mapItems.value.filter((it: any) => {
    if (activeFilter.value !== 'Todos' && it.categoria !== activeFilter.value) return false;
    if (!q) return true;
    return (it.titulo || '').toLowerCase().includes(q) || (it.descricao || '').toLowerCase().includes(q);
  });
});

const formatDistance = (d: number) => (d && d > 0 ? `${d.toFixed(1)} km` : '—');

const onItemClick = (item: any) => {
  selectedItem.value = item;
  router.push({ path: `/items/${item.id}` });
};

const setFilter = (f: string) => {
  activeFilter.value = f;
};

onMounted(async () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        userLocation.value = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      },
      () => {
        userLocation.value = null;
      }
    );
  }

  try {
    await itemStore.fetchItems({ status: 'disponivel', limit: 500 });
  } catch (e) {
    console.error('Erro ao carregar itens para o mapa', e);
  }
});
</script>
<style scoped>
header {
  background: linear-gradient(135deg, #2ecc71 0%, #9b59b6 50%, #3498db 100%);
  padding: 1.2rem 5%;
  box-shadow: 0 2px 30px rgba(155, 89, 182, 0.3);
}
.container {
  max-width: 1600px;
  margin: 2rem auto;
  padding: 0 2rem;
}
.page-header {
  margin-bottom: 1rem;
}
.map-layout {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 1.5rem;
  height: calc(100vh - 200px);
  min-height: 520px;
}
.map-container {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(155, 89, 182, 0.08);
  overflow: hidden;
  position: relative;
}
.map-wrapper {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #e3f2fd 0%, #e8f5e9 50%, #f3e5f5 100%);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.results-container {
  background: #fff;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 5px 20px rgba(155, 89, 182, 0.06);
  flex: 1;
  overflow-y: auto;
}
.filter-chip {
  padding: 6px 12px;
  border-radius: 999px;
  cursor: pointer;
  border: 1px solid rgba(0, 0, 0, 0.04);
}
.filter-chip.active {
  background: #6c5ce7;
  color: #fff;
  border-color: transparent;
}
.result-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.result-item {
  padding: 12px;
  border-bottom: 1px solid #f2f2f2;
  cursor: pointer;
}
.result-item:hover {
  background: #fafafa;
}
.result-title {
  font-weight: 600;
}
.result-sub {
  font-size: 13px;
  color: #666;
}
</style>
