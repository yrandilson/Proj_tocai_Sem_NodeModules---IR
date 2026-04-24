<script setup lang="ts">
import { RouterView } from 'vue-router';
import AppHeader from '@/components/AppHeader.vue';
import GlobalSpinner from '@/components/GlobalSpinner.vue';
import ToastContainer from '@/components/ToastContainer.vue';
import FloatingChat from '@/components/FloatingChat.vue'; // Importar o FloatingChat
import { useAuthStore } from './stores/auth'; // Importar useAuthStore

const authStore = useAuthStore(); // Inicializar authStore
</script>

<template>
  <div class="flex flex-col min-h-screen font-sans bg-gray-50">
    <AppHeader />
    <main class="flex-grow">
      <RouterView />
    </main>
    <!-- Componentes Globais -->
    <GlobalSpinner />
    <ToastContainer />
    <!-- Adiciona o componente de chat flutuante, que só será visível se o usuário estiver logado -->
    <FloatingChat v-if="authStore.isAuthenticated" />
  </div>
</template>
