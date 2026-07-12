<script setup lang="ts">
defineProps<{
  title: string;
  isOnline?: boolean;
  showBackButton: boolean;
}>();

const emit = defineEmits<{
  (e: 'back'): void;
  (e: 'minimize'): void;
  (e: 'close'): void;
  (e: 'archive'): void;
}>();
</script>

<template>
  <div class="bg-gradient-to-r from-purple-600 to-pink-600 p-4 flex items-center justify-between flex-shrink-0">
    <div class="flex items-center space-x-3 min-w-0">
      <button
        v-if="showBackButton"
        @click="emit('back')"
        class="p-1 hover:bg-white/20 rounded-lg transition flex-shrink-0"
        aria-label="Voltar"
      >
        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <div class="min-w-0">
        <h3 class="text-white font-bold text-lg truncate" :title="title">{{ title }}</h3>
        <p v-if="showBackButton" class="text-white/80 text-xs">
          {{ isOnline ? '🟢 Online' : '⚫ Offline' }}
        </p>
      </div>
    </div>
    <div class="flex items-center space-x-2 flex-shrink-0">
      <button @click="emit('archive')" class="p-2 hover:bg-white/20 rounded-lg transition" aria-label="Arquivar">
        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      </button>
      <button @click="emit('minimize')" class="p-2 hover:bg-white/20 rounded-lg transition" aria-label="Minimizar">
        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
        </svg>
      </button>
      <button @click="emit('close')" class="p-2 hover:bg-white/20 rounded-lg transition" aria-label="Fechar">
        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>
</template>