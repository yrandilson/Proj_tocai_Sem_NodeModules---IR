<script setup lang="ts">
// Skeleton loader para cards de itens
// Melhora a percepção de velocidade no carregamento
</script>

<template>
  <div class="card border border-gray-200 p-6 animate-pulse">
    <!-- Status Badge -->
    <div class="flex justify-between items-start mb-4">
      <div class="h-6 w-24 bg-gray-200 rounded-full"></div>
      <div class="h-4 w-20 bg-gray-200 rounded-md"></div>
    </div>

    <!-- Título -->
    <div class="h-6 w-3/4 bg-gray-200 rounded-md mb-2"></div>
    
    <!-- Descrição (2 linhas) -->
    <div class="space-y-2 mb-4">
      <div class="h-4 bg-gray-200 rounded-md"></div>
      <div class="h-4 w-5/6 bg-gray-200 rounded-md"></div>
    </div>

    <!-- Footer -->
    <div class="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
      <div class="flex items-center space-x-2">
        <div class="w-7 h-7 bg-gray-200 rounded-full"></div>
        <div class="h-4 w-24 bg-gray-200 rounded-md"></div>
      </div>
      <div class="h-6 w-20 bg-gray-200 rounded-full"></div>
    </div>
  </div>
</template>

<style scoped>
/* Animação de shimmer mais suave */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
