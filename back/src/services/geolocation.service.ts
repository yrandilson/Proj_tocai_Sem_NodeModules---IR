/**
 * Serviço de Geolocalização
 * Calcula distâncias e ordena itens por proximidade
 */

interface Location {
  latitude: number;
  longitude: number;
}

export class GeolocationService {
  /**
   * Calcula a distância entre dois pontos usando a fórmula de Haversine
   * @param point1 Primeiro ponto (lat, lng)
   * @param point2 Segundo ponto (lat, lng)
   * @returns Distância em quilômetros
   */
  static calculateDistance(point1: Location, point2: Location): number {
    const R = 6371; // Raio da Terra em km

    const dLat = this.toRadians(point2.latitude - point1.latitude);
    const dLon = this.toRadians(point2.longitude - point1.longitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(point1.latitude)) *
        Math.cos(this.toRadians(point2.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 10) / 10; // Arredonda para 1 casa decimal
  }

  /**
   * Converte graus para radianos
   */
  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Obtém coordenadas a partir de um CEP (simulado - em produção usar API real)
   * @param cep CEP para buscar coordenadas
   * @returns Coordenadas ou null
   */
  static async getCoordinatesFromCEP(cep: string): Promise<Location | null> {
    // TODO: Integrar com API real (ViaCEP + Nominatim, Google Maps, etc)
    // Por enquanto, retorna coordenadas simuladas baseadas no CEP
    
    try {
      // Remove formatação do CEP
      const cleanCEP = cep.replace(/\D/g, '');
      
      // Simulação: gera coordenadas baseadas no CEP
      // Em produção, fazer chamada para API real
      const baseLat = -15.0; // Latitude base Brasil
      const baseLng = -47.0; // Longitude base Brasil
      
      const variation = parseInt(cleanCEP.substring(0, 2)) / 100;
      
      return {
        latitude: baseLat + variation,
        longitude: baseLng + variation
      };
    } catch (error) {
      console.error('Erro ao obter coordenadas do CEP:', error);
      return null;
    }
  }

  /**
   * Obtém coordenadas a partir de cidade e estado
   * @param cidade Nome da cidade
   * @param estado Sigla do estado
   * @returns Coordenadas ou null
   */
  static async getCoordinatesFromCity(
    cidade: string,
    estado: string
  ): Promise<Location | null> {
    // TODO: Integrar com API real de geocodificação
    // Por enquanto, usa coordenadas aproximadas de capitais
    
    const capitais: Record<string, Location> = {
      'Rio Branco-AC': { latitude: -9.9750, longitude: -67.8243 },
      'Maceió-AL': { latitude: -9.6658, longitude: -35.7353 },
      'Macapá-AP': { latitude: 0.0349, longitude: -51.0694 },
      'Manaus-AM': { latitude: -3.1190, longitude: -60.0217 },
      'Salvador-BA': { latitude: -12.9714, longitude: -38.5014 },
      'Fortaleza-CE': { latitude: -3.7172, longitude: -38.5433 },
      'Brasília-DF': { latitude: -15.8267, longitude: -47.9218 },
      'Vitória-ES': { latitude: -20.3155, longitude: -40.3128 },
      'Goiânia-GO': { latitude: -16.6869, longitude: -49.2648 },
      'São Luís-MA': { latitude: -2.5387, longitude: -44.2825 },
      'Cuiabá-MT': { latitude: -15.6014, longitude: -56.0979 },
      'Campo Grande-MS': { latitude: -20.4697, longitude: -54.6201 },
      'Belo Horizonte-MG': { latitude: -19.9167, longitude: -43.9345 },
      'Belém-PA': { latitude: -1.4558, longitude: -48.5039 },
      'João Pessoa-PB': { latitude: -7.1195, longitude: -34.8450 },
      'Curitiba-PR': { latitude: -25.4284, longitude: -49.2733 },
      'Recife-PE': { latitude: -8.0476, longitude: -34.8770 },
      'Teresina-PI': { latitude: -5.0949, longitude: -42.8042 },
      'Rio de Janeiro-RJ': { latitude: -22.9068, longitude: -43.1729 },
      'Natal-RN': { latitude: -5.7945, longitude: -35.2110 },
      'Porto Alegre-RS': { latitude: -30.0346, longitude: -51.2177 },
      'Porto Velho-RO': { latitude: -8.7619, longitude: -63.9039 },
      'Boa Vista-RR': { latitude: 2.8235, longitude: -60.6758 },
      'Florianópolis-SC': { latitude: -27.5954, longitude: -48.5480 },
      'São Paulo-SP': { latitude: -23.5505, longitude: -46.6333 },
      'Aracaju-SE': { latitude: -10.9472, longitude: -37.0731 },
      'Palmas-TO': { latitude: -10.2128, longitude: -48.3603 },
    };

    const key = `${cidade}-${estado}`;
    return capitais[key] || null;
  }

  /**
   * Filtra e ordena itens por proximidade
   * @param items Lista de itens
   * @param userLocation Localização do usuário
   * @param maxDistance Distância máxima em km (opcional)
   * @returns Itens ordenados por distância
   */
  static filterAndSortByProximity<T extends { latitude?: number; longitude?: number }>(
    items: T[],
    userLocation: Location,
    maxDistance?: number
  ): Array<T & { distance?: number }> {
    return items
      .map(item => {
        if (!item.latitude || !item.longitude) {
          return { ...item, distance: undefined };
        }

        const distance = this.calculateDistance(
          userLocation,
          { latitude: item.latitude, longitude: item.longitude }
        );

        return { ...item, distance };
      })
      .filter(item => {
        if (!maxDistance || item.distance === undefined) return true;
        return item.distance <= maxDistance;
      })
      .sort((a, b) => {
        if (a.distance === undefined) return 1;
        if (b.distance === undefined) return -1;
        return a.distance - b.distance;
      });
  }

  /**
   * Formata distância para exibição
   * @param distance Distância em km
   * @returns String formatada
   */
  static formatDistance(distance?: number): string {
    if (distance === undefined) return 'Localização não disponível';
    
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    
    return `${distance.toFixed(1)}km`;
  }
}
