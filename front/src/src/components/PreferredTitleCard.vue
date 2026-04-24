<template>
  <div
    class="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200 transition-all duration-200"
  >
    <div class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mr-3">
      <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h10a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" />
      </svg>
    </div>
    <div class="flex-1">
      <p class="font-semibold text-gray-800 line-clamp-1">
        {{ title }}
      </p>
      <p class="text-sm text-gray-500">
        Item Desejado
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ title: string }>();
</script>

