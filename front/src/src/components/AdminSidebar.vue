<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const collapsed = ref(false);

const menuItems = [
  { icon: '📊', label: 'Dashboard', path: '/admin' },
  { icon: '👥', label: 'Usuários', path: '/admin/users' },
  { icon: '📦', label: 'Itens', path: '/admin/items' },
  { icon: '🚨', label: 'Denúncias', path: '/admin/reports' },
  { icon: '⭐', label: 'Avaliações', path: '/admin/ratings' },
  // Adicione mais itens de menu aqui
];

const toggleSidebar = () => collapsed.value = !collapsed.value;
</script>

<template>
  <div :class="['bg-white border-r transition-all duration-300 flex flex-col', collapsed ? 'w-20' : 'w-64']">
    <div class="h-16 flex items-center justify-between px-4 border-b">
      <div v-if="!collapsed" class="flex items-center space-x-2">
        <div class="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
          <span class="text-white text-lg font-bold">T</span>
        </div>
        <span class="font-bold text-gray-900">Admin</span>
      </div>
      <button @click="toggleSidebar" class="p-2 hover:bg-gray-100 rounded-lg">
        <svg :class="['w-5 h-5 text-gray-600 transition-transform', collapsed && 'rotate-180']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
        </svg>
      </button>
    </div>
    <nav class="flex-1 p-4 space-y-2">
      <RouterLink v-for="item in menuItems" :key="item.path" :to="item.path" :class="['flex items-center px-3 py-3 rounded-lg group', route.path === item.path ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' : 'text-gray-700 hover:bg-gray-100']">
        <span class="text-2xl">{{ item.icon }}</span>
        <span v-if="!collapsed" class="ml-3 font-medium text-sm">{{ item.label }}</span>
      </RouterLink>
    </nav>
  </div>
</template>
