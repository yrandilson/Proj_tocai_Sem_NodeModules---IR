<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useToast } from '@/composables/useToast';
import Toast from '@/components/Toast.vue';

const toastRef = ref<InstanceType<typeof Toast> | null>(null);
const { _bus } = useToast();

const onToast = (event: any) => {
  toastRef.value?.show(event.message, event.type, event.duration);
};

onMounted(() => {
  _bus.on(onToast);
});

onUnmounted(() => {
  _bus.off(onToast);
});
</script>

<template>
  <Toast ref="toastRef" />
</template>
