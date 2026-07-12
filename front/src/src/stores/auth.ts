import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/services/api';
import type { User, AuthResponse } from '@/types/index';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);

  const isAuthenticated = computed(() => !!token.value && !!user.value);
  const isAdmin = computed(() => user.value?.role === 'admin');

  /** Restaura sessão do localStorage ao iniciar (o refresh token fica no cookie httpOnly) */
  const initAuth = () => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      token.value = storedToken;
      user.value = JSON.parse(storedUser);
    }
  };

  const setAuth = (userData: User, userToken: string) => {
    user.value = userData;
    token.value = userToken;
    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const register = async (nome: string, email: string, senha: string) => {
    const response = await api.post<AuthResponse>('/api/auth/register', { nome, email, senha });
    const userWithBlockStatus = { ...response.data.user, isBlocked: false };
    setAuth(userWithBlockStatus, response.data.token);
  };

  const login = async (email: string, senha: string) => {
    try {
      const response = await api.post<AuthResponse>('/api/auth/login', { email, senha });
      const userWithBlockStatus = { ...response.data.user, isBlocked: false };
      setAuth(userWithBlockStatus, response.data.token);
      return true;
    } catch {
      return false;
    }
  };

  const logout = async () => {
    try {
      // Revoga o refresh token no servidor e limpa o cookie httpOnly
      await api.post('/api/auth/logout').catch(() => {
        // ignora erro de rede — limpa localmente de qualquer forma
      });
    } finally {
      delete api.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      user.value = null;
      token.value = null;
    }
  };

  const updateUser = async (dados: Partial<User>) => {
    if (!user.value) return;
    const response = await api.put<User>(`/api/users/${user.value.id}`, dados);
    user.value = response.data;
    localStorage.setItem('user', JSON.stringify(response.data));
  };

  initAuth();

  return { user, token, isAuthenticated, isAdmin, register, login, logout, updateUser };
});
