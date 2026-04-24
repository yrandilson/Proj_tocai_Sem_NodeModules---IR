import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/services/api';
import type { User, AuthResponse } from '@/types/index';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);

  const isAuthenticated = computed(() => !!token.value && !!user.value);
  const isAdmin = computed(() => user.value?.role === 'admin');

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
    // Adiciona o campo isBlocked com valor padrão para satisfazer a interface
    const userWithBlockStatus = { ...response.data.user, isBlocked: false };
    setAuth(userWithBlockStatus, response.data.token);
  };

  const login = async (email: string, senha: string) => {
    try {
      const response = await api.post<AuthResponse>('/api/auth/login', { email, senha });
      // Adiciona o campo isBlocked com valor padrão para satisfazer a interface
      const userWithBlockStatus = { ...response.data.user, isBlocked: false };
      setAuth(userWithBlockStatus, response.data.token);
      return true;
    } catch (error) {
      // O erro já será tratado pelo interceptor do axios
      return false;
    }
  };

  const logout = () => {
    try {
      // Remove o token do cabeçalho das requisições
      delete api.defaults.headers.common['Authorization'];
      
      // Limpa TODOS os dados do localStorage
      localStorage.clear();
      
      // Reseta os estados
      user.value = null;
      token.value = null;

      // Força a limpeza do cache da API
      api.defaults.headers.common = {
        'Content-Type': 'application/json'
      };
      
      return true;
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      return false;
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
