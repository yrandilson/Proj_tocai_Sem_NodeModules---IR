import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/services/api';
import { type Proposal, ProposalStatus } from '@/types/index';
import { useChatStore } from './chat';

/**
 * Store de propostas
 * Gerencia o estado das propostas de troca
 */
export const useProposalStore = defineStore('proposal', () => {
  // Estado
  const myProposals = ref<Proposal[]>([]);
  const receivedProposals = ref<Proposal[]>([]);
  const error = ref<string | null>(null);

  // Estados de carregamento granulares para evitar condições de corrida
  const loadingMyProposals = ref(false);
  const loadingReceivedProposals = ref(false);
  const loadingAction = ref(false); // Para criar, atualizar, deletar

  /**
   * Cria uma nova proposta
   */
  const createProposal = async (itemId: number, mensagem: string) => {
    loadingAction.value = true;
    error.value = null;

    try {
      const response = await api.post<Proposal>('/api/proposals', {
        itemId,
        mensagem
      });

      // Adiciona a proposta retornada pela API para garantir consistência
      myProposals.value.unshift(response.data); 
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Erro ao criar proposta';
      throw err; // Propaga o erro para ser tratado no componente, se necessário
    } finally {
      loadingAction.value = false;
    }
    return myProposals.value[0]; // Retorna a proposta criada
  };

  /**
   * Busca propostas enviadas pelo usuário
   */
  const fetchMyProposals = async () => {
    loadingMyProposals.value = true;
    error.value = null;

    try {
      const response = await api.get<Proposal[]>('/api/proposals/sent');
      myProposals.value = response.data;
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Erro ao buscar propostas enviadas';
      myProposals.value = []; // Limpa em caso de erro
    } finally {
      loadingMyProposals.value = false;
    }
  };

  /**
   * Busca propostas recebidas (nos itens do usuário)
   */
  const fetchReceivedProposals = async () => {
    loadingReceivedProposals.value = true;
    error.value = null;

    try {
      const response = await api.get<Proposal[]>('/api/proposals/received');
      receivedProposals.value = response.data;
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Erro ao buscar propostas recebidas';
      receivedProposals.value = []; // Limpa em caso de erro
    } finally {
      loadingReceivedProposals.value = false;
    }
  };

  /**
   * Atualiza o status de uma proposta (aceitar/recusar)
   */
  const updateProposalStatus = async (id: number, status: ProposalStatus) => {
    loadingAction.value = true;
    error.value = null;

    try {
      const response = await api.patch<Proposal>(`/api/proposals/${id}/status`, {
        status
      });

      const updatedProposal = response.data;

      // Atualiza na lista de propostas recebidas
      const index = receivedProposals.value.findIndex((p: Proposal) => p.id === id);
      if (index !== -1) {
        receivedProposals.value[index] = updatedProposal;
      }

      // Se a proposta foi aceita, abre o chat com o proponente
      if (status === ProposalStatus.ACEITA) {
        // Boa prática: instanciar a store dentro da ação para evitar dependências circulares
        // Usar os dados da resposta da API (updatedProposal) garante que temos as informações corretas.
        const chatStore = useChatStore();
        chatStore.openChatWithConversation(updatedProposal.proposer.id, updatedProposal.item.id);
      }

    } catch (err: any) {
      error.value = err.response?.data?.error || 'Erro ao atualizar proposta';
      throw err;
    } finally {
      loadingAction.value = false;
    }
    return receivedProposals.value.find(p => p.id === id);
  };

  /**
   * Deleta uma proposta
   */
  const deleteProposal = async (id: number) => {
    loadingAction.value = true;
    error.value = null;

    try {
      await api.delete(`/api/proposals/${id}`);
      
      // Remove da lista
      myProposals.value = myProposals.value.filter((p: Proposal) => p.id !== id);
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Erro ao deletar proposta';
      throw err;
    } finally {
      loadingAction.value = false;
    }
    return true;
  };

  /**
   * Conta propostas pendentes (reativo)
   */
  const pendingReceivedCount = computed(() => {
    return receivedProposals.value.filter((p: Proposal) => p.status === ProposalStatus.PENDENTE).length;
  });

  return {
    // State
    myProposals,
    receivedProposals,
    loadingMyProposals,
    loadingReceivedProposals,
    loadingAction,
    error,
    // Actions
    createProposal,
    fetchMyProposals,
    fetchReceivedProposals,
    updateProposalStatus,
    deleteProposal,    
    pendingReceivedCount
  };
});
