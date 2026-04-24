<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useItemStore } from '@/stores/item';
import { useToast } from '@/composables/useToast';
import LocationPicker from '@/components/LocationPicker.vue';
import ImageUpload from '@/components/ImageUpload.vue';
import ItemSearchModal from '@/components/ItemSearchModal.vue';
import PreferredItemTags from '@/components/PreferredItemTags.vue';
import type { Item } from '@/types/index';

const router = useRouter();
const itemStore = useItemStore();
const toast = useToast();

// Estados do formulário
const titulo = ref('');
const descricao = ref('');
const categoria = ref('');
const imagens = ref<File[]>([]);
const location = ref({
  cidade: '', estado: '', latitude: undefined as number | undefined, longitude: undefined as number | undefined, cep: '', bairro: ''
});
const loading = ref(false);

// Estados para as novas funcionalidades
const isModalOpen = ref(false);
const selectedPreferredItems = ref<Item[]>([]);
const customPreferenceTitle = ref(''); // Estado para a nova preferência customizada

onMounted(async () => {
  await itemStore.fetchCategories();
});

const handleSubmit = async () => {
  if (!titulo.value.trim() || !descricao.value.trim() || !categoria.value) {
    toast.error('Título, descrição e categoria são obrigatórios.');
    return;
  }
  loading.value = true;
  try {
    if (location.value.latitude == null || location.value.longitude == null) {
      toast.info('Atenção: latitude/longitude não preenchidas; o item será cadastrado sem coordenadas. Use "Usar Localização Atual" ou buscar CEP antes de enviar.');
    }
    
    // 1. Coleta os dados brutos do formulário
    const itemData: Partial<Item> = {
      titulo: titulo.value,
      descricao: descricao.value,
      categoria: categoria.value,
      ...location.value
    };

    // 2. Coleta os títulos das preferências
    const preferredTitles = selectedPreferredItems.value.map(item => item.titulo);
    
    // 3. Passa os dados brutos e os arquivos para a store, que será responsável por montar o FormData
    await itemStore.createItem(itemData, imagens.value, preferredTitles);
    
    toast.success('Item cadastrado com sucesso!');
    router.push('/meus-itens');
  } catch (err: any) {
    toast.error(err.response?.data?.error || 'Erro ao cadastrar item');
  } finally {
    loading.value = false;
  }
};

const updatePreferredItems = (items: Item[]) => {
  selectedPreferredItems.value = items;
};

const removePreferredItem = (index: number) => {
  selectedPreferredItems.value.splice(index, 1);
};

const addCustomPreference = () => {
  const title = customPreferenceTitle.value.trim();
  if (title && !selectedPreferredItems.value.some(item => item.titulo === title)) {
    // Cria um objeto "Item" temporário apenas com o título.
    // O ID temporário é útil para a key no v-for e para a função de remover.
    const customItem: Partial<Item> = { id: Date.now(), titulo: title };
    selectedPreferredItems.value.push(customItem as Item);
    customPreferenceTitle.value = ''; // Limpa o input após adicionar
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4">
    <div class="max-w-7xl mx-auto">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Cadastrar Novo Item</h1>
        <p class="text-gray-600 mt-2">Preencha as informações do item que deseja trocar ou doar</p>
      </div>
      
      <form @submit.prevent="handleSubmit" class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div class="space-y-6">
            <div class="bg-white rounded-xl shadow-lg border p-6">
                <h2 class="text-xl font-bold text-gray-800 mb-4">Informações Básicas</h2>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Título do Item *</label>
                        <input v-model="titulo" type="text" required placeholder="Ex: Notebook Dell Inspiron 15" class="input" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Categoria *</label>
                        <!-- Input com datalist para permitir seleção ou digitação de nova categoria -->
                        <input
                          id="categoria"
                          v-model="categoria"
                          type="text"
                          list="category-list"
                          placeholder="Ex: Eletrônicos, Livros, Roupas..."
                          required
                          class="input"
                        />
                        <datalist id="category-list">
                          <option v-for="cat in itemStore.categories" :key="cat" :value="cat" />
                        </datalist>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Descrição *</label>
                        <textarea v-model="descricao" required placeholder="Descreva o item, seu estado de conservação..." rows="5" class="input resize-none"></textarea>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-xl shadow-lg border p-6">
                <h2 class="text-xl font-bold text-gray-800 mb-4">Preferências de Troca</h2>
                <p class="text-sm text-gray-500 mb-4">Adicione itens que você gostaria de receber em troca. Você pode digitar um desejo ou selecionar um item existente.</p>
                <PreferredItemTags :items="selectedPreferredItems" @remove="removePreferredItem" />
                
                <!-- Campo para adicionar preferência por título -->
                <div class="flex items-center gap-2 mt-4">
                  <input
                    v-model="customPreferenceTitle"
                    type="text"
                    placeholder="Digite um item desejado (ex: Teclado Mecânico)"
                    class="input flex-grow"
                    @keydown.enter.prevent="addCustomPreference"
                  />
                  <button type="button" @click="addCustomPreference" class="btn btn-secondary shrink-0">Adicionar</button>
                </div>

                <div class="text-center my-2 text-gray-500 text-sm">ou</div>

                <button type="button" @click="isModalOpen = true" class="text-sm text-primary-600 hover:text-primary-800 font-semibold w-full text-center">
                  + Selecionar um item específico da plataforma
                </button>
            </div>

            <div class="bg-white rounded-xl shadow-lg border p-6">
                <h2 class="text-xl font-bold text-gray-800 mb-4">Imagens</h2>
                <ImageUpload v-model="imagens" :max-files="5" :max-size-m-b="5" />
            </div>
        </div>

        <div class="space-y-6">
          <div class="bg-white rounded-xl shadow-lg border p-6">
            <h2 class="text-xl font-bold text-gray-800 mb-4">Localização do Item</h2>
            <LocationPicker v-model="location" />
          </div>
        </div>
        
        <div class="lg:col-span-2 bg-white rounded-xl shadow-lg border p-6">
          <h3 class="font-bold text-gray-900 mb-4 flex items-center text-xl">
            <span class="mr-2">📋</span>
            Resumo do Cadastro
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div class="bg-gray-50 rounded-lg p-3 border">
              <p class="text-gray-600 text-xs mb-1">Título</p>
              <p class="font-semibold text-gray-900 truncate">{{ titulo || '(não preenchido)' }}</p>
            </div>
            <div class="bg-gray-50 rounded-lg p-3 border">
              <p class="text-gray-600 text-xs mb-1">Categoria</p>
              <p class="font-semibold text-gray-900">{{ categoria || '(não selecionada)' }}</p>
            </div>
            <div class="bg-gray-50 rounded-lg p-3 border">
              <p class="text-gray-600 text-xs mb-1">Localização</p>
              <p class="font-semibold text-gray-900">{{ location.cidade && location.estado ? `${location.cidade}, ${location.estado}` : '(não preenchida)' }}</p>
            </div>
            <div class="bg-gray-50 rounded-lg p-3 border">
              <p class="text-gray-600 text-xs mb-1">Imagens</p>
              <p class="font-semibold text-gray-900">{{ imagens.length }} {{ imagens.length === 1 ? 'imagem' : 'imagens' }}</p>
            </div>
            <div class="bg-gray-50 rounded-lg p-3 border">
              <p class="text-gray-600 text-xs mb-1">Preferências de Troca</p>
              <p class="font-semibold text-gray-900">{{ selectedPreferredItems.length }} {{ selectedPreferredItems.length === 1 ? 'preferência' : 'preferências' }}</p>
            </div>
          </div>
        </div>

        <div class="lg:col-span-2 flex flex-col sm:flex-row gap-4 pt-4 border-t">
          <button type="button" @click="router.back()" class="btn btn-secondary flex-1" :disabled="loading">
            Voltar
          </button>
          <button type="submit" :disabled="loading" class="btn btn-primary flex-1">
            <span v-if="loading">Cadastrando...</span>
            <span v-else>✓ Cadastrar Item</span>
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
