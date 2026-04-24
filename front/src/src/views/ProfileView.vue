<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

const nome = ref(authStore.user?.nome || '');
const email = ref(authStore.user?.email || '');
const senhaAtual = ref('');
const novaSenha = ref('');
const confirmarSenha = ref('');

const error = ref('');
const success = ref('');
const loading = ref(false);
const showPasswordForm = ref(false);

const user = computed(() => authStore.user);

const roleLabel = computed(() => {
  const labels = {
    admin: 'Administrador',
    verified: 'Usuário Verificado',
    common: 'Usuário Comum'
  };
  return user.value ? labels[user.value.role as keyof typeof labels] : '';
});

const roleBadgeClass = computed(() => {
  return user.value ? `badge badge-${user.value.role}` : '';
});

const handleUpdateProfile = async () => {
  error.value = '';
  success.value = '';
  loading.value = true;

  try {
    await authStore.updateUser({
      nome: nome.value,
      email: email.value
    });

    success.value = 'Perfil atualizado com sucesso!';
    setTimeout(() => success.value = '', 3000);
  } catch (err) {
    error.value = err as string;
  } finally {
    loading.value = false;
  }
};

const handleUpdatePassword = async () => {
  error.value = '';
  success.value = '';

  // Validações
  if (novaSenha.value !== confirmarSenha.value) {
    error.value = 'As senhas não coincidem';
    return;
  }

  if (novaSenha.value.length < 6) {
    error.value = 'A nova senha deve ter pelo menos 6 caracteres';
    return;
  }

  loading.value = true;

  try {
        await authStore.updateUser(({ senha: (novaSenha.value as any) } as any));

    success.value = 'Senha atualizada com sucesso!';
    senhaAtual.value = '';
    novaSenha.value = '';
    confirmarSenha.value = '';
    showPasswordForm.value = false;
    setTimeout(() => success.value = '', 3000);
  } catch (err) {
    error.value = err as string;
  } finally {
    loading.value = false;
  }
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
};
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-2xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Meu Perfil</h1>
        <p class="text-gray-600">Gerencie suas informações pessoais</p>
      </div>

      <!-- Mensagens -->
      <div v-if="success" class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <p class="text-green-800 text-sm">✓ {{ success }}</p>
      </div>

      <div v-if="error" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
        <p class="text-red-800 text-sm">{{ error }}</p>
      </div>

      <!-- Card de Informações -->
      <div class="card mb-6">
        <div class="flex items-center space-x-4 mb-6 pb-6 border-b">
          <div class="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
            <span class="text-primary-700 text-3xl font-bold">
              {{ user?.nome.charAt(0).toUpperCase() }}
            </span>
          </div>
          <div class="flex-1">
            <h2 class="text-2xl font-bold text-gray-900">{{ user?.nome }}</h2>
            <p class="text-gray-600">{{ user?.email }}</p>
            <span :class="roleBadgeClass" class="mt-2">
              {{ roleLabel }}
            </span>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p class="text-gray-600 mb-1">Membro desde</p>
            <p class="font-medium text-gray-900">{{ user?.createdAt ? formatDate(user.createdAt) : '-' }}</p>
          </div>
          <div>
            <p class="text-gray-600 mb-1">Última atualização</p>
            <p class="font-medium text-gray-900">{{ user?.updatedAt ? formatDate(user.updatedAt) : '-' }}</p>
          </div>
        </div>
      </div>

      <!-- Formulário de Edição -->
      <div class="card mb-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Editar Informações</h2>
        
        <form @submit.prevent="handleUpdateProfile" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Nome
            </label>
            <input
              v-model="nome"
              type="text"
              required
              class="input"
              minlength="3"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              v-model="email"
              type="email"
              required
              class="input"
            />
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full btn btn-primary"
          >
            {{ loading ? 'Salvando...' : 'Salvar Alterações' }}
          </button>
        </form>
      </div>

      <!-- Alterar Senha -->
      <div class="card">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Alterar Senha</h2>
        
        <button
          v-if="!showPasswordForm"
          @click="showPasswordForm = true"
          class="btn btn-secondary w-full"
        >
          🔒 Alterar Senha
        </button>

        <form v-else @submit.prevent="handleUpdatePassword" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Nova Senha
            </label>
            <input
              v-model="novaSenha"
              type="password"
              required
              class="input"
              minlength="6"
              placeholder="Digite a nova senha"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Confirmar Nova Senha
            </label>
            <input
              v-model="confirmarSenha"
              type="password"
              required
              class="input"
              minlength="6"
              placeholder="Digite novamente"
            />
          </div>

          <div class="flex space-x-3">
            <button
              type="submit"
              :disabled="loading"
              class="flex-1 btn btn-primary"
            >
              {{ loading ? 'Alterando...' : 'Alterar Senha' }}
            </button>
            <button
              type="button"
              @click="showPasswordForm = false"
              class="btn btn-secondary"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>

      <!-- Dicas de Segurança -->
      <div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p class="text-blue-800 font-medium mb-2">🔐 Dicas de Segurança:</p>
        <ul class="text-blue-700 text-sm space-y-1">
          <li>• Use uma senha forte com pelo menos 6 caracteres</li>
          <li>• Não compartilhe sua senha com ninguém</li>
          <li>• Altere sua senha regularmente</li>
          <li>• Use senhas diferentes para cada serviço</li>
        </ul>
      </div>
    </div>
  </div>
</template>
