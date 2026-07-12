<script setup lang="ts">
import { ref, computed } from 'vue';

const props = defineProps<{
  modelValue: File[];
  maxFiles?: number;
  maxSizeMB?: number;
}>();

const emit = defineEmits<{
  'update:modelValue': [files: File[]];
}>();

const maxFiles = props.maxFiles || 5;
const maxSizeMB = props.maxSizeMB || 5;
const maxSizeBytes = maxSizeMB * 1024 * 1024;

const dragOver = ref(false);
const error = ref('');

const files = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    addFiles(Array.from(target.files));
  }
};

const handleDrop = (event: DragEvent) => {
  dragOver.value = false;
  if (event.dataTransfer?.files) {
    addFiles(Array.from(event.dataTransfer.files));
  }
};

const addFiles = (newFiles: File[]) => {
  error.value = '';

  // Validar tipo de arquivo
  const validFiles = newFiles.filter(file => {
    if (!file.type.startsWith('image/')) {
      error.value = 'Apenas imagens são permitidas';
      return false;
    }
    if (file.size > maxSizeBytes) {
      error.value = `Arquivo muito grande. Máximo: ${maxSizeMB}MB`;
      return false;
    }
    return true;
  });

  // Verificar limite de arquivos
  const currentCount = files.value.length;
  const remainingSlots = maxFiles - currentCount;

  if (validFiles.length > remainingSlots) {
    error.value = `Máximo de ${maxFiles} imagens permitido`;
    validFiles.splice(remainingSlots);
  }

  files.value = [...files.value, ...validFiles];
};

const removeFile = (index: number) => {
  files.value = files.value.filter((_, i) => i !== index);
};

const getPreviewUrl = (file: File): string => {
  return URL.createObjectURL(file);
};

const triggerFileInput = () => {
  // Find the file input within this component and trigger click
  const el = document.querySelector('.space-y-4 input[type=file]') as HTMLInputElement | null;
  if (el) el.click();
};
</script>

<template>
  <div class="space-y-4">
    <!-- Drop Zone -->
    <div
      @dragover.prevent="dragOver = true"
      @dragleave="dragOver = false"
      @drop.prevent="handleDrop"
      :class="[
        'border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer',
        dragOver ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'
      ]"
      @click="triggerFileInput"
    >
      <input
        ref="fileInput"
        type="file"
        multiple
        accept="image/*"
        class="hidden"
        @change="handleFileSelect"
      />

      <svg
        class="mx-auto h-12 w-12 text-gray-400"
        stroke="currentColor"
        fill="none"
        viewBox="0 0 48 48"
      >
        <path
          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>

      <p class="mt-4 text-sm text-gray-600">
        <span class="font-semibold text-primary-600">Clique para fazer upload</span>
        ou arraste e solte
      </p>
      <p class="text-xs text-gray-500 mt-1">
        PNG, JPG, GIF até {{ maxSizeMB }}MB (máximo {{ maxFiles }} imagens)
      </p>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="p-3 bg-red-50 border border-red-200 rounded-lg">
      <p class="text-red-800 text-sm">{{ error }}</p>
    </div>

    <!-- Preview Grid -->
    <div v-if="files.length > 0" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <div
        v-for="(file, index) in files"
        :key="index"
        class="relative group"
      >
        <img
          :src="getPreviewUrl(file)"
          :alt="file.name"
          class="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
        />
        <button
          type="button"
          @click="removeFile(index)"
          class="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div class="absolute bottom-2 left-2 right-2">
          <p class="text-xs text-white bg-black bg-opacity-50 px-2 py-1 rounded truncate">
            {{ file.name }}
          </p>
        </div>
      </div>
    </div>

    <!-- Info -->
    <div class="text-xs text-gray-500">
      {{ files.length }} / {{ maxFiles }} imagens selecionadas
    </div>
  </div>
</template>
