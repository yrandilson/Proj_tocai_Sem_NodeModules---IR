<script setup lang="ts">
import { onMounted, computed, ref } from 'vue';
import { useProposalStore } from '@/stores/proposal';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/composables/useToast';
import { ProposalStatus, type Proposal, type Rating } from '@/types/index';
import RatingModal from '@/components/RatingModal.vue';
import StarRating from '@/components/StarRating.vue';

const proposalStore = useProposalStore();
const authStore = useAuthStore();
const toast = useToast();

const showRatingModal = ref(false);
const proposalToRate = ref<Proposal | null>(null);

onMounted(async () => {
  await proposalStore.fetchMyProposals();
});

const proposals = computed(() => proposalStore.myProposals);

const statusLabel = (status: string) => {
  const labels = {
    pendente: 'Pendente',
    aceita: 'Aceita',
    recusada: 'Recusada'
  };
  return labels[status as keyof typeof labels];
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

const handleDelete = async (id: number) => {
  if (!confirm('Tem certeza que deseja deletar esta proposta?')) return;

  try {
    await proposalStore.deleteProposal(id);
    toast.success('Proposta cancelada com sucesso!');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    toast.error(`Erro ao cancelar proposta: ${errorMessage}`);
  }
};

const openRatingModal = (proposal: Proposal) => {
  proposalToRate.value = proposal;
  showRatingModal.value = true;
};

const onRatingSuccess = async (newRating: Rating) => {
  try {
    // Recarrega TODAS as propostas do servidor para garantir dados atualizados
    await proposalStore.fetchMyProposals();
    
    toast.success('Avaliação registrada com sucesso!');
    showRatingModal.value = false;
    proposalToRate.value = null;
  } catch (error) {
    console.error('Erro ao recarregar propostas:', error);
    toast.error('Avaliação salva, mas houve erro ao atualizar a lista.');
  }
};

const pendingCount = computed(() => 
  proposals.value.filter(p => p.status === ProposalStatus.PENDENTE).length
);

const acceptedCount = computed(() => 
  proposals.value.filter(p => p.status === ProposalStatus.ACEITA).length
);

const rejectedCount = computed(() => 
  proposals.value.filter(p => p.status === ProposalStatus.RECUSADA).length
);
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Minhas Propostas</h1>
      <p class="text-gray-600">Propostas de troca que você enviou</p>
    </div>

    <!-- Estatísticas -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div class="card bg-yellow-50 border-yellow-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-yellow-800 font-medium">Pendentes</p>
            <p class="text-3xl font-bold text-yellow-900">{{ pendingCount }}</p>
          </div>
          <div class="text-4xl">⏳</div>
        </div>
      </div>

      <div class="card bg-green-50 border-green-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-green-800 font-medium">Aceitas</p>
            <p class="text-3xl font-bold text-green-900">{{ acceptedCount }}</p>
          </div>
          <div class="text-4xl">✅</div>
        </div>
      </div>

      <div class="card bg-red-50 border-red-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-red-800 font-medium">Recusadas</p>
            <p class="text-3xl font-bold text-red-900">{{ rejectedCount }}</p>
          </div>
          <div class="text-4xl">❌</div>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="proposalStore.loadingMyProposals" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>

    <!-- Lista de Propostas -->
    <div v-else-if="proposals.length > 0" class="space-y-4">
      <div
        v-for="proposal in proposals"
        :key="proposal.id"
        class="card hover:shadow-lg transition-shadow"
      >
        <div class="flex flex-col md:flex-row md:items-start gap-4">
          <!-- Info da Proposta -->
          <div class="flex-1">
            <!-- Cabeçalho -->
            <div class="flex items-start justify-between mb-3">
              <div>
                <h3 class="text-lg font-bold text-gray-900 mb-1">
                  {{ proposal.item?.titulo }}
                </h3>
                <p class="text-sm text-gray-500">
                  Enviada em {{ formatDate(proposal.createdAt) }}
                </p>
              </div>
              <span :class="`badge badge-${proposal.status}`">
                {{ statusLabel(proposal.status) }}
              </span>
            </div>

            <!-- Mensagem -->
            <div class="mb-3">
              <p class="text-sm font-medium text-gray-700 mb-1">Sua proposta:</p>
              <p class="text-gray-600 bg-gray-50 p-3 rounded-lg">
                {{ proposal.mensagem }}
              </p>
            </div>

            <!-- Info do Dono -->
            <div class="flex items-center space-x-2 text-sm text-gray-600">
              <span>📦 {{ proposal.item?.categoria }}</span>
              <span>•</span>
              <span v-if="proposal.item?.owner">👤 {{ proposal.item.owner.nome }}</span>
            </div>
          </div>

          <!-- Ações -->
          <div class="flex md:flex-col space-x-2 md:space-x-0 md:space-y-2">
            <RouterLink
              v-if="proposal.item"
              :to="`/items/${proposal.item.id}`"
              class="btn btn-secondary text-sm"
            >
              Ver Item
            </RouterLink>
            <button
              v-if="proposal.status === 'pendente'"
              @click="handleDelete(proposal.id)"
              class="btn btn-danger text-sm"
            >
              Cancelar
            </button>
          </div>
        </div>

        <!-- Mensagem de Resposta -->
        <div v-if="proposal.status === 'aceita'" class="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg space-y-3">
          <div>
            <p class="text-green-800 text-sm">
              🎉 <strong>Proposta aceita!</strong> Entre em contato com {{ proposal.item?.owner?.nome || 'o dono do item' }} para combinar os detalhes da troca.
            </p>
            <p v-if="proposal.item?.owner?.email" class="text-green-700 text-xs mt-1">
              Email: {{ proposal.item.owner.email }}
            </p>
          </div>

          <!-- Seção de Avaliação -->
          <div class="pt-3 border-t border-green-200">
            <!-- A lógica de avaliação foi simplificada para focar na funcionalidade principal -->
            <button              
              @click="openRatingModal(proposal)"
              class="btn btn-primary btn-sm"
            >
              ⭐ Avaliar Troca
            </button>
          </div>
        </div>

        <div v-if="proposal.status === 'recusada'" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-red-800 text-sm">
            Proposta recusada. Você pode tentar fazer uma nova proposta para outros itens.
          </p>
        </div>
      </div>
    </div>

    <!-- Nenhuma proposta -->
    <div v-else class="text-center py-12">
      <div class="text-6xl mb-4">📝</div>
      <h3 class="text-2xl font-bold text-gray-900 mb-2">
        Você ainda não fez nenhuma proposta
      </h3>
      <p class="text-gray-600 mb-6">
        Navegue pelos itens disponíveis e faça sua primeira proposta de troca!
      </p>
      <RouterLink to="/" class="btn btn-primary">
        Ver Itens Disponíveis
      </RouterLink>
    </div>

    <!-- Modal de Avaliação -->
    <RatingModal 
      :show="showRatingModal"
      :proposal="proposalToRate"
      @close="showRatingModal = false"
      @success="onRatingSuccess"
    />
  </div>
</template>
