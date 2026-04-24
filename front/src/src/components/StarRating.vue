<script setup lang="ts">
import { ref, watch, defineProps, defineEmits } from 'vue';

const props = defineProps({
  modelValue: {
    type: Number,
    default: 0
  },
  readOnly: {
    type: Boolean,
    default: false
  },
  maxStars: {
    type: Number,
    default: 5
  }
});

const emit = defineEmits(['update:modelValue']);

const rating = ref(props.modelValue);
const hoverRating = ref(0);

watch(() => props.modelValue, (newValue) => {
  rating.value = newValue;
});

const setRating = (value: number) => {
  if (props.readOnly) return;
  rating.value = value;
  emit('update:modelValue', value);
};

const setHoverRating = (value: number) => {
  if (props.readOnly) return;
  hoverRating.value = value;
};
</script>

<template>
  <div class="flex items-center space-x-1" :class="{ 'cursor-pointer': !readOnly }">
    <svg
      v-for="star in maxStars"
      :key="star"
      @click="setRating(star)"
      @mouseenter="setHoverRating(star)"
      @mouseleave="setHoverRating(0)"
      class="w-6 h-6 transition-colors"
      :class="[
        (hoverRating >= star || rating >= star)
          ? 'text-yellow-400'
          : 'text-gray-300',
        readOnly ? '' : 'hover:text-yellow-300'
      ]"
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.368-2.448a1 1 0 00-1.175 0l-3.368 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.05 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.049 2.927z" />
    </svg>
  </div>
</template>