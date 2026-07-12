<script setup lang="ts">
import { ref, watch } from 'vue';
import { useToast } from '@/composables/useToast';
import api from '@/services/api';

const props = defineProps<{
  show: boolean;
  reportedUserId: number;
  reportedUserName: string;
  reportedItemId?: number | null;
}>();

const emit = defineEmits(['close']);

const reason = ref('');
const description = ref('');
const loading = ref(false);
const toast = useToast();

watch(() => props.show, (newVal) => {
  if (newVal) {
    // Reseta o formulário quando o modal abre
    reason.value = '';
    description.value = '';
    loading.value = false;
  }
});

const handleSubmit = async () => {
  if (!reason.value.trim()) {
    toast.error('Por favor, descreva o motivo da denúncia.');
    return;
  }

  loading.value = true;
  try {
    await api.post('/api/reports', {
      reportedUserId: props.reportedUserId,
      reason: reason.value,
      description: description.value,
      reportedItemId: props.reportedItemId,
    });
    toast.success('Denúncia enviada com sucesso. Agradecemos sua colaboração!');
    emit('close');
  } catch (error: any) {
    toast.error(error.response?.data?.error || 'Erro ao enviar denúncia.');
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <Teleport to="body">
    <transition name="fade">
      <div v-if="show" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center" @click.self="emit('close')">
        <transition name="slide-up">
          <div v-if="show" class="bg-white rounded-xl shadow-2xl w-full max-w-md m-4" @click.stop>
            <div class="p-6 border-b">
              <h2 class="text-xl font-bold text-gray-800">Denunciar {{ reportedUserName }}</h2>
              <p class="text-sm text-gray-600 mt-1">Ajude-nos a manter a comunidade segura.</p>
            </div>
            <form @submit.prevent="handleSubmit">
              <div class="p-6">
                <label for="reason" class="block text-sm font-medium text-gray-700 mb-2">Motivo da denúncia *</label>
                <select id="reason" v-model="reason" required class="input w-full mb-4">
                  <option value="" disabled>Selecione um motivo...</option>
                  <option value="Spam ou publicidade">Spam ou publicidade</option>
                  <option value="Conteúdo inapropriado">Conteúdo inapropriado (fotos, texto)</option>
                  <option value="Assédio ou discurso de ódio">Assédio ou discurso de ódio</option>
                  <option value="Tentativa de golpe ou fraude">Tentativa de golpe ou fraude</option>
                  <option value="Item falso ou enganoso">Item falso ou enganoso</option>
                  <option value="Outro">Outro (descreva abaixo)</option>
                </select>
                <label for="description" class="block text-sm font-medium text-gray-700 mb-2">Descrição (opcional)</label>
                <textarea
                  id="description"
                  v-model="description"
                  rows="5"
                  placeholder="Forneça mais detalhes sobre o motivo da sua denúncia. Isso nos ajuda a tomar a ação correta."
                  class="input w-full resize-none"
                ></textarea>
              </div>
              <div class="p-4 bg-gray-50 rounded-b-xl flex justify-end space-x-3">
                <button type="button" @click="emit('close')" class="btn btn-secondary" :disabled="loading">
                  Cancelar
                </button>
                <button type="submit" class="btn btn-danger" :disabled="loading">
                  <span v-if="loading">Enviando...</span>
                  <span v-else>Enviar Denúncia</span>
                </button>
              </div>
            </form>
          </div>
        </transition>
      </div>
    </transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.3s ease; }
.slide-up-enter-from, .slide-up-leave-to { transform: translateY(20px); opacity: 0; }
</style>