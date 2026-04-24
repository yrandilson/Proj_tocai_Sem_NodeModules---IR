<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import AdminSidebar from '@/components/AdminSidebar.vue';
import { useChatStore } from '@/stores/chat';

const authStore = useAuthStore();
const chatStore = useChatStore();
const router = useRouter();
const showProfileMenu = ref(false);

// --- FUNÇÃO DE LOGOUT CORRIGIDA E FINAL ---
import { useToast } from '@/composables/useToast';
const toast = useToast();
const handleLogout = async () => {
  try {
    chatStore.resetStore?.();
    authStore.logout();
    toast.info('Saindo...');
    // Usa o router para uma navegação mais limpa e depois força o reload para garantir um estado limpo.
    await router.push('/login');
  } catch (e) {
    console.error('Logout admin falhou', e);
    toast.error('Erro ao sair');
  }
};
</script>
<template>
  <div class="min-h-screen bg-gray-50 flex">
    <AdminSidebar />
    <div class="flex-1 flex flex-col min-w-0">
      <header class="bg-white border-b h-16 flex items-center justify-between px-6">
        <nav class="text-sm">
          <RouterLink to="/admin" class="text-gray-600 hover:text-gray-900">Admin</RouterLink>
          <span class="text-gray-400 mx-2">/</span>
          <span class="text-gray-900 font-medium">{{ $route.meta.title || 'Dashboard' }}</span>
        </nav>
        <div 
          class="relative"
          @mouseenter="showProfileMenu = true"
          @mouseleave="showProfileMenu = false"
        >
          <button class="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg">
            <div class="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {{ authStore.user?.nome.charAt(0).toUpperCase() }}
            </div>
            <div class="hidden md:block text-left">
              <p class="text-sm font-medium">{{ authStore.user?.nome }}</p>
            </div>
          </button>
          <transition name="dropdown">
            <div v-if="showProfileMenu" class="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border z-50">
              <button @click="handleLogout" class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                Sair
              </button>
            </div>
          </transition>
        </div>
      </header>
      <main class="flex-1 overflow-y-auto p-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>
<style scoped>
.dropdown-enter-active, .dropdown-leave-active { transition: all 0.2s ease; }
.dropdown-enter-from, .dropdown-leave-to { opacity: 0; transform: translateY(-10px); }
</style>
