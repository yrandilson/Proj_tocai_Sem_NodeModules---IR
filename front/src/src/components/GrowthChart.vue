<script setup lang="ts">
import { computed } from 'vue';
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  type ChartData,
  type ChartOptions,
} from 'chart.js';

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement
);

const props = defineProps<{
  growthData: {
    month: string;
    users: number;
    items: number;
    proposals: number;
  }[];
}>();

const chartData = computed<ChartData<'line'>>(() => ({
  labels: props.growthData.map(d => d.month),
  datasets: [
    {
      label: 'Usuários',
      backgroundColor: '#3b82f6', // blue-500
      borderColor: '#3b82f6',
      data: props.growthData.map(d => d.users),
      tension: 0.3,
    },
    {
      label: 'Itens',
      backgroundColor: '#16a34a', // green-600
      borderColor: '#16a34a',
      data: props.growthData.map(d => d.items),
      tension: 0.3,
    },
    {
      label: 'Propostas',
      backgroundColor: '#9333ea', // purple-600
      borderColor: '#9333ea',
      data: props.growthData.map(d => d.proposals),
      tension: 0.3,
    },
  ],
}));

const chartOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
};
</script>

<template>
  <Line :data="chartData" :options="chartOptions" />
</template>