import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '@/services/api';
import type { Rating } from '@/types/index';
import { useToast } from '@/composables/useToast';

export const useRatingStore = defineStore('rating', () => {
  const ratings = ref<Rating[]>([]);
  const allRatings = ref<Rating[]>([]);
  const isLoading = ref(false);
  const toast = useToast();

  async function fetchRatings(userId: number) {
    isLoading.value = true;
    try {
      const response = await api.get(`/api/ratings/user/${userId}`);
      ratings.value = response.data;
    } catch (error) {
      toast.error('Erro ao buscar avaliações.');
      console.error('Erro ao buscar avaliações:', error);
    } finally {
      isLoading.value = false;
    }
  }

  async function submitRating(payload: { toUserId: number; proposalId: number; value: number; comment: string }) {
    try {
      await api.post('/api/ratings', payload);
      toast.success('Avaliação enviada com sucesso!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao enviar avaliação.');
      throw error;
    }
  }

  async function fetchAllRatings() {
    isLoading.value = true;
    try {
      const response = await api.get('/api/ratings/all');
      allRatings.value = response.data;
    } catch (error) {
      toast.error('Erro ao buscar todas as avaliações.');
      console.error('Erro ao buscar todas as avaliações:', error);
    } finally {
      isLoading.value = false;
    }
  }

  return { ratings, allRatings, isLoading, fetchRatings, submitRating, fetchAllRatings };
});