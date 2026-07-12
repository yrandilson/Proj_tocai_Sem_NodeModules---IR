<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const goBack = () => {
  router.back();
};
</script>

<template>
  <div class="min-h-[calc(100vh-16rem)] flex items-center justify-center px-4">
    <div class="text-center max-w-lg">
      <!-- Emoji -->
      <div class="text-9xl mb-8 animate-bounce">
        🤔
      </div>

      <!-- Título -->
      <h1 class="text-6xl font-bold text-gray-900 mb-4">
        404
      </h1>

      <h2 class="text-3xl font-bold text-gray-800 mb-4">
        Página não encontrada
      </h2>

      <!-- Descrição -->
      <p class="text-gray-600 mb-8">
        Ops! A página que você está procurando não existe ou foi movida.
        Que tal voltar para a página inicial?
      </p>

      <!-- Botões -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <RouterLink to="/" class="btn btn-primary">
          🏠 Ir para Início
        </RouterLink>
        <button @click="goBack" class="btn btn-secondary">
          ← Voltar
        </button>
      </div>

      <!-- Links úteis -->
      <div class="mt-12 pt-8 border-t border-gray-200">
        <p class="text-sm text-gray-600 mb-4">Links úteis:</p>
        <div class="flex flex-wrap gap-4 justify-center text-sm">
          <RouterLink to="/" class="text-primary-600 hover:text-primary-700">
            Início
          </RouterLink>
          <RouterLink to="/login" class="text-primary-600 hover:text-primary-700">
            Login
          </RouterLink>
          <RouterLink to="/register" class="text-primary-600 hover:text-primary-700">
            Cadastro
          </RouterLink>
          <RouterLink to="/meus-itens" class="text-primary-600 hover:text-primary-700">
            Meus Itens
          </RouterLink>
        </div>
      </div>

      <!-- Mensagem divertida -->
      <div class="mt-8 p-4 bg-blue-50 rounded-lg">
        <p class="text-blue-800 text-sm">
          💡 <strong>Dica:</strong> Se você chegou aqui por engano, pode ser que o link esteja quebrado.
          Tente buscar o que precisa na página inicial!
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

.animate-bounce {
  animation: bounce 2s ease-in-out infinite;
}
</style>
