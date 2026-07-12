// frontend/src/views/RegisterView.vue
<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/composables/useToast';

const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

const form = ref({
  nome: '',
  email: '',
  senha: '',
  confirmarSenha: ''
});

const loading = ref(false);
const errors = ref<Record<string, string>>({});

const validateForm = (): boolean => {
  errors.value = {};

  // Validar nome
  if (!form.value.nome.trim()) {
    errors.value.nome = 'Nome é obrigatório';
  } else if (form.value.nome.trim().length < 3) {
    errors.value.nome = 'Nome deve ter no mínimo 3 caracteres';
  } else if (form.value.nome.trim().length > 100) {
    errors.value.nome = 'Nome deve ter no máximo 100 caracteres';
  }

  // Validar email
  if (!form.value.email.trim()) {
    errors.value.email = 'Email é obrigatório';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    errors.value.email = 'Email inválido';
  }

  // Validar senha
  if (!form.value.senha) {
    errors.value.senha = 'Senha é obrigatória';
  } else if (form.value.senha.length < 6) {
    errors.value.senha = 'Senha deve ter no mínimo 6 caracteres';
  }

  // Validar confirmação de senha
  if (!form.value.confirmarSenha) {
    errors.value.confirmarSenha = 'Confirme sua senha';
  } else if (form.value.senha !== form.value.confirmarSenha) {
    errors.value.confirmarSenha = 'As senhas não coincidem';
  }

  return Object.keys(errors.value).length === 0;
};

const handleRegister = async () => {
  if (!validateForm()) {
    toast.error('Por favor, corrija os erros do formulário');
    return;
  }

  loading.value = true;

  try {
    await authStore.register(
      form.value.nome.trim(),
      form.value.email.trim().toLowerCase(),
      form.value.senha
    );

    toast.success('Cadastro realizado com sucesso!');
    router.push('/');
  } catch (error: any) {
    console.error('Erro ao registrar:', error);
    
    const errorMessage = error.response?.data?.error || 
                        error.message || 
                        'Erro ao realizar cadastro';
    
    toast.error(errorMessage);
    
    // Se houver detalhes de validação, adiciona aos erros do formulário
    if (error.response?.data?.details) {
      error.response.data.details.forEach((detail: any) => {
        if (detail.path && detail.path[0]) {
          errors.value[detail.path[0]] = detail.msg;
        }
      });
    }
  } finally {
    loading.value = false;
  }
};

const clearError = (field: string) => {
  delete errors.value[field];
};
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full">
      <!-- Header -->
      <div class="text-center mb-8">
        <RouterLink to="/" class="inline-flex items-center justify-center mb-6">
          <div class="w-16 h-16 bg-gradient-to-br from-primary-600 to-accent-500 rounded-2xl flex items-center justify-center shadow-lg">
            <span class="text-white text-2xl font-bold">T</span>
          </div>
        </RouterLink>
        <h2 class="text-3xl font-bold text-gray-900 mb-2">Criar Conta</h2>
        <p class="text-gray-600">Junte-se à comunidade TrocaAi</p>
      </div>

      <!-- Card -->
      <div class="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <form @submit.prevent="handleRegister" class="space-y-6">
          <!-- Nome -->
          <div>
            <label for="nome" class="block text-sm font-medium text-gray-700 mb-2">
              Nome Completo
            </label>
            <input
              id="nome"
              v-model="form.nome"
              @input="clearError('nome')"
              type="text"
              autocomplete="name"
              placeholder="Digite seu nome completo"
              :class="[
                'input',
                errors.nome ? 'border-red-500 focus:ring-red-500' : ''
              ]"
            />
            <p v-if="errors.nome" class="mt-1 text-sm text-red-600">
              {{ errors.nome }}
            </p>
          </div>

          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              v-model="form.email"
              @input="clearError('email')"
              type="email"
              autocomplete="email"
              placeholder="seu@email.com"
              :class="[
                'input',
                errors.email ? 'border-red-500 focus:ring-red-500' : ''
              ]"
            />
            <p v-if="errors.email" class="mt-1 text-sm text-red-600">
              {{ errors.email }}
            </p>
          </div>

          <!-- Senha -->
          <div>
            <label for="senha" class="block text-sm font-medium text-gray-700 mb-2">
              Senha
            </label>
            <input
              id="senha"
              v-model="form.senha"
              @input="clearError('senha')"
              type="password"
              autocomplete="new-password"
              placeholder="Mínimo 6 caracteres"
              :class="[
                'input',
                errors.senha ? 'border-red-500 focus:ring-red-500' : ''
              ]"
            />
            <p v-if="errors.senha" class="mt-1 text-sm text-red-600">
              {{ errors.senha }}
            </p>
          </div>

          <!-- Confirmar Senha -->
          <div>
            <label for="confirmarSenha" class="block text-sm font-medium text-gray-700 mb-2">
              Confirmar Senha
            </label>
            <input
              id="confirmarSenha"
              v-model="form.confirmarSenha"
              @input="clearError('confirmarSenha')"
              type="password"
              autocomplete="new-password"
              placeholder="Digite a senha novamente"
              :class="[
                'input',
                errors.confirmarSenha ? 'border-red-500 focus:ring-red-500' : ''
              ]"
            />
            <p v-if="errors.confirmarSenha" class="mt-1 text-sm text-red-600">
              {{ errors.confirmarSenha }}
            </p>
          </div>

          <!-- Botão de Cadastro -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full btn btn-primary py-3 text-base font-semibold"
          >
            <span v-if="loading" class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Cadastrando...
            </span>
            <span v-else>Criar Conta</span>
          </button>
        </form>

        <!-- Divider -->
        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-200"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-4 bg-white text-gray-500">Já tem uma conta?</span>
            </div>
          </div>
        </div>

        <!-- Link para Login -->
        <div class="mt-6 text-center">
          <RouterLink
            to="/login"
            class="text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            Fazer Login
          </RouterLink>
        </div>
      </div>

      <!-- Termos -->
      <p class="mt-8 text-center text-xs text-gray-500">
        Ao criar uma conta, você concorda com nossos
        <a href="#" class="text-primary-600 hover:text-primary-700">Termos de Serviço</a>
        e
        <a href="#" class="text-primary-600 hover:text-primary-700">Política de Privacidade</a>
      </p>
    </div>
  </div>
</template>
