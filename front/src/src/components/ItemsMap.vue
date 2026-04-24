<script setup lang="ts">
import { computed } from 'vue';
import type { Item } from '@/types/index';

interface MapItem extends Item {
  distancia: number;
}

const props = defineProps<{
  items: MapItem[];
  userLocation: { lat: number; lng: number } | null;
  radius: number;
  selectedItem: MapItem | null;
}>();

const emit = defineEmits(['item-click']);

// Função para calcular o azimute (direção geográfica) de um ponto a outro
const calculateBearing = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const toRad = (deg: number) => deg * (Math.PI / 180);
  const y = Math.sin(toRad(lon2 - lon1)) * Math.cos(toRad(lat2));
  const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
            Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(toRad(lon2 - lon1));
  // O ângulo em radianos, ajustado para o sistema de coordenadas do SVG (0 rad = Leste)
  return Math.atan2(y, x);
};

const itemPositions = computed(() => {
  const positions: { [key: number]: { x: number; y: number; angle: number } } = {};
  const occupiedSlots: string[] = [];

  props.items.forEach(item => {
    if (!props.userLocation || !item.latitude || !item.longitude) return;

    // 1. Calcular a posição geográfica real
    const angle = calculateBearing(props.userLocation.lat, props.userLocation.lng, Number(item.latitude), Number(item.longitude));
    const normalizedDistance = Math.min(1, (item.distancia || 0) / props.radius);
    const visualMax = 200; // Distância máxima em pixels do centro
    const distanceFromCenter = normalizedDistance * visualMax;

    let x = 200 + Math.cos(angle) * distanceFromCenter;
    let y = 300 + Math.sin(angle) * distanceFromCenter;

    // 2. Prevenir sobreposição (Jittering)
    const slot = `${Math.round(x / 15)}_${Math.round(y / 15)}`; // Agrupa posições em uma grade de 15px
    if (occupiedSlots.includes(slot)) {
      x += (Math.random() - 0.5) * 15; // Adiciona um desvio aleatório
      y += (Math.random() - 0.5) * 15;
    }
    occupiedSlots.push(slot);

    positions[item.id] = { x, y, angle };
  });

  return positions;
});

const getItemPosition = (item: MapItem, index: number) => {
  return itemPositions.value[item.id] || { x: 200, y: 300, angle: 0 };
};

const getLabelPosition = (pos: { x: number; y: number, angle?: number }) => {
  // posiciona o rótulo radialmente para reduzir sobreposição
  const offset = 12;
  const a = pos.angle ?? 0;
  return { x: pos.x + Math.cos(a) * offset + 8, y: pos.y + Math.sin(a) * offset - 6 };
};
</script>

<template>
  <div class="card p-0 overflow-hidden h-[600px] map-container">
    <div class="relative h-full bg-gradient-to-br from-blue-50 to-green-100">
      <svg class="w-full h-full" viewBox="0 0 400 600">
        <defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="1"/></pattern></defs>
        <rect width="400" height="600" fill="url(#grid)" />
        <circle cx="200" cy="300" r="200" fill="rgba(59, 130, 246, 0.1)" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="1" strokeDasharray="4,4"/>
        
        <g transform="translate(200, 300)">
          <circle cx="0" cy="0" r="10" fill="#3b82f6" opacity="0.3"><animate attributeName="r" from="10" to="20" dur="2s" repeatCount="indefinite" /><animate attributeName="opacity" from="0.3" to="0" dur="2s" repeatCount="indefinite" /></circle>
          <circle cx="0" cy="0" r="6" fill="#3b82f6" stroke="white" strokeWidth="2" />
        </g>
        
        <g v-for="(item, index) in items" :key="item.id" class="map-item">
            <circle 
              @click="emit('item-click', item)"
              :cx="getItemPosition(item, index).x"
              :cy="getItemPosition(item, index).y"
              :r="selectedItem?.id === item.id ? 10 : 7"
              :fill="selectedItem?.id === item.id ? '#10b981' : '#ef4444'"
              stroke="white"
              stroke-width="2"
              class="cursor-pointer transition-all"
            >
              <title>{{ item.titulo }}</title>
            </circle>
            <text
              :x="getLabelPosition(getItemPosition(item, index)).x"
              :y="getLabelPosition(getItemPosition(item, index)).y"
              :class="[{ 'selected-label': selectedItem?.id === item.id }, 'item-label']"
            >
              {{ item.titulo.length > 24 ? item.titulo.slice(0,24) + '...' : item.titulo }}
            </text>
        </g>
      </svg>
      <div class="absolute bottom-4 left-4 bg-white/80 backdrop-blur-sm rounded-lg shadow p-2 space-y-1 text-xs">
          <div class="flex items-center gap-2"><div class="w-3 h-3 bg-blue-600 rounded-full"></div><span>Sua localização</span></div>
          <div class="flex items-center gap-2"><div class="w-3 h-3 bg-red-500 rounded-full"></div><span>Itens</span></div>
          <div class="flex items-center gap-2"><div class="w-3 h-3 bg-green-500 rounded-full"></div><span>Selecionado</span></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.map-container { position: relative; z-index: 10; }
.map-container svg { z-index: 11; }
</style>
  <style scoped>
  .map-item text.item-label {
    opacity: 0;
    transition: opacity 0.12s ease, transform 0.12s ease;
    font-size: 10px;
    fill: #0b1226;
    pointer-events: none;
  }
  .map-item:hover text.item-label { opacity: 1; transform: translateY(-2px); }
  .map-item text.selected-label { opacity: 1; font-weight: 600; fill: #065f46; }
  </style>
