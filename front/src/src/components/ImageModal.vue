<script setup lang="ts">
defineProps<{
  src: string;
  isOpen: boolean;
}>();

const emit = defineEmits(['close']);
</script>

<template>
  <Transition name="fade">
    <div
      v-if="isOpen"
      @click.self="emit('close')"
      class="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
    >
      <div class="relative max-w-4xl max-h-full">
        <img :src="src" alt="Visualização ampliada" class="object-contain max-w-full max-h-[90vh] rounded-lg shadow-2xl" />
        <button
          @click="emit('close')"
          class="absolute -top-4 -right-4 bg-white text-gray-800 rounded-full p-2 hover:bg-gray-200 transition-colors"
          aria-label="Fechar imagem"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
