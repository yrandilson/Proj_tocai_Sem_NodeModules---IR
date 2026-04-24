import axios from 'axios';
import { useUiStore } from '@/stores/ui';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Interceptor de Requisição: executado ANTES de cada requisição sair.
api.interceptors.request.use(
  (config) => {
    // Usamos 'pinia.state.value' para acessar a store fora de um componente Vue.
    const uiStore = useUiStore();
    uiStore.startLoading();

    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    const uiStore = useUiStore();
    uiStore.stopLoading(); // Para o loading em caso de erro na configuração da requisição
    return Promise.reject(error);
  }
);

// Interceptor de Resposta: executado DEPOIS que cada resposta chega.
api.interceptors.response.use(
  (response) => {
    const uiStore = useUiStore();
    uiStore.stopLoading();
    return response;
  },
  (error) => {
    const uiStore = useUiStore();
    uiStore.stopLoading(); // Para o loading também em caso de erro na resposta
    return Promise.reject(error);
  }
);

export default api;