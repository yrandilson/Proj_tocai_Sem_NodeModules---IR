<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/composables/useToast';
import api from '@/services/api';
import { type Item } from '@/types/index';
import PreferredTitleCard from '@/components/PreferredTitleCard.vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

const item = ref<Item | null>(null);
const loading = ref(true);
const showProposalModal = ref(false);
const proposalMessage = ref('');
const selectedImageIndex = ref(0);
const showImageGallery = ref(false);

onMounted(async () => {
  await loadItem();
});

const loadItem = async () => {
  loading.value = true;
  try {
    const response = await api.get<Item>(`/api/items/${route.params.id}`);
    item.value = response.data;
  } catch (error: any) {
    console.error('Erro ao carregar item:', error);
    toast.error('Erro ao carregar item');
    router.push('/items');
  } finally {
    loading.value = false;
  }
};

const isOwner = computed(() => {
  return item.value && authStore.user && item.value.owner && item.value.owner.id === authStore.user.id;
});

const canPropose = computed(() => {
  return item.value && authStore.isAuthenticated && !isOwner.value && item.value.status === 'disponivel';
});

const getImageUrl = (image: { url: string }) => {
  // A API agora retorna a URL completa ou um caminho relativo que precisa ser prefixado
  return image.url.startsWith('http') ? image.url : `${import.meta.env.VITE_API_URL}${image.url}`;
};

const formatDate = (date: string) => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Data não disponível';
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
};

const getStatusColor = (status: string) => {
  const colors = {
    disponivel: 'bg-green-100 text-green-800 border-green-200',
    em_negociacao: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    trocado: 'bg-gray-100 text-gray-800 border-gray-200'
  };
  return colors[status as keyof typeof colors] || colors.disponivel;
};

const getStatusLabel = (status: string) => {
  const labels = {
    disponivel: 'Disponível',
    em_negociacao: 'Em Negociação',
    trocado: 'Trocado'
  };
  return labels[status as keyof typeof labels] || 'Disponível';
};

const openProposalModal = () => {
  if (!authStore.isAuthenticated) {
    toast.error('Você precisa estar logado para fazer propostas');
    router.push('/login');
    return;
  }
  showProposalModal.value = true;
};

const submitProposal = async () => {
  // Validação da mensagem
  const message = proposalMessage.value.trim();
  
  if (!message) {
    toast.error('Por favor, escreva uma mensagem');
    return;
  }

  if (message.length < 10) {
    toast.error('A mensagem deve ter pelo menos 10 caracteres');
    return;
  }

  if (message.length > 500) {
    toast.error('A mensagem não pode ter mais de 500 caracteres');
    return;
  }

  try {
    console.log('Enviando proposta:', {
      itemId: item.value!.id,
      message: message
    });

    const response = await api.post('/api/proposals', {
      itemId: Number(item.value!.id),
      mensagem: message
    });
    
    console.log('Proposta enviada com sucesso:', response.data);
    
    toast.success('Proposta enviada com sucesso!');
    showProposalModal.value = false;
    proposalMessage.value = '';
  } catch (error: any) {
    console.error('Erro ao enviar proposta:', error);
    console.error('Detalhes do erro:', error.response?.data);
    
    const errorMessage = error.response?.data?.error || 
                        error.response?.data?.message || 
                        error.message || 
                        'Erro ao enviar proposta';
    
    toast.error(errorMessage);
  }
};

const openImageGallery = (index: number) => {
  selectedImageIndex.value = index;
  showImageGallery.value = true;
};

const nextImage = () => {
  if (item.value?.imagens) {
    selectedImageIndex.value = (selectedImageIndex.value + 1) % item.value.imagens.length;
  }
};

const prevImage = () => {
  if (item.value?.imagens) {
    selectedImageIndex.value = selectedImageIndex.value === 0 
      ? item.value.imagens.length - 1 
      : selectedImageIndex.value - 1;
  }
};

const viewProfile = () => {
  router.push(`/perfil/${item.value!.owner!.id}`);
};

const editItem = () => {
  router.push(`/editar-item/${item.value!.id}`);
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="container mx-auto px-4">
      <!-- Breadcrumb -->
      <div class="mb-6">
        <button @click="router.back()" class="text-purple-600 hover:text-purple-700 flex items-center space-x-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Voltar para início</span>
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>

      <!-- Content -->
      <div v-else-if="item" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left Column - Images -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Main Image -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="aspect-video bg-gray-100 relative group cursor-pointer" @click="openImageGallery(selectedImageIndex)">
              <img
                v-if="item.imagens && item.imagens.length > 0"
            :src="getImageUrl(item.imagens[selectedImageIndex])"
                :alt="item.titulo"
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                <svg class="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                <svg class="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </div>
              <span :class="['absolute top-4 right-4 px-4 py-2 rounded-full text-sm font-medium border backdrop-blur-sm', getStatusColor(item.status)]">
                {{ getStatusLabel(item.status) }}
              </span>
            </div>

            <!-- Thumbnail Gallery -->
            <div v-if="item.imagens && item.imagens.length > 1" class="p-4 flex space-x-2 overflow-x-auto">
              <div
                v-for="(image, index) in item.imagens"
                :key="index"
                @click="selectedImageIndex = index"
                :class="[
                  'w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer border-2 transition-all',
                  selectedImageIndex === index ? 'border-purple-600 ring-2 ring-purple-200' : 'border-gray-200 hover:border-purple-300'
                ]"
          > 
            <img :src="getImageUrl(image)" :alt="`${item.titulo} - ${index + 1}`" class="w-full h-full object-cover" />
              </div>
            </div>
          </div>

          <!-- Description -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">Descrição</h2>
            <p class="text-gray-700 leading-relaxed whitespace-pre-wrap">{{ item.descricao }}</p>
          </div>

          <!-- Details -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4">Detalhes</h2>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-gray-600 mb-1">Categoria</p>
                <p class="font-semibold text-gray-900">{{ item.categoria }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600 mb-1">Publicado em</p>
                <p class="font-semibold text-gray-900">{{ formatDate(item.createdAt) }}</p>
              </div>
            </div>
          </div>

          <!-- NOVA SEÇÃO: Itens Desejados na Troca -->
          <div v-if="item.tradePreferences && item.tradePreferences.length > 0" class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">
              Dono(a) gostaria de trocar por:
            </h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <PreferredTitleCard
                v-for="preferred in item.tradePreferences"
                :key="preferred.id"
                :title="preferred.titulo"
              />
            </div>
          </div>
        </div>

        <!-- Right Column - Owner & Actions -->
        <div class="space-y-6">
          <!-- Owner Card -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 class="text-lg font-bold text-gray-900 mb-4">Anunciante</h3>
            <div class="flex items-center space-x-4 mb-4">
              <div class="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span class="text-white font-bold text-xl">
                  {{ item.owner?.nome.charAt(0).toUpperCase() }}
                </span>
              </div>
              <div class="flex-1 min-w-0">
                <h4 class="font-bold text-gray-900 truncate">{{ item.owner?.nome }}</h4>
                <p class="text-sm text-gray-600 truncate">{{ item.owner?.email }}</p>
              </div>
            </div>
            <button @click="viewProfile" class="w-full btn btn-secondary">
              Ver Perfil
            </button>
          </div>

          <!-- Action Buttons -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div v-if="isOwner" class="space-y-3">
              <p class="text-sm text-gray-600 mb-3 text-center">Este item é seu. Você pode gerenciá-lo em Meus Itens.</p>
              <button @click="editItem" class="w-full btn btn-primary">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Editar Item
              </button>
              <router-link to="/meus-itens" class="w-full btn btn-secondary block text-center">
                Ir para Meus Itens
              </router-link>
            </div>

            <div v-else-if="canPropose" class="space-y-3">
              <button @click="openProposalModal" class="w-full btn btn-primary">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Fazer Proposta
              </button>
              <p class="text-xs text-gray-600 text-center">
                Envie uma proposta de troca para este item
              </p>
            </div>

            <div v-else-if="!authStore.isAuthenticated" class="space-y-3">
              <p class="text-sm text-gray-600 mb-3 text-center">Faça login para fazer propostas</p>
              <router-link to="/login" class="w-full btn btn-primary block text-center">
                Fazer Login
              </router-link>
            </div>

            <div v-else class="text-center">
              <div class="py-8">
                <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                <p class="text-sm text-gray-600">Item não disponível para propostas</p>
              </div>
            </div>
          </div>

          <!-- Location (if available) -->
          <div v-if="item.latitude && item.longitude" class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 class="text-lg font-bold text-gray-900 mb-4">Localização</h3>
            <div class="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
              <div class="text-center">
                <svg class="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p class="text-sm text-gray-600">Mapa disponível em breve</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Proposal Modal -->
    <transition name="modal">
      <div
        v-if="showProposalModal"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        @click.self="showProposalModal = false"
      >
        <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-bold text-gray-900">Fazer Proposta</h3>
            <button @click="showProposalModal = false" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="space-y-4">
            <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p class="text-sm text-gray-600 mb-1">Você está fazendo uma proposta para:</p>
              <p class="font-bold text-gray-900">{{ item?.titulo }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Mensagem da Proposta *
              </label>
              <textarea
                v-model="proposalMessage"
                rows="6"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                placeholder="Descreva sua proposta de troca. Seja específico sobre o que você está oferecendo..."
              ></textarea>
              <p class="text-xs text-gray-500 mt-1">
                Mínimo 10 caracteres. Seja claro e educado.
              </p>
            </div>

            <div class="flex space-x-3 pt-4">
              <button
                @click="showProposalModal = false"
                class="flex-1 btn btn-secondary"
              >
                Cancelar
              </button>
              <button
                @click="submitProposal"
                :disabled="proposalMessage.length < 10"
                class="flex-1 btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Enviar Proposta
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Image Gallery Modal -->
    <transition name="modal">
      <div
        v-if="showImageGallery && item?.imagens && item.imagens.length > 0"
        class="fixed inset-0 bg-black z-50 flex items-center justify-center p-4"
        @click="showImageGallery = false"
      >
        <button
          @click="showImageGallery = false"
          class="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors z-10"
        >
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <button
          v-if="item.imagens.length > 1"
          @click.stop="prevImage"
          class="absolute left-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
        >
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <img
      :src="getImageUrl(item.imagens[selectedImageIndex])"
          :alt="`${item.titulo} - ${selectedImageIndex + 1}`"
          class="max-w-full max-h-full object-contain"
          @click.stop
        />

        <button
          v-if="item.imagens.length > 1"
          @click.stop="nextImage"
          class="absolute right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
        >
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <div class="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-4 py-2 rounded-full">
          {{ selectedImageIndex + 1 }} / {{ item.imagens.length }}
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
