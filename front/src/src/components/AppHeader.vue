<script setup lang="ts">
import { ref, computed, onMounted, watch, Teleport } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useChatStore } from '@/stores/chat';
import { useNotificationStore } from '@/stores/notification';
import { useToast } from '@/composables/useToast';
import NotificationDropdown from './NotificationDropdown.vue';

const router = useRouter();
const authStore = useAuthStore();
const chatStore = useChatStore();
const notificationStore = useNotificationStore();
const isProfileMenuOpen = ref(false);
const isLoggingOut = ref(false);

const isMobileMenuOpen = ref(false);
const toast = useToast();

onMounted(() => {
  if (authStore.isAuthenticated) {
    notificationStore.fetchNotifications();
    chatStore.connect();
  }
});

const totalUnreadCount = computed(() => {
  const notifCount = notificationStore.unreadCount || 0;
  const chatCount = chatStore.unreadCount || 0;
  return notifCount + chatCount;
});

const handleLogout = async () => {
  if (isLoggingOut.value) return;
  isLoggingOut.value = true;
  try {
    chatStore.resetStore();
    isProfileMenuOpen.value = false; // Fecha o menu ao clicar em sair
    notificationStore.clearAll?.();
    authStore.logout();

    await router.push('/login');
    toast.success('Você saiu com sucesso!');
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    toast.error('Erro ao sair');
  } finally {
    isLoggingOut.value = false;
  }
};

// Fecha o menu móvel ao trocar de rota
watch(() => router.currentRoute.value, () => {
  isProfileMenuOpen.value = false; // Fecha o menu de perfil ao navegar
  isMobileMenuOpen.value = false;
});

// Impede rolagem quando o menu está aberto
watch(isMobileMenuOpen, (isOpen) => {
  document.body.style.overflow = isOpen ? 'hidden' : '';
});
</script>

<template>
  <header class="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <RouterLink to="/" class="flex items-center space-x-3 group">
          <div class="w-10 h-10 bg-gradient-to-br from-primary-600 to-accent-500 rounded-lg flex items-center justify-center">
            <span class="text-white text-xl font-bold">T</span>
          </div>
          <div class="hidden sm:block">
            <span class="text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">TrocaAi</span>
          </div>
        </RouterLink>

        <!-- Menu Desktop -->
        <nav class="hidden lg:flex items-center space-x-2">
          <RouterLink to="/" class="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100">Início</RouterLink>
          <RouterLink to="/mapa" class="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100">Mapa</RouterLink>
          <template v-if="authStore.isAuthenticated">
            <RouterLink to="/meus-itens" class="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100">Meus Itens</RouterLink>
            <RouterLink to="/propostas-recebidas" class="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100">Propostas</RouterLink>
            <RouterLink v-if="authStore.isAdmin" to="/admin" class="px-3 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-accent-500 to-purple-600">Admin</RouterLink>
          </template>
        </nav>

        <!-- Ações -->
        <div class="flex items-center space-x-2">
          <template v-if="authStore.isAuthenticated">
            <RouterLink to="/novo-item" class="btn btn-primary px-3 py-1.5 text-sm hidden md:flex">➕ Novo Item</RouterLink>

            <!-- Notificações -->
            <NotificationDropdown />

            <!-- Avatar + Menu -->
            <div 
              class="relative"
              @mouseenter="isProfileMenuOpen = true"
              @mouseleave="isProfileMenuOpen = false"
            >
              <button class="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100">
                <div class="w-9 h-9 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white font-bold">
                  {{ authStore.user?.nome.charAt(0).toUpperCase() }}
                </div>
              </button>
              <transition name="fade">
                <div v-if="isProfileMenuOpen" class="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border py-2 z-[2000]" @click="isProfileMenuOpen = false">
                  <div class="px-4 py-3 border-b">
                    <p class="font-medium">{{ authStore.user?.nome }}</p>
                    <p class="text-xs text-gray-500 truncate">{{ authStore.user?.email }}</p>
                  </div>
                  <RouterLink to="/perfil" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Meu Perfil</RouterLink>
                  <RouterLink to="/meus-favoritos" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Meus Favoritos</RouterLink>
                  <RouterLink to="/propostas" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Minhas Propostas</RouterLink>
                  <div class="border-t my-1"></div>
                  <button 
                    @click="handleLogout" 
                    :disabled="isLoggingOut"
                    class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-wait flex items-center"
                  >
                    <span v-if="!isLoggingOut">Sair</span>
                    <span v-else>Saindo...</span>
                  </button>
                </div>
              </transition>
            </div>
          </template>

          <template v-else>
            <RouterLink to="/login" class="px-4 py-2 text-sm font-medium hover:text-primary-600">Entrar</RouterLink> 
            <RouterLink to="/register" class="btn btn-primary px-3 py-1.5 text-sm">Cadastrar</RouterLink>
          </template>

          <!-- Botão do menu móvel -->
          <button @click="isMobileMenuOpen = true" class="lg:hidden p-2 rounded-md hover:bg-gray-100">
            <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- MENU MÓVEL TELEPORTADO PARA O BODY -->
    <Teleport to="body">
      <transition name="fade">
        <div
          v-if="isMobileMenuOpen"
          class="fixed inset-0 z-[999] flex bg-black/60 backdrop-blur-sm"
          @click="isMobileMenuOpen = false"
        >
          <!-- Painel lateral -->
          <transition name="slide">
            <div
              v-if="isMobileMenuOpen"
              @click.stop
              class="relative w-72 max-w-[80vw] bg-white h-full flex flex-col shadow-2xl"
            >
              <div class="p-4 border-b flex items-center justify-between">
                <span class="font-bold text-lg">Menu</span>
                <button @click="isMobileMenuOpen = false" class="p-2 rounded-md hover:bg-gray-100">
                  <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              <nav class="flex-1 p-4 space-y-2 overflow-y-auto">
                <RouterLink to="/" @click="isMobileMenuOpen = false" class="block px-4 py-3 rounded-lg hover:bg-gray-100">🏠 Início</RouterLink>
                <RouterLink to="/mapa" @click="isMobileMenuOpen = false" class="block px-4 py-3 rounded-lg hover:bg-gray-100">🗺️ Mapa</RouterLink>

                <template v-if="authStore.isAuthenticated">
                  <div class="border-t my-2"></div>
                  <RouterLink to="/meus-itens" @click="isMobileMenuOpen = false" class="block px-4 py-3 rounded-lg hover:bg-gray-100">📦 Meus Itens</RouterLink>
                  <RouterLink to="/propostas-recebidas" @click="isMobileMenuOpen = false" class="block px-4 py-3 rounded-lg hover:bg-gray-100">📥 Propostas</RouterLink>
                  <RouterLink v-if="authStore.isAdmin" to="/admin" @click="isMobileMenuOpen = false" class="block px-4 py-3 rounded-lg hover:bg-gray-100">👑 Admin</RouterLink>
                </template>

                <template v-else>
                  <div class="border-t my-2"></div>
                  <RouterLink to="/login" @click="isMobileMenuOpen = false" class="block px-4 py-3 rounded-lg hover:bg-gray-100">Entrar</RouterLink>
                  <RouterLink to="/register" @click="isMobileMenuOpen = false" class="block px-4 py-3 rounded-lg text-white bg-primary-600 hover:bg-primary-700">Cadastrar</RouterLink>
                </template>
              </nav>
            </div>
          </transition>
        </div>
      </transition>
    </Teleport>
  </header>
</template>

<style lang="postcss" scoped>
/* Animações suaves */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease-in-out;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease-in-out;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}

/* Link ativo */
.router-link-exact-active {
  @apply bg-primary-50 !bg-primary-50 text-primary-700 font-semibold;
}
</style>
