<!-- DOC-META: status=ativo; ultima_revisao=2026-04-10; proxima_revisao=trimestral -->
# ??? Integra��o Google Maps - TrocaAi

## ?? Pr�-requisitos

1. **Conta Google Cloud Platform (GCP)**
   - Acesse: https://console.cloud.google.com/
   - Crie um novo projeto ou use um existente

2. **API Key do Google Maps**
   - No Console GCP, v� em "APIs & Services" > "Credentials"
   - Clique em "Create Credentials" > "API Key"
   - Copie a chave gerada

3. **Ativar APIs Necess�rias**
   No Console GCP, ative as seguintes APIs:
   - ? **Maps JavaScript API**
   - ? **Geocoding API**
   - ? **Places API**

## ?? Configura��o

### 1. Adicionar a API Key no Projeto

**Backend (.env):**
```bash
# Adicione no arquivo backend/.env
GOOGLE_MAPS_API_KEY=SUA_CHAVE_AQUI
```

**Frontend (.env):**
```bash
# Adicione no arquivo frontend/.env
VITE_GOOGLE_MAPS_API_KEY=SUA_CHAVE_AQUI
```

### 2. Instalar Depend�ncias

```bash
# No diret�rio frontend
cd frontend
npm install @googlemaps/js-api-loader
```

### 3. Configurar Restri��es de API (Seguran�a)

No Console GCP > Credentials > Editar API Key:

**Para Desenvolvimento:**
- Application restrictions: None
- API restrictions: Restrict key
  - Maps JavaScript API
  - Geocoding API
  - Places API

**Para Produ��o:**
- Application restrictions: HTTP referrers
  - Adicione: `https://seu-dominio.replit.app/*`
- API restrictions: Restrict key
  - Maps JavaScript API
  - Geocoding API
  - Places API

## ?? Implementa��o

### Frontend - Componente de Mapa Atualizado

```typescript
// frontend/src/components/ItemsMap.vue
<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { Loader } from '@googlemaps/js-api-loader'

const props = defineProps<{
  items: any[]
  center?: { lat: number; lng: number }
}>()

const mapContainer = ref<HTMLElement>()
let map: google.maps.Map | null = null
let markers: google.maps.Marker[] = []

const initMap = async () => {
  const loader = new Loader({
    apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    version: 'weekly',
    libraries: ['places', 'geocoding']
  })

  const { Map } = await loader.importLibrary('maps')
  const { Marker } = await loader.importLibrary('marker')

  const center = props.center || { lat: -23.5505, lng: -46.6333 } // S�o Paulo

  map = new Map(mapContainer.value!, {
    center,
    zoom: 12,
    mapId: 'TROCAAI_MAP'
  })

  updateMarkers()
}

const updateMarkers = () => {
  // Remove marcadores antigos
  markers.forEach(marker => marker.setMap(null))
  markers = []

  // Adiciona novos marcadores
  props.items.forEach(item => {
    if (item.latitude && item.longitude) {
      const marker = new google.maps.Marker({
        position: { lat: item.latitude, lng: item.longitude },
        map,
        title: item.titulo,
        animation: google.maps.Animation.DROP
      })

      // InfoWindow ao clicar
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 10px;">
            <h3>${item.titulo}</h3>
            <p>${item.descricao}</p>
            <img src="${item.imagem}" style="max-width: 200px;" />
          </div>
        `
      })

      marker.addListener('click', () => {
        infoWindow.open(map, marker)
      })

      markers.push(marker)
    }
  })
}

watch(() => props.items, updateMarkers)

onMounted(initMap)
</script>

<template>
  <div ref="mapContainer" class="w-full h-full min-h-[500px]"></div>
</template>
```

### Backend - Servi�o de Geocoding

```typescript
// backend/src/services/geocoding.service.ts
import axios from 'axios'

export class GeocodingService {
  private apiKey: string

  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY || ''
  }

  /**
   * Converte endere�o em coordenadas (latitude, longitude)
   */
  async getCoordinates(address: string): Promise<{ lat: number; lng: number } | null> {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json`,
        {
          params: {
            address,
            key: this.apiKey
          }
        }
      )

      if (response.data.status === 'OK' && response.data.results.length > 0) {
        const location = response.data.results[0].geometry.location
        return {
          lat: location.lat,
          lng: location.lng
        }
      }

      return null
    } catch (error) {
      console.error('Erro ao buscar coordenadas:', error)
      return null
    }
  }

  /**
   * Converte coordenadas em endere�o
   */
  async getAddress(lat: number, lng: number): Promise<string | null> {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json`,
        {
          params: {
            latlng: `${lat},${lng}`,
            key: this.apiKey
          }
        }
      )

      if (response.data.status === 'OK' && response.data.results.length > 0) {
        return response.data.results[0].formatted_address
      }

      return null
    } catch (error) {
      console.error('Erro ao buscar endere�o:', error)
      return null
    }
  }
}
```

### Atualizar Controller de Items

```typescript
// No backend/src/controllers/item.controller.ts
import { GeocodingService } from '../services/geocoding.service'

private geocodingService = new GeocodingService()

create = async (req: Request, res: Response): Promise<void> => {
  try {
    const { endereco } = req.body
    
    // Busca coordenadas do endere�o
    const coords = await this.geocodingService.getCoordinates(endereco)
    
    const item = await this.itemService.create({
      ...req.body,
      latitude: coords?.lat,
      longitude: coords?.lng
    })
    
    res.status(201).json(item)
  } catch (error) {
    // ...
  }
}
```

## ?? Funcionalidades Implementadas

? **Mapa Interativo**
- Exibe todos os items dispon�veis
- Marcadores clic�veis com informa��es
- Zoom e navega��o

? **Geocoding Autom�tico**
- Converte endere�os em coordenadas
- Salva latitude/longitude no banco

? **Busca por Proximidade**
- Filtra items pr�ximos ao usu�rio
- Ordena por dist�ncia

## ?? Pr�ximos Passos

1. **Adicionar Filtro de Raio**
   ```javascript
   // Buscar items em um raio de X km
   const radius = 5 // km
   const nearbyItems = items.filter(item => {
     const distance = calculateDistance(userLat, userLng, item.latitude, item.longitude)
     return distance <= radius
   })
   ```

2. **Dire��es no Mapa**
   ```javascript
   const directionsService = new google.maps.DirectionsService()
   const directionsRenderer = new google.maps.DirectionsRenderer()
   directionsRenderer.setMap(map)
   ```

3. **Autocomplete de Endere�os**
   ```javascript
   const autocomplete = new google.maps.places.Autocomplete(input)
   ```

## ?? Dicas de Otimiza��o

1. **Lazy Loading**: Carregue o mapa apenas quando necess�rio
2. **Clustering**: Agrupe marcadores pr�ximos
3. **Cache**: Armazene coordenadas j� consultadas
4. **Rate Limiting**: Limite requisi��es � API

## ?? Custos (Google Cloud)

- **Gr�tis**: At� $200/m�s de cr�dito
- **Maps JavaScript API**: $7 por 1000 carregamentos
- **Geocoding API**: $5 por 1000 requisi��es
- **Otimize**: Use cache para reduzir custos

## ? Troubleshooting

**Erro: "This API key is not authorized"**
- Verifique se as APIs est�o ativadas
- Confirme as restri��es de dom�nio

**Mapa n�o carrega:**
- Verifique a API key no .env
- Abra o console do navegador para erros

**Marcadores n�o aparecem:**
- Verifique se items t�m latitude/longitude
- Confirme que o centro do mapa est� correto




