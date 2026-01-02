import axios from 'axios';
import { LocationSearchResult } from '../trips/core/trip.types';

// Search context determines which Mapbox types to use
export type SearchContext = 'trip' | 'destination';

export interface SearchOptions {
  limit?: number;
  proximity?: { lng: number; lat: number };
  types?: string[];
  context?: SearchContext;
}

class MapService {
  private mapboxToken: string;
  private mapboxBaseUrl = 'https://api.mapbox.com/geocoding/v5/mapbox.places';
  private mapboxAvailable: boolean;
  private hasLoggedMissingToken = false;
  private cache = new Map<string, { data: LocationSearchResult[]; expiresAt: number; provider: 'mapbox' | 'osm' }>();
  private cacheTtlMs = 10 * 60 * 1000;

  // Mapbox types for trip creation: big, stable places (cities, countries, regions)
  private readonly TRIP_TYPES = ['country', 'region', 'place', 'district'];
  
  // Mapbox types for destinations: specific places inside a city (POIs, addresses, neighborhoods)
  private readonly DESTINATION_TYPES = ['poi', 'address', 'locality', 'neighborhood', 'place'];

  constructor() {
    this.mapboxToken = process.env.MAPBOX_ACCESS_TOKEN || '';
    this.mapboxAvailable = !!this.mapboxToken;

    if (!this.mapboxAvailable && !this.hasLoggedMissingToken) {
      this.hasLoggedMissingToken = true;
      console.warn('⚠️ MAPBOX_ACCESS_TOKEN not found. Using OpenStreetMap fallback for search.');
    }
  }

  async searchLocation(
    query: string,
    options: SearchOptions = {}
  ): Promise<LocationSearchResult[]> {
    const trimmed = query?.trim();
    if (!trimmed) {
      return [];
    }

    const limit = options.limit ?? 5;
    const context = options.context ?? 'trip';
    
    // Determine types based on context if not explicitly provided
    const types = options.types ?? (context === 'destination' ? this.DESTINATION_TYPES : this.TRIP_TYPES);
    
    // Build cache key including context and proximity
    const proxKey = options.proximity ? `${options.proximity.lng},${options.proximity.lat}` : 'no-prox';
    const cacheKey = `${context}:${trimmed}:${limit}:${proxKey}`;

    if (this.mapboxAvailable) {
      const cached = this.getFromCache('mapbox', cacheKey, limit);
      if (cached) return cached;

      try {
        const results = await this.searchLocationMapbox(trimmed, { ...options, limit, types });
        this.setCache('mapbox', cacheKey, limit, results);
        return results;
      } catch (err: any) {
        console.warn('Mapbox search failed, falling back to OSM:', err.message);
      }
    }

    const cachedFallback = this.getFromCache('osm', cacheKey, limit);
    if (cachedFallback) return cachedFallback;

    const fallbackResults = await this.searchLocationOSM(trimmed, limit);
    this.setCache('osm', cacheKey, limit, fallbackResults);
    return fallbackResults;
  }

  private async searchLocationMapbox(
    query: string,
    options: { limit: number; proximity?: { lng: number; lat: number }; types?: string[] }
  ): Promise<LocationSearchResult[]> {
    if (!this.mapboxAvailable) {
      throw new Error('Mapbox token unavailable');
    }

    const { limit, proximity, types } = options;

    const params: any = { access_token: this.mapboxToken, limit, autocomplete: true };
    if (proximity) params.proximity = `${proximity.lng},${proximity.lat}`;
    if (types && types.length > 0) params.types = types.join(',');

    const encodedQuery = encodeURIComponent(query);
    const url = `${this.mapboxBaseUrl}/${encodedQuery}.json`;

    const response = await axios.get(url, { params });

    return response.data.features.map((feature: any) => ({
      name: feature.text,
      address: feature.place_name,
      coordinates: { lng: feature.center[0], lat: feature.center[1] },
      placeId: feature.id,
      type: feature.place_type?.[0],
      country: this.extractContext(feature.context, 'country'),
      city: this.extractContext(feature.context, 'place')
    }));
  }

  private async searchLocationOSM(query: string, limit: number): Promise<LocationSearchResult[]> {
    try {
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: { q: query, format: 'json', limit, addressdetails: 1 },
        headers: { 'User-Agent': 'Nomadly-App/1.0' }
      });

      return response.data.map((item: any) => ({
        name: item.display_name.split(',')[0],
        address: item.display_name,
        coordinates: { lat: parseFloat(item.lat), lng: parseFloat(item.lon) },
        placeId: item.place_id.toString(),
        type: item.type,
        country: item.address?.country,
        city: item.address?.city || item.address?.town
      }));
    } catch (error: any) {
      console.error('Fallback geocoding error:', error.message);
      return [];
    }
  }

  async reverseGeocode(lat: number, lng: number): Promise<LocationSearchResult | null> {
    if (!this.mapboxAvailable) {
      throw new Error('Mapbox API token not configured');
    }

    try {
      const url = `${this.mapboxBaseUrl}/${lng},${lat}.json`;
      const response = await axios.get(url, { params: { access_token: this.mapboxToken, limit: 1 } });

      if (!response.data.features || response.data.features.length === 0) {
        return null;
      }

      const feature = response.data.features[0];
      const country = this.extractContext(feature.context, 'country');
      const city = this.extractContext(feature.context, 'place');

      return {
        name: feature.text,
        address: feature.place_name,
        coordinates: { lng: feature.center[0], lat: feature.center[1] },
        placeId: feature.id,
        type: feature.place_type?.[0],
        ...(country && { country }),
        ...(city && { city })
      };
    } catch (error: any) {
      console.error('Reverse geocode error:', error.message);
      throw new Error(`Reverse geocoding failed: ${error.message}`);
    }
  }

  buildGeoPoint(lat: number, lng: number) {
    return { type: 'Point' as const, coordinates: [lng, lat] as [number, number] };
  }

  validateCoordinates(lat: number, lng: number): boolean {
    return (
      typeof lat === 'number' &&
      typeof lng === 'number' &&
      lat >= -90 && lat <= 90 &&
      lng >= -180 && lng <= 180
    );
  }

  calculateDistance(coord1: { lat: number; lng: number }, coord2: { lat: number; lng: number }): number {
    const R = 6371;
    const dLat = this.toRad(coord2.lat - coord1.lat);
    const dLng = this.toRad(coord2.lng - coord1.lng);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(coord1.lat)) *
        Math.cos(this.toRad(coord2.lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(value: number): number {
    return (value * Math.PI) / 180;
  }

  private extractContext(context: any[], type: string): string | undefined {
    if (!Array.isArray(context)) return undefined;
    const item = context.find((c) => c.id?.startsWith(type));
    return item?.text;
  }

  private getFromCache(provider: 'mapbox' | 'osm', query: string, limit: number) {
    const key = `${provider}:${query}:${limit}`;
    const entry = this.cache.get(key);
    if (entry && Date.now() < entry.expiresAt) {
      return entry.data;
    }
    return null;
  }

  private setCache(provider: 'mapbox' | 'osm', query: string, limit: number, data: LocationSearchResult[]) {
    const key = `${provider}:${query}:${limit}`;
    this.cache.set(key, { data, expiresAt: Date.now() + this.cacheTtlMs, provider });
  }
}

export default new MapService();
