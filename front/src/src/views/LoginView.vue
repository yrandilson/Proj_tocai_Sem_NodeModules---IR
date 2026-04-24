<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const senha = ref('');
const error = ref('');
const loading = ref(false);

const handleLogin = async () => {
  error.value = '';
  loading.value = true;

  try {
    // Validações básicas
    if (!email.value || !senha.value) {
      error.value = 'Por favor, preencha todos os campos';
      return;
    }

    const success = await authStore.login(email.value, senha.value);
    if (success) {
      router.push('/');
    }
    // Se não teve sucesso, o erro já foi mostrado pelo toast
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold text-gray-900 mb-2">Entrar</h2>
        <p class="text-gray-600">Faça login para continuar</p>
      </div>

      <div class="card">
        <!-- Erro -->
        <div v-if="error" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-red-800 text-sm">{{ error }}</p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              v-model="email"
              type="email"
              required
              placeholder="seu@email.com"
              class="input"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Senha
            </label>
            <input
              v-model="senha"
              type="password"
              required
              placeholder="••••••••"
              class="input"
            />
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full btn btn-primary"
          >
            {{ loading ? 'Entrando...' : 'Entrar' }}
          </button>
        </form>

        <div class="mt-6 text-center">
          <p class="text-gray-600">
            Não tem uma conta?
            <RouterLink to="/register" class="text-primary-600 hover:text-primary-700 font-medium">
              Cadastre-se
            </RouterLink>
          </p>
        </div>

        <!-- Dica para testes -->
        <div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p class="text-blue-800 text-sm font-medium mb-2">🔑 Para testes:</p>
          <p class="text-blue-700 text-xs">
            Admin: admin@trocaai.com / admin123
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
