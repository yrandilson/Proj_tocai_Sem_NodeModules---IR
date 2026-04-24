<template>
  <RouterLink
    :to="`/items/${item.id}`"
    class="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-primary-50 hover:border-primary-300 transition-all duration-200 group"
  >
    <img
      :src="item.imagens?.[0]?.url || '/placeholder.png'"
      alt="Imagem do item"
      class="w-14 h-14 object-cover rounded-md mr-4"
    />
    <div class="flex-1">
      <p class="font-semibold text-gray-800 group-hover:text-primary-700 line-clamp-1">
        {{ item.titulo }}
      </p>
      <p class="text-sm text-gray-500">
        {{ item.categoria }}
      </p>
    </div>
    <svg class="w-5 h-5 text-gray-400 group-hover:text-primary-600 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
  </RouterLink>
</template>

<script setup lang="ts">
import type { Item } from '@/types/index';

defineProps<{ item: Item }>();
</script>