import axios from 'axios';
import { useUiStore } from '@/stores/ui';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  withCredentials: true, // envia o cookie httpOnly do refresh token automaticamente
});

// ─── Interceptor de Requisição ────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    useUiStore().startLoading();

    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    useUiStore().stopLoading();
    return Promise.reject(error);
  }
);

// ─── Interceptor de Resposta ──────────────────────────────────────────────────
// Fila de requisições aguardando o refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((p) => {
    if (error) {
      p.reject(error);
    } else {
      p.resolve(token!);
    }
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => {
    useUiStore().stopLoading();
    return response;
  },
  async (error) => {
    useUiStore().stopLoading();

    const originalRequest = error.config;

    // Só tenta refresh em 401, e apenas uma vez por requisição
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh') &&
      !originalRequest.url?.includes('/auth/login')
    ) {
      if (isRefreshing) {
        // Coloca na fila para retentar depois que o refresh terminar
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await api.post<{ token: string }>('/api/auth/refresh');
        const newToken = data.token;

        localStorage.setItem('token', newToken);
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        processQueue(null, newToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);

        // Refresh falhou — faz logout silencioso
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete api.defaults.headers.common.Authorization;

        // Redireciona para login sem recarregar a página inteira
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
