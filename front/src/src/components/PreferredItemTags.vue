<template>
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-2">Itens desejados na troca</label>
    <div v-if="items.length > 0" class="flex flex-wrap gap-2">
      <div
        v-for="(item, index) in items"
        :key="item.id || item.titulo"
        class="bg-gray-200 rounded-full px-3 py-1 text-sm font-medium text-gray-800 flex items-center"
      >
        <span>{{ item.titulo }}</span>
        <button @click="$emit('remove', index)" class="ml-2 text-gray-500 hover:text-gray-800">
          &times;
        </button>
      </div>
    </div>
    <p v-else class="text-sm text-gray-500">Nenhum item desejado adicionado.</p>
  </div>
</template>

<script setup lang="ts">
import type { Item } from '@/types/index';

defineProps<{ items: Item[] }>();
defineEmits(['remove']);
</script>