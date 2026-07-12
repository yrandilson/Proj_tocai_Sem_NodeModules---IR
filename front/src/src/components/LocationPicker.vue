<script setup lang="ts">
import { ref, computed, watch } from 'vue';

interface Location {
  cidade?: string;
  estado?: string;
  latitude?: number;
  longitude?: number;
  cep?: string;
  bairro?: string;
}

const props = defineProps<{
  modelValue: Location;
}>();

const emit = defineEmits<{
  'update:modelValue': [location: Location];
}>();

const location = ref<Location>({ ...props.modelValue });
const loading = ref(false);
const error = ref('');

const estados = [ 'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO' ];

watch(location, (newVal) => {
  emit('update:modelValue', newVal);
}, { deep: true });

// Lógica para obter localização, buscar CEP, etc.
const getCurrentLocation = () => {
  loading.value = true;
  error.value = '';
  if (!navigator.geolocation) {
    error.value = 'Navegador não suporta Geolocation';
    loading.value = false;
    return;
  }

  navigator.geolocation.getCurrentPosition(async (pos) => {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;
    location.value.latitude = Number(lat.toFixed(7));
    location.value.longitude = Number(lon.toFixed(7));
    // tenta popular cidade/estado via reverse geocoding
    try {
      await reverseGeocode(lat, lon);
    } catch (e) {
      // não bloquear se reverse falhar
      console.warn('reverseGeocode falhou', e);
    }
    loading.value = false;
  }, (err) => {
    error.value = 'Não foi possível obter sua localização: ' + err.message;
    loading.value = false;
  }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
};

const reverseGeocode = async (lat: number, lon: number) => {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`;
    const resp = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!resp.ok) throw new Error('Reverse geocode falhou');
    const data = await resp.json();
    // tenta extrair cidade/estado
    const addr = data.address || {};
    if (addr.city || addr.town || addr.village) location.value.cidade = addr.city || addr.town || addr.village;
    if (addr.state) location.value.estado = addr.state;
    if (addr.postcode) location.value.cep = addr.postcode;
    if (addr.suburb || addr.neighbourhood) location.value.bairro = addr.suburb || addr.neighbourhood;
  } catch (err) {
    console.warn('reverseGeocode error', err);
  }
};

const searchCEP = async () => {
  if (!location.value.cep) return;
  loading.value = true;
  error.value = '';
  try {
    const cepOnly = location.value.cep.replace(/\D/g, '');
    const resp = await fetch(`https://viacep.com.br/ws/${cepOnly}/json/`);
    if (!resp.ok) throw new Error('Erro ao buscar CEP');
    const data = await resp.json();
    if (data.erro) throw new Error('CEP não encontrado');
    location.value.cidade = data.localidade || location.value.cidade;
    location.value.estado = data.uf || location.value.estado;
    location.value.bairro = data.bairro || location.value.bairro;
    // tenta obter lat/lng via geocode (monta endereço)
    const address = `${data.logradouro || ''} ${data.bairro || ''} ${data.localidade || ''} ${data.uf || ''}`.trim();
    if (address) {
      try {
        const coords = await geocode(address);
        if (coords) {
          location.value.latitude = coords.lat;
          location.value.longitude = coords.lon;
        }
      } catch (e) {
        // ignore geocode failure
        console.warn('geocode via CEP falhou', e);
      }
    }
  } catch (err: any) {
    error.value = err.message || 'Erro ao buscar CEP';
  } finally {
    loading.value = false;
  }
};

const geocode = async (address: string) => {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(address)}`;
    const resp = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!resp.ok) throw new Error('Geocode falhou');
    const data = await resp.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    const first = data[0];
    return { lat: Number(first.lat), lon: Number(first.lon) };
  } catch (err) {
    console.warn('geocode error', err);
    return null;
  }
};
const formatCEP = (value: string) => value.replace(/\D/g, '').replace(/^(\d{5})(\d)/, '$1-$2');
const handleCEPInput = (event: Event) => {
  const input = event.target as HTMLInputElement;
  location.value.cep = formatCEP(input.value);
};

// Coordenadas para o centro do mapa (usado quando não há lat/lng)
const mapCenter = { lat: -14.235, lng: -51.9253 }; // Centro do Brasil

const markerPosition = computed(() => {
    if (location.value.latitude && location.value.longitude) {
        // Normaliza a posição do marcador para um mapa de 100x100
        const x = ((location.value.longitude - mapCenter.lng) / 30 + 0.5) * 100;
        const y = ((- (location.value.latitude - mapCenter.lat)) / 30 + 0.5) * 100;
        return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
    }
    return null;
});
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900">📍 Localização</h3>
        <button type="button" @click="getCurrentLocation" :disabled="loading" class="btn btn-secondary text-sm">
          Usar Localização Atual
        </button>
      </div>
      <div v-if="error" class="p-3 bg-red-50 text-red-800 rounded-lg border border-red-200">{{ error }}</div>
      
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">CEP</label>
              <input v-model="location.cep" @input="handleCEPInput" type="text" placeholder="00000-000" maxlength="9" class="input"/>
          </div>
          <button type="button" @click="searchCEP" :disabled="loading || !location.cep" class="btn btn-primary w-full">Buscar CEP</button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">Cidade</label>
              <input v-model="location.cidade" type="text" placeholder="Ex: São Paulo" class="input"/>
          </div>
          <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Estado</label>
              <select v-model="location.estado" class="input">
                  <option value="">Selecione</option>
                  <option v-for="estado in estados" :key="estado" :value="estado">{{ estado }}</option>
              </select>
          </div>
      </div>
       <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Bairro (Opcional)</label>
          <input v-model="location.bairro" type="text" placeholder="Ex: Centro" class="input"/>
      </div>
    </div>

    <div class="space-y-4">
        <h3 class="text-lg font-semibold text-gray-900">Visualização no Mapa</h3>
        <div class="relative w-full h-64 bg-gray-200 rounded-lg overflow-hidden border">
            <div class="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100 opacity-50"></div>
            <p v-if="!markerPosition" class="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">Preencha a localização para ver o mapa</p>
            
            <Transition name="fade">
              <div v-if="markerPosition" class="absolute transform -translate-x-1/2 -translate-y-full" :style="{ left: `${markerPosition.x}%`, top: `${markerPosition.y}%` }">
                  <div class="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                      <div class="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <div class="w-1 h-4 bg-red-500 mx-auto"></div>
              </div>
            </Transition>
        </div>
        <div class="p-3 bg-gray-50 border rounded-lg">
            <p class="text-xs text-gray-600">ℹ️ A localização ajuda outros usuários a encontrarem itens próximos. Apenas a cidade é exibida publicamente.</p>
        </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.5s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
