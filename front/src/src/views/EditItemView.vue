<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useItemStore } from '@/stores/item';
import { useToast } from '@/composables/useToast';
import LocationPicker from '@/components/LocationPicker.vue';
import ImageUpload from '@/components/ImageUpload.vue';
import ItemSearchModal from '@/components/ItemSearchModal.vue';
import PreferredItemTags from '@/components/PreferredItemTags.vue';
import { type Item, ItemStatus } from '@/types/index'; // Importar ItemStatus

const route = useRoute();
const router = useRouter();
const itemStore = useItemStore();
const toast = useToast();

// Estados do formulário
const itemData = ref<Partial<Item>>({});
const imagens = ref<File[]>([]);
const location = ref({
  cidade: '', estado: '', latitude: undefined as number | undefined, longitude: undefined as number | undefined, cep: '', bairro: ''
});

const loading = ref(false);
const loadingItem = ref(true);

// Estados para as novas funcionalidades
const isModalOpen = ref(false);
const selectedPreferredItems = ref<Item[]>([]);

const statusOptions = [
  { value: 'disponivel', label: 'Disponível' },
  { value: 'em_negociacao', label: 'Em Negociação' },
  { value: 'trocado', label: 'Trocado' }
];

const categories = computed(() => itemStore.categories);

onMounted(async () => {
  try {
    const id = Number(route.params.id);
    await itemStore.fetchCategories();
    const item = await itemStore.fetchItemDetails(id);
    
    if (item) {
      itemData.value = { ...item };
      // Cast para 'any' para evitar erros de tipo complexos, já que a UI só precisa de 'id' e 'titulo'.
      // Isso garante que as preferências salvas sejam exibidas.
      selectedPreferredItems.value = (item.tradePreferences as any) || [];
      location.value = {
        cidade: item.cidade || '',
        estado: item.estado || '',
        latitude: item.latitude,
        longitude: item.longitude,
        cep: item.cep || '',
        bairro: item.bairro || ''
      };
    } else {
      throw new Error('Item não encontrado');
    }
  } catch (err) {
    toast.error('Item não encontrado ou você não tem permissão para editá-lo');
    router.push('/meus-itens');
  } finally {
    loadingItem.value = false;
  }
});

const handleSubmit = async () => {
  loading.value = true;
  try {
    const id = Number(route.params.id);
    
    // 1. Coleta os dados brutos do formulário
    const updatedData: Partial<Item> = {
      titulo: itemData.value.titulo,
      descricao: itemData.value.descricao,
      categoria: itemData.value.categoria,
      ...location.value
    };

    // 2. Coleta os títulos das preferências
    const preferredTitles = selectedPreferredItems.value.map(item => item.titulo);

    // 3. Passa os dados brutos e os arquivos para a store
    await itemStore.updateItem(id, updatedData, imagens.value, preferredTitles);

    toast.success('Item atualizado com sucesso!');
    router.push('/meus-itens');
  } catch (err: any) {
    toast.error(err.response?.data?.error || 'Erro ao atualizar item');
  } finally {
    loading.value = false;
  }
};

const updatePreferredItems = (items: Item[]) => {
  selectedPreferredItems.value = items;
};

const removePreferredItem = (index: number): void => {
  selectedPreferredItems.value.splice(index, 1);
};
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Editar Item</h1>
        <p class="text-gray-600">Atualize as informações do seu item</p>
      </div>

      <!-- Loading -->
      <div v-if="loadingItem || !itemData" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <p class="mt-4 text-gray-600">Carregando item...</p>
      </div>

      <!-- Formulário -->
      <form v-else @submit.prevent="handleSubmit" class="space-y-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div class="space-y-6">
            <!-- Título -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Título *
              </label>
              <input
                v-model="itemData.titulo"
                type="text"
                required
                placeholder="Ex: Notebook Dell Inspiron 15"
                class="input"
                minlength="3"
              />
              <p class="text-xs text-gray-500 mt-1">Mínimo 3 caracteres</p>
            </div>

            <!-- Categoria -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Categoria *
              </label>
              <select v-model="itemData.categoria" required class="input">
                <option disabled value="">Selecione uma categoria</option>
                <option v-for="cat in categories" :key="cat" :value="cat">
                  {{ cat.charAt(0).toUpperCase() + cat.slice(1) }}
                </option>
              </select>
            </div>

            <!-- Descrição -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Descrição *
              </label>
              <textarea
                v-model="itemData.descricao"
                rows="6"
                required
                placeholder="Descreva o item em detalhes..."
                class="input"
                minlength="10"
              ></textarea>
              <p class="text-xs text-gray-500 mt-1">Mínimo 10 caracteres</p>
            </div>
          </div>
          <div class="space-y-6">
            <div class="bg-white rounded-xl shadow-lg border p-6">
              <h2 class="text-xl font-bold text-gray-800 mb-4">Preferências de Troca</h2>
              <PreferredItemTags :items="selectedPreferredItems" @remove="removePreferredItem" />
              <button
                type="button"
                @click="isModalOpen = true"
                class="mt-4 text-sm text-primary-600 hover:text-primary-800 font-semibold"
              >
                + Adicionar ou remover itens desejados
              </button>
            </div>
            <div class="bg-white rounded-xl shadow-lg border p-6">
              <h2 class="text-xl font-bold text-gray-800 mb-4">Localização</h2>
              <LocationPicker v-model="location" />
            </div>
            <div class="bg-white rounded-xl shadow-lg border p-6">
              <h2 class="text-xl font-bold text-gray-800 mb-4">Novas Imagens</h2>
              <ImageUpload v-model="imagens" :max-files="5" :max-size-m-b="5" />
              <p class="text-xs text-gray-500 mt-2">Envie novas imagens para substituir as antigas.</p>
            </div>
          </div>
        </div>

        <div class="pt-6 border-t flex flex-col sm:flex-row gap-4">
          <RouterLink to="/meus-itens" class="btn btn-secondary flex-1">
            Cancelar
          </RouterLink>
          <button type="submit" :disabled="loading" class="btn btn-primary flex-1">
            {{ loading ? 'Salvando...' : 'Salvar Alterações' }}
          </button>
        </div>
      </form>

      <ItemSearchModal
        v-model="isModalOpen"
        :already-selected="selectedPreferredItems"
        @confirm="updatePreferredItems"
      />

    </div>
  </div>
</template>
