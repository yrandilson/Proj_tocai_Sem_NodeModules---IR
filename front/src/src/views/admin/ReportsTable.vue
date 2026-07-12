<script setup lang="ts">
/**
 * @file Componente que renderiza a tabela de denúncias.
 * Recebe a lista de denúncias e emite eventos para interações do usuário.
 */
import { ref } from 'vue';
import type { PropType } from 'vue';
import { ReportStatus, type Report } from '@/types/index';
import { formatRelativeTime } from '@/components/date-utils';

const props = defineProps({
  /** A lista de denúncias a ser exibida na tabela. */
  reports: {
    type: Array as PropType<Report[]>,
    required: true,
  },
  /** O ID da denúncia cujo status está sendo atualizado. */
  updatingStatusReportId: {
    type: Number as PropType<number | null>,
    default: null,
  },
});

const emit = defineEmits<{
  (e: 'update:status', reportId: number, newStatus: ReportStatus): void;
}>();

/** ID da denúncia atualmente expandida para mostrar detalhes. */
const expandedReportId = ref<number | null>(null);

/** Opções de status disponíveis para uma denúncia. */
const statusOptions: ReportStatus[] = [
  ReportStatus.PENDENTE,
  ReportStatus.EM_ANALISE,
  ReportStatus.RESOLVIDA,
  ReportStatus.REJEITADA,
];

/** Mapeamento de status para classes de cor do Tailwind CSS. */
const statusColors: Record<ReportStatus, string> = {
  [ReportStatus.PENDENTE]: 'bg-yellow-100 text-yellow-800',
  [ReportStatus.EM_ANALISE]: 'bg-blue-100 text-blue-800',
  [ReportStatus.RESOLVIDA]: 'bg-green-100 text-green-800',
  [ReportStatus.REJEITADA]: 'bg-red-100 text-red-800',
};

/**
 * Alterna a exibição dos detalhes de uma denúncia.
 * @param {number} reportId - O ID da denúncia a ser expandida/recolhida.
 */
const toggleExpand = (reportId: number) => {
  expandedReportId.value = expandedReportId.value === reportId ? null : reportId;
};

/**
 * Emite um evento para o componente pai para atualizar o status.
 * @param {number} reportId - O ID da denúncia.
 * @param {Event} event - O evento de mudança do select.
 */
const handleStatusChange = (reportId: number, event: Event) => {
  const newStatus = (event.target as HTMLSelectElement).value as ReportStatus;
  emit('update:status', reportId, newStatus);
};
</script>

<template>
  <div class="bg-white shadow-md rounded-lg overflow-x-auto">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Denunciante</th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Denunciado</th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Motivo</th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <template v-for="report in reports" :key="report.id">
          <tr class="hover:bg-gray-50 cursor-pointer" @click="toggleExpand(report.id)">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{{ report.id }}</td>
            
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
              <RouterLink v-if="report.reporter" :to="`/perfil/${report.reporter.id}`" class="hover:underline text-blue-600" @click.stop>
                {{ report.reporter.nome }}
              </RouterLink>
              <span v-else class="text-gray-400">Anônimo</span>
            </td>

            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
              <div v-if="report.reportedUser">
                <RouterLink :to="`/perfil/${report.reportedUser.id}`" class="hover:underline text-blue-600" @click.stop>
                  {{ report.reportedUser.nome }}
                </RouterLink>
              </div>
              <div v-if="report.reportedItem">
                <RouterLink :to="`/items/${report.reportedItem.id}`" class="text-xs text-gray-500 hover:underline" @click.stop>
                  (Item: {{ report.reportedItem.titulo }})
                </RouterLink>
              </div>
            </td>

            <td class="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" :title="report.reason">
              {{ report.reason }}
            </td>

            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatRelativeTime(report.createdAt) }}
            </td>

            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <select
                :value="report.status"
                @change="handleStatusChange(report.id, $event)"
                @click.stop
                class="text-xs font-semibold rounded-full px-2 py-1 border-none focus:ring-2 focus:ring-offset-1 transition-opacity"
                :class="[statusColors[report.status], { 'opacity-50 cursor-not-allowed': updatingStatusReportId === report.id }]"
                :disabled="updatingStatusReportId === report.id"
              >
                <option v-for="status in statusOptions" :key="status" :value="status">
                  {{ status.replace('_', ' ') }}
                </option>
              </select>
            </td>
          </tr>
          <tr v-if="expandedReportId === report.id">
            <td colspan="6" class="p-4 bg-gray-50">
              <div class="p-4 bg-white rounded-md border">
                <h4 class="font-bold text-gray-700 mb-2">Descrição Detalhada:</h4>
                <p class="text-sm text-gray-600 whitespace-pre-wrap">
                  {{ report.description || 'Nenhuma descrição fornecida.' }}
                </p>
              </div>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>