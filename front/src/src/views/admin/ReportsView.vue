<script setup lang="ts">
/**
 * @file Componente para a página de gerenciamento de denúncias do painel de administração.
 * Permite que administradores visualizem, filtrem e atualizem o status das denúncias feitas na plataforma.
 */

import { ref, onMounted, computed } from 'vue';
import api from '@/services/api';
import { useToast } from '@/composables/useToast';
import { ReportStatus, type Report } from '@/types/index'; // Importação de ReportStatus como valor
import ReportsTable from './ReportsTable.vue'; // Caminho corrigido para o componente ReportsTable

/** Lista de denúncias a serem exibidas. */
const reports = ref<Report[]>([]);
/** Estado de carregamento para a busca de denúncias. */
const loading = ref(true);
/** Instância do composable de toast para exibir notificações. */
const toast = useToast();
/** ID da denúncia cujo status está sendo atualizado, para feedback visual. */
const updatingStatusReportId = ref<number | null>(null);

/** Estado para o filtro de status. 'all' significa sem filtro. */
const statusFilter = ref<ReportStatus | 'all'>('all');

/** Opções para o seletor de filtro de status. */
const filterOptions: { value: ReportStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos os Status' },
  { value: ReportStatus.PENDENTE, label: 'Pendente' },
  { value: ReportStatus.EM_ANALISE, label: 'Em Análise' },
  { value: ReportStatus.RESOLVIDA, label: 'Resolvido' },
  { value: ReportStatus.REJEITADA, label: 'Rejeitado' },
];

/**
 * Busca a lista de todas as denúncias da API e atualiza o estado do componente.
 * Define o estado de carregamento durante a requisição e trata possíveis erros.
 */
const fetchReports = async () => {
  loading.value = true;
  try {
    const response = await api.get<Report[]>('/api/reports');
    reports.value = response.data;
  } catch (error) {
    toast.error('Erro ao carregar denúncias.');
    console.error(error);
  } finally {
    loading.value = false;
  }
};

/**
 * Atualiza o status de uma denúncia específica via API.
 * @param {number} reportId - O ID da denúncia a ser atualizada.
 * @param {ReportStatus} newStatus - O novo status para a denúncia.
 */
const handleStatusChange = async (reportId: number, newStatus: ReportStatus) => {
  updatingStatusReportId.value = reportId;
  try {
    const response = await api.patch(`/api/reports/${reportId}/status`, { status: newStatus });
    
    // Encontra o report na lista e atualiza seu status para reatividade instantânea
    const reportToUpdate = reports.value.find((report: Report) => report.id === reportId);
    if (reportToUpdate) {
      reportToUpdate.status = response.data.status;
    }
    
    toast.success(`Status da denúncia #${reportId} atualizado.`);
  } catch (error) {
    toast.error('Erro ao atualizar status da denúncia.');
    console.error(error);
  } finally {
    updatingStatusReportId.value = null;
  }
};

/**
 * Propriedade computada que filtra as denúncias com base no `statusFilter`.
 */
const filteredReports = computed(() => {
  if (statusFilter.value === 'all') {
    return reports.value;
  }
  return reports.value.filter((report: Report) => report.status === statusFilter.value);
});

// Busca as denúncias quando o componente é montado.
onMounted(fetchReports);
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-800 mb-6">Gerenciamento de Denúncias</h1>

    <!-- Controles de Filtro -->
    <div class="mb-4 flex justify-end">
      <div>
        <label for="status-filter" class="block text-sm font-medium text-gray-700 mb-1">Filtrar por Status</label>
        <select
          id="status-filter"
          v-model="statusFilter"
          class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option v-for="option in filterOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="text-center py-10">
      <p class="text-gray-500">Carregando denúncias...</p>
    </div>

    <div v-else-if="filteredReports.length === 0" class="text-center py-10 bg-white rounded-lg shadow-sm">
      <p class="text-gray-600 font-semibold">Nenhuma denúncia encontrada para os filtros selecionados.</p>
    </div>

    <ReportsTable v-else :reports="filteredReports" :updating-status-report-id="updatingStatusReportId" @update:status="handleStatusChange" />
  </div>
</template>

<style scoped>
/* Estilos para o select de status parecer um badge */
select {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 0.65em auto;
  padding-right: 1.5rem; /* Espaço para a seta (se houvesse) */
  cursor: pointer;
}
</style>