<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/services/api';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/composables/useToast';
import type { User, Item, Rating } from '@/types/index';
import ReportModal from '@/components/ReportModal.vue';
import StarRating from '@/components/StarRating.vue';

interface UserProfileData extends User {
  items: Item[];
  rating: {
    ratings: Rating[];
    average: number;
    count: number;
  };
}

const route = useRoute();
const router = useRouter();
const toast = useToast();
const authStore = useAuthStore();

const user = ref<UserProfileData | null>(null);
const loading = ref(true);
const showReportModal = ref(false);

const userId = computed(() => route.params.id);

const isMyOwnProfile = computed(() => {
  return authStore.isAuthenticated && authStore.user?.id === user.value?.id;
});

const fetchUserProfile = async () => {
  loading.value = true;
  try {
    // A rota /api/users/:id no backend já retorna o usuário com seus itens.
    const response = await api.get<UserProfileData>(`/api/users/${userId.value}`);
    user.value = response.data;
  } catch (error) {
    toast.error('Usuário não encontrado.');
    router.push('/');
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  // Se o usuário estiver tentando ver seu próprio perfil pela URL pública,
  // redireciona para a página de perfil privada para evitar confusão.
  if (authStore.isAuthenticated && Number(userId.value) === authStore.user?.id) {
    router.replace('/perfil');
    return;
  }
  fetchUserProfile();
});

const getImageUrl = (imageName: string) => {
  return imageName; // A URL completa já vem da API
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div v-if="loading" class="text-center py-20">
      <p>Carregando perfil...</p>
    </div>

    <div v-else-if="user" class="container mx-auto px-4">
      <!-- Card do Perfil -->
      <div class="bg-white rounded-2xl shadow-lg border p-8 mb-8 flex flex-col md:flex-row items-center gap-8">
        <div class="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
          <span class="text-white font-bold text-5xl">
            {{ user.nome.charAt(0).toUpperCase() }}
          </span>
        </div>
        <div class="flex-1 text-center md:text-left">
          <h1 class="text-3xl font-bold text-gray-900">{{ user.nome }}</h1>
          <p class="text-gray-600 mt-1">{{ user.email }}</p>
          <p class="text-sm text-gray-500 mt-2">Membro desde {{ formatDate(user.createdAt!) }}</p>

          <!-- Seção de Avaliação -->
          <div v-if="user.rating && user.rating.count > 0" class="mt-4 flex items-center justify-center md:justify-start gap-2">
            <StarRating :model-value="user.rating.average" :read-only="true" />
            <span class="font-bold text-gray-800">{{ user.rating.average.toFixed(1) }}</span>
            <span class="text-gray-500 text-sm">({{ user.rating.count }} {{ user.rating.count === 1 ? 'avaliação' : 'avaliações' }})</span>
          </div>
          <div v-else class="mt-4 text-gray-500 italic">
            Nenhuma avaliação ainda.
          </div>
        </div>
        <div v-if="!isMyOwnProfile && authStore.isAuthenticated">
          <button @click="showReportModal = true" class="btn btn-danger-outline">
            <span class="mr-2">🚨</span>
            Denunciar Usuário
          </button>
        </div>
      </div>

      <!-- Itens do Usuário -->
      <div>
        <h2 class="text-2xl font-bold text-gray-800 mb-6">Itens de {{ user.nome }}</h2>
        <div v-if="user.items && user.items.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <RouterLink
            v-for="item in user.items"
            :key="item.id"
            :to="`/items/${item.id}`"
            class="bg-white rounded-xl shadow-sm border overflow-hidden group hover:shadow-lg transition-shadow"
          > 
            <div class="aspect-square bg-gray-100">
              <img
                v-if="item.imagens && item.imagens.length > 0"
                :src="item.imagens[0].url"
                :alt="item.titulo"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div v-else class="w-full h-full flex items-center justify-center text-gray-300">
                <span>Sem imagem</span>
              </div>
            </div>
            <div class="p-4">
              <p class="text-sm text-gray-500">{{ item.categoria }}</p>
              <h3 class="font-bold text-gray-800 truncate mt-1">{{ item.titulo }}</h3>
            </div>
          </RouterLink>
        </div>
        <div v-else class="bg-white rounded-lg shadow-sm border p-12 text-center">
          <p class="text-gray-600">Este usuário ainda não cadastrou nenhum item.</p> 
        </div>
      </div>
    </div>

    <!-- Modal de Denúncia -->
    <ReportModal
      v-if="user"
      :show="showReportModal"
      :reported-user-id="user.id"
      :reported-user-name="user.nome"
      @close="showReportModal = false"
    />
  </div>
</template>

<style lang="postcss" scoped>
.btn-danger-outline {
  @apply px-4 py-2 border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors;
}
</style>
