<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useProposalStore } from '@/stores/proposal';
import { useRouter } from 'vue-router';
import { useToast } from '@/composables/useToast';
import { useChatStore } from '@/stores/chat';
import { type Proposal, ProposalStatus } from '@/types/index';

const proposalStore = useProposalStore();
const router = useRouter();
const toast = useToast();
const chatStore = useChatStore();

const selectedProposal = ref<Proposal | null>(null);
const showModal = ref(false);
const actionLoading = ref(false);

const receivedProposals = computed(() => proposalStore.receivedProposals);

onMounted(async () => {
  // Conecta o chat ao carregar a página
  if (!chatStore.connected) {
    console.log('🔌 Conectando chat...');
    chatStore.connect();
  }
  
  // Carrega propostas
  await proposalStore.fetchReceivedProposals();
});

const openProposal = (proposal: Proposal) => {
  selectedProposal.value = proposal;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  selectedProposal.value = null;
  actionLoading.value = false;
};

const acceptProposal = async () => {
  if (!selectedProposal.value || actionLoading.value) return;
  
  actionLoading.value = true;
  
  try {
    console.log('✅ Aceitando proposta:', selectedProposal.value.id);
    
    // A store 'proposal' já cuida de abrir o chat quando a proposta é aceita.
    // Não precisamos fazer isso manualmente aqui.
    await proposalStore.updateProposalStatus(selectedProposal.value.id, ProposalStatus.ACEITA);
    
    toast.success('Proposta aceita com sucesso! 🎉');
    closeModal();
  } catch (error: any) {
    console.error('❌ Erro ao aceitar proposta:', error);
    toast.error(error.message || 'Erro ao aceitar proposta');
  } finally {
    actionLoading.value = false;
  }
};

const rejectProposal = async () => {
  if (!selectedProposal.value || actionLoading.value) return;
  
  if (!confirm('Tem certeza que deseja recusar esta proposta?')) {
    return;
  }
  
  actionLoading.value = true;
  
  try {
    console.log('❌ Recusando proposta:', selectedProposal.value.id);
    
    await proposalStore.updateProposalStatus(selectedProposal.value.id, ProposalStatus.RECUSADA);
    
    toast.success('Proposta recusada');
    
    closeModal();
  } catch (error: any) {
    console.error('❌ Erro ao recusar proposta:', error);
    toast.error(error.message || 'Erro ao recusar proposta');
  } finally {
    actionLoading.value = false;
  }
};

const openChat = () => {
  if (!selectedProposal.value) return;
  
  const otherUserId = selectedProposal.value.proposer?.id;
  const itemId = selectedProposal.value.item?.id;
  
  if (!otherUserId || !itemId) {
    toast.error('Erro ao abrir chat: dados incompletos');
    console.error('❌ Dados faltando:', { 
      otherUserId, 
      itemId,
      proposta: selectedProposal.value 
    });
    return;
  }
  
  console.log('💬 Abrindo chat:', { otherUserId, itemId });
  
  // Garante que o chat está conectado
  if (!chatStore.connected) {
    console.log('🔌 Chat não conectado, conectando...');
    chatStore.connect();
    
    // Aguarda conexão
    setTimeout(() => {
      chatStore.openChatWithConversation(otherUserId, itemId);
    }, 1000);
  } else {
    chatStore.openChatWithConversation(otherUserId, itemId);
  }
  
  closeModal();
};

const viewItem = (itemId: number) => {
  router.push(`/items/${itemId}`);
};

const getStatusColor = (status: string) => {
  const colors = {
    'pendente': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'aceita': 'bg-green-100 text-green-800 border-green-200',
    'recusada': 'bg-red-100 text-red-800 border-red-200'
  };
  return colors[status as keyof typeof colors] || colors.pendente;
};

const getStatusLabel = (status: string) => {
  const labels = {
    'pendente': '⏳ Pendente',
    'aceita': '✅ Aceita',
    'recusada': '❌ Recusada'
  };
  return labels[status as keyof typeof labels] || status;
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="container mx-auto px-4 max-w-6xl">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">📥 Propostas Recebidas</h1>
        <p class="text-gray-600">Propostas que outras pessoas fizeram nos seus itens</p>
      </div>

      <!-- Loading -->
      <div v-if="proposalStore.loadingReceivedProposals" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>

      <!-- Empty State -->
      <div v-else-if="receivedProposals.length === 0" class="text-center py-12">
        <div class="bg-white rounded-2xl shadow-sm p-12 max-w-md mx-auto">
          <svg class="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 class="text-xl font-semibold text-gray-700 mb-2">Nenhuma proposta recebida</h3>
          <p class="text-gray-500">Quando alguém fizer uma proposta nos seus itens, ela aparecerá aqui.</p>
        </div>
      </div>

      <!-- Lista de Propostas -->
      <div v-else class="space-y-4">
        <div
          v-for="proposal in receivedProposals"
          :key="proposal.id"
          @click="openProposal(proposal)"
          class="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all p-6 cursor-pointer border-2 border-transparent hover:border-purple-200"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-start space-x-4">
              <!-- Avatar -->
              <div class="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                <span class="text-white font-bold text-lg">
                  {{ proposal.proposer?.nome?.charAt(0).toUpperCase() || '?' }}
                </span>
              </div>

              <!-- Info -->
              <div>
                <h3 class="font-bold text-gray-900 text-lg" :title="proposal.item?.titulo">
                  Proposta para: {{ proposal.item?.titulo }}
                </h3>
                <p class="text-gray-600 text-sm">
                  De: <span class="font-medium">{{ proposal.proposer?.nome }}</span>
                </p>
                <p class="text-gray-500 text-xs mt-1">
                  {{ formatDate(proposal.createdAt) }}
                </p>
              </div>
            </div>

            <!-- Status Badge -->
            <span :class="['px-3 py-1 rounded-full text-sm font-medium border', getStatusColor(proposal.status)]">
              {{ getStatusLabel(proposal.status) }}
            </span>
          </div>

          <!-- Items da Troca -->
          <div class="grid grid-cols-2 gap-4 mt-4 p-4 bg-gray-50 rounded-xl">
            <div>
              <p class="text-xs text-gray-500 mb-1">Seu item:</p>
              <p class="font-semibold text-gray-900">{{ proposal.item?.titulo }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 mb-1">Item(s) oferecido(s):</p>
              <div v-if="proposal.offeredItems && proposal.offeredItems.length > 0">
                <p v-for="offered in proposal.offeredItems" :key="offered.id" class="font-semibold text-gray-900">
                  {{ offered.titulo }}
                </p>
              </div>
              <p v-else class="font-semibold text-gray-500 italic">Nenhum item em troca</p>
            </div>
          </div>

          <!-- Mensagem -->
          <div v-if="proposal.mensagem" class="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <p class="text-sm text-gray-700">
              <span class="font-medium text-gray-900">Mensagem:</span> {{ proposal.mensagem }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Detalhes -->
    <transition name="modal">
      <div
        v-if="showModal && selectedProposal"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        @click.self="closeModal"
      >
        <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
          <!-- Header -->
          <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 class="text-2xl font-bold text-gray-900">
              Proposta para: {{ selectedProposal.item?.titulo }}
            </h2>
            <button
              @click="closeModal"
              class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Conteúdo -->
          <div class="p-6 space-y-6">
            <!-- Status -->
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <span class="text-gray-700 font-medium">Status:</span>
              <span :class="['px-4 py-2 rounded-full text-sm font-medium border', getStatusColor(selectedProposal.status)]">
                {{ getStatusLabel(selectedProposal.status) }}
              </span>
            </div>

            <!-- Proponente -->
            <div>
              <h3 class="text-sm font-semibold text-gray-700 mb-3">👤 Proponente</h3>
              <div class="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                <div class="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <span class="text-white font-bold text-lg">
                    {{ selectedProposal.proposer?.nome?.charAt(0).toUpperCase() }}
                  </span>
                </div>
                <div>
                  <p class="font-semibold text-gray-900">{{ selectedProposal.proposer?.nome }}</p>
                  <p class="text-sm text-gray-600">{{ selectedProposal.proposer?.email }}</p>
                </div>
              </div>
            </div>

            <!-- Items da Troca -->
            <div>
              <h3 class="text-sm font-semibold text-gray-700 mb-3">🔄 Detalhes da Troca</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Seu Item -->
                <div class="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border-2 border-blue-200">
                  <p class="text-xs text-blue-600 font-semibold mb-2">SEU ITEM</p>
                  <p class="font-bold text-gray-900 mb-2">{{ selectedProposal.item?.titulo }}</p>
                  <p class="text-sm text-gray-600 mb-3">{{ selectedProposal.item?.categoria }}</p>
                  <button
                    @click.stop="viewItem(selectedProposal.item?.id)"
                    class="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Ver detalhes →
                  </button>
                </div>

                <!-- Item Oferecido -->
                <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
                  <p class="text-xs text-green-600 font-semibold mb-2">ITEM(S) OFERECIDO(S)</p>
                  <div v-if="selectedProposal.offeredItems && selectedProposal.offeredItems.length > 0">
                    <div v-for="offered in selectedProposal.offeredItems" :key="offered.id" class="mb-2">
                      <p class="font-bold text-gray-900">{{ offered.titulo }}</p>
                      <p class="text-sm text-gray-600">{{ offered.categoria }}</p>
                    </div>
                  </div>
                  <p v-else class="text-sm text-gray-500 italic">Nenhum item foi oferecido em troca.</p>
                  <button
                    @click.stop="viewItem(selectedProposal.offeredItems[0].id)"
                    v-if="selectedProposal.offeredItems && selectedProposal.offeredItems.length === 1"
                    class="text-sm text-green-600 hover:text-green-700 font-medium mt-2"
                  >
                    Ver detalhes →
                  </button>
                </div>
              </div>
            </div>

            <!-- Mensagem -->
            <div v-if="selectedProposal.mensagem">
              <h3 class="text-sm font-semibold text-gray-700 mb-3">💬 Mensagem</h3>
              <div class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                <p class="text-gray-700">{{ selectedProposal.mensagem }}</p>
              </div>
            </div>

            <!-- Data -->
            <div class="flex items-center justify-between text-sm text-gray-500">
              <span>📅 Recebida em</span>
              <span class="font-medium">{{ formatDate(selectedProposal.createdAt) }}</span>
            </div>
          </div>

          <!-- Ações -->
          <div 
            class="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4"
          >
            <div v-if="selectedProposal.status === 'pendente'" class="flex space-x-3">
              <button
                @click="acceptProposal"
                :disabled="actionLoading"
                class="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                <span v-if="!actionLoading">✓ Aceitar Proposta</span>
                <span v-else>Processando...</span>
              </button>
              <button
                @click="rejectProposal"
                :disabled="actionLoading"
                class="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                <span v-if="!actionLoading">✗ Recusar</span>
                <span v-else>Processando...</span>
              </button>
              <button
                @click="openChat"
                class="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl"
                title="Abrir chat"
              >
                💬
              </button>
            </div>

            <div v-else class="flex space-x-3">
              <button
                @click="viewItem(selectedProposal.item?.id)"
                class="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl"
              >
                Ver Item
              </button>
              <button
                @click="openChat"
                class="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl"
              >
                💬 Chat
              </button>
              <button
                @click="closeModal"
                class="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-xl transition-all"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .animate-slideUp,
.modal-leave-to .animate-slideUp {
  transform: translateY(20px) scale(0.95);
}

.animate-slideUp {
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>