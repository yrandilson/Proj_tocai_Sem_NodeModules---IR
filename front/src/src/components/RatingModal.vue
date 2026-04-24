<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <!-- Adicionado listener para a tecla Escape -->
      <div
        v-if="show"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm"
        @click.self="closeModal"
      >
        <div class="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl m-4">
          <button
            @click="closeModal"
            class="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
            aria-label="Fechar modal"
          >
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div v-if="proposal && otherUser">
            <!-- Título mais dinâmico e claro -->
            <h2 class="text-2xl font-bold text-gray-800 mb-2">Avaliar {{ otherUser.nome }}</h2>
            <p class="text-gray-600 mb-6">
              Como foi sua experiência de troca? Deixe uma avaliação para ajudar a comunidade.
            </p>

            <form @submit.prevent="submitRating">
              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">Sua avaliação</label>
                <!-- Usando o componente StarRating para consistência e melhor UX -->
                <div class="flex justify-center md:justify-start">
                  <!-- v-model liga o estado 'stars' ao componente filho -->
                  <StarRating v-model="stars" :max-stars="5" class="text-3xl" />
                </div>
              </div>

              <div class="mb-6">
                <label for="comment" class="block text-sm font-medium text-gray-700">Comentário (opcional)</label>
                <textarea
                  id="comment"
                  v-model="comment"
                  rows="4"
                  placeholder="Descreva sua experiência..."
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                ></textarea>
              </div>

              <!-- Feedback Detalhado (P1) -->
              <div class="mb-6 p-4 border rounded-lg bg-gray-50">
                <h3 class="text-md font-bold text-gray-700 mb-3">Detalhes da Troca</h3>
                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <label for="itemConformeDescricao" class="text-sm text-gray-600">Item conforme a descrição?</label>
                    <input type="checkbox" id="itemConformeDescricao" v-model="itemConformeDescricao" class="checkbox" />
                  </div>
                  <div class="flex items-center justify-between">
                    <label for="comunicacaoClara" class="text-sm text-gray-600">Comunicação foi clara?</label>
                    <input type="checkbox" id="comunicacaoClara" v-model="comunicacaoClara" class="checkbox" />
                  </div>
                  <div class="flex items-center justify-between">
                    <label for="prazoCumprido" class="text-sm text-gray-600">Prazo de entrega/retirada cumprido?</label>
                    <input type="checkbox" id="prazoCumprido" v-model="prazoCumprido" class="checkbox" />
                  </div>
                  <div class="flex items-center justify-between">
                    <label for="recomendariaUsuario" class="text-sm text-gray-600">Recomendaria este usuário?</label>
                    <input type="checkbox" id="recomendariaUsuario" v-model="recomendariaUsuario" class="checkbox" />
                  </div>
                </div>
              </div>

              <div v-if="error" class="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {{ error }}
              </div>

              <button
                type="submit"
                :disabled="loading || stars === 0"
                class="w-full inline-flex justify-center rounded-md border border-transparent bg-primary-600 py-3 px-4 text-base font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <span v-if="!loading">Enviar Avaliação</span>
                <span v-else>Enviando...</span>
              </button>
            </form>
          </div>
          <div v-else class="text-center text-gray-500">
            Carregando dados da proposta...
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'; // onMounted não é usado aqui
import { type Proposal, type User } from '@/types/index'; // Caminho explícito e importação de tipo
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/composables/useToast';
import api from '@/services/api';
import { useConfetti } from '@/composables/useConfetti';
import StarRating from './StarRating.vue'; // Importando o componente de estrelas

const props = defineProps<{
  show: boolean;
  proposal: Proposal | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'success', rating: any): void;
}>();

const authStore = useAuthStore();
const toast = useToast();
const { fire: fireConfetti } = useConfetti();

const stars = ref(0);
const comment = ref('');
const loading = ref(false);
const error = ref('');
// Feedback Detalhado (P1)
const itemConformeDescricao = ref(true);
const comunicacaoClara = ref(true);
const prazoCumprido = ref(true);
const recomendariaUsuario = ref(true);

const otherUser = computed<User | null>(() => {
  if (!props.proposal || !authStore.user) return null;
  // Determina quem é o outro usuário na troca.
  if (props.proposal.proposer.id === authStore.user.id) {
    return props.proposal.item.owner ?? null;
  }
  return props.proposal.proposer;
});

const closeModal = () => {
  if (!loading.value) {
    emit('close');
  }
};

const resetForm = () => {
  stars.value = 0;
  comment.value = '';
  loading.value = false;
  error.value = '';
  // Reset Feedback Detalhado
  itemConformeDescricao.value = true;
  comunicacaoClara.value = true;
  prazoCumprido.value = true;
  recomendariaUsuario.value = true;
};

const submitRating = async () => {
  if (stars.value === 0) {
    error.value = 'Por favor, selecione pelo menos uma estrela.';
    return;
  }

  loading.value = true;
  error.value = '';

  // Verificação explícita para garantir que otherUser e proposal não são nulos.
  if (!props.proposal || !otherUser.value) {
    error.value = 'Não foi possível identificar o usuário a ser avaliado. Tente novamente.';
    loading.value = false;
    return;
  }
  try {
    const payload = {
      toUserId: otherUser.value.id,
      proposalId: props.proposal.id,
      stars: stars.value, // Corrigido para 'stars' para corresponder ao DTO do backend
      comment: comment.value,
      // Feedback Detalhado (P1)
      itemConformeDescricao: itemConformeDescricao.value,
      comunicacaoClara: comunicacaoClara.value,
      prazoCumprido: prazoCumprido.value,
      recomendariaUsuario: recomendariaUsuario.value,
    };

    console.log('📤 Enviando avaliação:', payload); // LOG 1

    const response = await api.post('/api/ratings', payload);

    console.log('✅ Resposta do servidor:', response.data); // LOG 2

    // Dispara a animação de confete usando importação dinâmica
    fireConfetti();

    // Aguarda um momento para o usuário ver a animação antes de fechar
    setTimeout(() => {
      toast.success('Avaliação registrada com sucesso!');
      emit('success', response.data);
      closeModal();
    }, 800); // Atraso de 800ms

  } catch (err: any) {
    console.error('❌ Erro completo:', err); // LOG 3
    console.error('❌ Resposta do erro:', err.response?.data); // LOG 4

    error.value = err.response?.data?.message || 'Erro ao enviar avaliação.';
  } finally {
    loading.value = false;
  }
};

// Observa a propriedade 'show' para adicionar ou remover o listener do teclado
watch(() => props.show, (newValue) => {
  if (newValue) {
    resetForm();
    window.addEventListener('keydown', onKeydown);
  } else {
    window.removeEventListener('keydown', onKeydown);
  }
});

// Função para lidar com o evento de teclado
const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    closeModal();
  }
};

// Garante que o listener seja removido quando o componente for destruído
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown);
});
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>