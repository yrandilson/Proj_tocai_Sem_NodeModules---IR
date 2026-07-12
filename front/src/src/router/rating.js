import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '@/services/api';
import { useToast } from '@/composables/useToast';
export const useRatingStore = defineStore('rating', () => {
    const ratings = ref([]);
    const allRatings = ref([]);
    const isLoading = ref(false);
    const toast = useToast();
    async function fetchRatings(userId) {
        isLoading.value = true;
        try {
            const response = await api.get(`/api/ratings/user/${userId}`);
            ratings.value = response.data;
        }
        catch (error) {
            toast.error('Erro ao buscar avaliações.');
            console.error('Erro ao buscar avaliações:', error);
        }
        finally {
            isLoading.value = false;
        }
    }
    async function submitRating(payload) {
        try {
            await api.post('/api/ratings', payload);
            toast.success('Avaliação enviada com sucesso!');
        }
        catch (error) {
            toast.error(error.response?.data?.message || 'Erro ao enviar avaliação.');
            throw error;
        }
    }
    async function fetchAllRatings() {
        isLoading.value = true;
        try {
            const response = await api.get('/api/ratings/all');
            allRatings.value = response.data;
        }
        catch (error) {
            toast.error('Erro ao buscar todas as avaliações.');
            console.error('Erro ao buscar todas as avaliações:', error);
        }
        finally {
            isLoading.value = false;
        }
    }
    return { ratings, allRatings, isLoading, fetchRatings, submitRating, fetchAllRatings };
});
//# sourceMappingURL=rating.js.map