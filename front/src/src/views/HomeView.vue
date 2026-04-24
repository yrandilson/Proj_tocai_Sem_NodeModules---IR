<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useItemStore } from '@/stores/item';
import ItemCard from '@/components/ItemCard.vue';
import ItemCardSkeleton from '@/components/ItemCardSkeleton.vue';

const itemStore = useItemStore();
const searchQuery = ref('');
const selectedCategory = ref('');
const categories = ref<string[]>([]);
// Filtro de Localização (P1)
const userLatitude = ref(-23.5505); // Latitude padrão (São Paulo)
const userLongitude = ref(-46.6333); // Longitude padrão (São Paulo)
const searchRadius = ref(20); // Raio de busca padrão em km

onMounted(async () => {
  // Tenta obter a localização real do usuário
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        userLatitude.value = position.coords.latitude;
        userLongitude.value = position.coords.longitude;
        console.log(`Localização obtida: ${userLatitude.value}, ${userLongitude.value}`);
      },
      (error) => {
        console.warn(`Erro ao obter localização: ${error.message}. Usando padrão.`);
      }
    );
  }

  await itemStore.fetchItems({ status: 'disponivel', limit: 6 }); // Carregar apenas 6 itens recentes
  categories.value = await itemStore.fetchCategories();
});

const handleSearch = async () => {
  const params: any = {
    search: searchQuery.value || undefined,
    category: selectedCategory.value || undefined,
    status: 'disponivel'
  };

  // Adiciona filtros de localização se o raio for definido
  if (searchRadius.value > 0) {
    params.latitude = userLatitude.value;
    params.longitude = userLongitude.value;
    params.raio = searchRadius.value;
  }

  await itemStore.fetchItems(params);
};
</script>

<template>
  <div class="landing-shell">
    <section class="hero-wrap relative overflow-hidden text-white">
      <div class="hero-orb hero-orb-1" />
      <div class="hero-orb hero-orb-2" />
      <div class="hero-grid" />

      <div class="container mx-auto px-4 pt-24 pb-20 relative z-10">
        <div class="max-w-4xl mx-auto text-center">
          <span class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 border border-white/40 text-sm tracking-wide mb-6">
            Economia circular na prática
          </span>

          <h1 class="text-4xl md:text-6xl font-black leading-tight mb-5">
            Troque melhor.
            <span class="block hero-highlight-text">Desperdice menos.</span>
          </h1>

          <p class="text-lg md:text-xl text-white/90 max-w-3xl mx-auto mb-9">
            Encontre pessoas próximas para trocar ou doar itens com segurança. Sua casa fica mais leve e a comunidade ganha junto.
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto mb-8">
            <div class="hero-metric">
              <p class="hero-metric-value">{{ itemStore.items.length }}</p>
              <p class="hero-metric-label">Itens em destaque</p>
            </div>
            <div class="hero-metric">
              <p class="hero-metric-value">{{ categories.length }}</p>
              <p class="hero-metric-label">Categorias ativas</p>
            </div>
            <div class="hero-metric">
              <p class="hero-metric-value">24h</p>
              <p class="hero-metric-label">Atualizações constantes</p>
            </div>
          </div>

          <div class="max-w-4xl mx-auto bg-white/15 backdrop-blur-xl p-5 rounded-2xl shadow-2xl border border-white/30">
            <form @submit.prevent="handleSearch" class="grid grid-cols-1 gap-3">
              <div class="grid grid-cols-1 lg:grid-cols-12 gap-3">
                <input v-model="searchQuery" type="text" placeholder="Buscar por título..." class="input lg:col-span-5" />
                <select v-model="selectedCategory" class="input lg:col-span-3">
                  <option value="">Todas as categorias</option>
                  <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
                </select>
                <button type="submit" class="btn btn-primary lg:col-span-2">Buscar</button>
                <router-link to="/mapa" class="btn btn-secondary lg:col-span-2 text-center">Mapa</router-link>
              </div>

              <div class="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 text-left">
                <label for="radius" class="text-white/90 text-sm">Raio (km)</label>
                <input
                  id="radius"
                  v-model.number="searchRadius"
                  type="number"
                  min="0"
                  max="1000"
                  class="input w-28 text-center"
                />
                <span class="text-xs text-white/80">
                  Localização atual: {{ userLatitude.toFixed(4) }}, {{ userLongitude.toFixed(4) }}
                </span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>

    <section class="py-16 md:py-20 bg-white">
      <div class="container mx-auto px-4">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-extrabold text-slate-900">Por que escolher o TrocaAi?</h2>
          <p class="text-slate-600 mt-3 max-w-2xl mx-auto">Mais do que um marketplace, uma rede para circular valor com inteligência.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          <article class="feature-tile">
            <span class="feature-icon">🤝</span>
            <h3>Trocas inteligentes</h3>
            <p>Conexões entre pessoas com interesses reais de troca.</p>
          </article>
          <article class="feature-tile">
            <span class="feature-icon">💚</span>
            <h3>Doação com propósito</h3>
            <p>Itens parados ganham novo uso e impacto positivo.</p>
          </article>
          <article class="feature-tile">
            <span class="feature-icon">🛡️</span>
            <h3>Mais segurança</h3>
            <p>Fluxo com autenticação, reputação e moderação ativa.</p>
          </article>
          <article class="feature-tile">
            <span class="feature-icon">⚡</span>
            <h3>Rápido e prático</h3>
            <p>Publicar, conversar e fechar troca em poucos passos.</p>
          </article>
        </div>
      </div>
    </section>

    <section class="py-16 md:py-20 bg-slate-50">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl md:text-4xl font-extrabold text-center text-slate-900 mb-12">Como funciona</h2>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div class="step-card">
            <div class="step-badge">1</div>
            <h3>Cadastre-se</h3>
            <p>Crie seu perfil e informe o que você quer trocar ou doar.</p>
          </div>
          <div class="step-card">
            <div class="step-badge">2</div>
            <h3>Publique itens</h3>
            <p>Adicione fotos e descrições para atrair propostas relevantes.</p>
          </div>
          <div class="step-card">
            <div class="step-badge">3</div>
            <h3>Converse e finalize</h3>
            <p>Negocie no chat e combine uma troca segura e justa.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="py-16 md:py-20">
      <div class="container mx-auto px-4">
        <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-8">
          <div>
            <h2 class="text-3xl md:text-4xl font-extrabold text-slate-900">Itens recentes</h2>
            <p class="text-slate-600 mt-2">Descubra oportunidades novas de troca na sua região.</p>
          </div>
        </div>

        <div v-if="itemStore.loadingFetchItems" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ItemCardSkeleton v-for="n in 6" :key="n" />
        </div>

        <div v-else-if="itemStore.items.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ItemCard v-for="item in itemStore.items" :key="item.id" :item="item" />
        </div>

        <div v-else class="empty-callout">
          <p class="text-lg font-semibold text-slate-700">Ainda não há itens disponíveis.</p>
          <p class="text-slate-500">Seja a primeira pessoa a movimentar a comunidade.</p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.landing-shell {
  background: linear-gradient(180deg, #f8fafc 0%, #f2f6fb 30%, #ffffff 100%);
}

.hero-wrap {
  background: linear-gradient(130deg, #0b3b7a 0%, #0f766e 55%, #65a30d 100%);
}

.hero-grid {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px);
  background-size: 36px 36px;
  opacity: 0.28;
}

.hero-orb {
  position: absolute;
  border-radius: 9999px;
  filter: blur(8px);
  opacity: 0.35;
}

.hero-orb-1 {
  width: 420px;
  height: 420px;
  top: -120px;
  left: -120px;
  background: radial-gradient(circle at 30% 30%, #22d3ee, #0369a1);
  animation: floaty 9s ease-in-out infinite;
}

.hero-orb-2 {
  width: 360px;
  height: 360px;
  right: -80px;
  bottom: -120px;
  background: radial-gradient(circle at 30% 30%, #84cc16, #15803d);
  animation: floaty 10s ease-in-out infinite reverse;
}

.hero-highlight-text {
  color: #e2f7cc;
  text-shadow: 0 10px 35px rgba(0, 0, 0, 0.25);
}

.hero-metric {
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 14px;
  padding: 0.9rem;
}

.hero-metric-value {
  font-size: 1.6rem;
  font-weight: 800;
  line-height: 1;
}

.hero-metric-label {
  font-size: 0.78rem;
  margin-top: 0.25rem;
  opacity: 0.92;
}

.feature-tile {
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  background: linear-gradient(160deg, #ffffff 0%, #f8fafc 100%);
  padding: 1.2rem;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.feature-tile:hover {
  transform: translateY(-4px);
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.12);
}

.feature-icon {
  font-size: 1.8rem;
}

.feature-tile h3 {
  margin-top: 0.8rem;
  font-size: 1.05rem;
  font-weight: 800;
  color: #0f172a;
}

.feature-tile p {
  margin-top: 0.5rem;
  color: #475569;
  line-height: 1.55;
}

.step-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 1.25rem;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
}

.step-badge {
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 9999px;
  display: grid;
  place-items: center;
  font-weight: 700;
  color: #ffffff;
  background: linear-gradient(135deg, #0ea5e9 0%, #22c55e 100%);
  margin-bottom: 0.7rem;
}

.step-card h3 {
  font-weight: 800;
  color: #0f172a;
}

.step-card p {
  margin-top: 0.5rem;
  color: #475569;
  line-height: 1.55;
}

.empty-callout {
  text-align: center;
  border: 1px dashed #cbd5e1;
  border-radius: 18px;
  background: #f8fafc;
  padding: 2rem;
}

@keyframes floaty {
  0%,
  100% {
    transform: translateY(0px) translateX(0px);
  }
  50% {
    transform: translateY(-14px) translateX(8px);
  }
}
</style>
