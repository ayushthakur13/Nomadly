import axios from 'axios';
import { LocationSearchResult } from '../types/trip.types';

/**
 * Map Service for location search and geocoding
 * Supports Mapbox API (can be extended for Google Maps or OpenStreetMap)
 */
class MapService {
  private mapboxToken: string;
  private mapboxBaseUrl = 'https://api.mapbox.com/geocoding/v5/mapbox.places';

  constructor() {
    this.mapboxToken = process.env.MAPBOX_ACCESS_TOKEN || '';
    
    if (!this.mapboxToken) {
      console.warn('⚠️ MAPBOX_ACCESS_TOKEN not found. Map features will be limited.');
    }
  }

  /**
   * Search for locations by query string
   * @param query - Search query (e.g., "Paris, France")
   * @param options - Additional search options
   * @returns Array of location search results
   */
  async searchLocation(
    query: string,
    options: {
      limit?: number;
      proximity?: { lng: number; lat: number };
      types?: string[]; // e.g., ['place', 'region', 'country']
    } = {}
  ): Promise<LocationSearchResult[]> {
    if (!this.mapboxToken) {
      throw new Error('Mapbox API token not configured');
    }

    try {
      const { limit = 5, proximity, types } = options;
      
      // Build query parameters
      const params: any = {
        access_token: this.mapboxToken,
        limit,
        autocomplete: true
      };

      if (proximity) {
        params.proximity = `${proximity.lng},${proximity.lat}`;
      }

      if (types && types.length > 0) {
        params.types = types.join(',');
      }

      // Make request to Mapbox Geocoding API
      const encodedQuery = encodeURIComponent(query);
      const url = `${this.mapboxBaseUrl}/${encodedQuery}.json`;
      
      const response = await axios.get(url, { params });

      // Transform Mapbox response to our format
      return response.data.features.map((feature: any) => ({
        name: feature.text,
        address: feature.place_name,
        coordinates: {
          lng: feature.center[0],
          lat: feature.center[1]
        },
        placeId: feature.id,
        type: feature.place_type?.[0],
        country: this.extractContext(feature.context, 'country'),
        city: this.extractContext(feature.context, 'place')
      }));
    } catch (error: any) {
      console.error('Map service search error:', error.message);
      throw new Error(`Location search failed: ${error.message}`);
    }
  }

  /**
   * Reverse geocode: Get location details from coordinates
   * @param lat - Latitude
   * @param lng - Longitude
   * @returns Location details
   */
  async reverseGeocode(lat: number, lng: number): Promise<LocationSearchResult | null> {
    if (!this.mapboxToken) {
      throw new Error('Mapbox API token not configured');
    }

    try {
      const url = `${this.mapboxBaseUrl}/${lng},${lat}.json`;
      
      const response = await axios.get(url, {
        params: {
          access_token: this.mapboxToken,
          limit: 1
        }
      });

      if (!response.data.features || response.data.features.length === 0) {
        return null;
      }

      const feature = response.data.features[0];

      return {
        name: feature.text,
        address: feature.place_name,
        coordinates: { lng: feature.center[0], lat: feature.center[1] },
        placeId: feature.id,
        type: feature.place_type?.[0],
        country: this.extractContext(feature.context, 'country'),
        city: this.extractContext(feature.context, 'place')
      } as any;
    } catch (error: any) {
      console.error('Reverse geocode error:', error.message);
      throw new Error(`Reverse geocoding failed: ${error.message}`);
    }
  }

  /**
   * Validate coordinates
   * @param lat - Latitude (-90 to 90)
   * @param lng - Longitude (-180 to 180)
   * @returns True if valid
   */
  validateCoordinates(lat: number, lng: number): boolean {
    return (
      typeof lat === 'number' &&
      typeof lng === 'number' &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180
    );
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   * @param coord1 - First coordinate
   * @param coord2 - Second coordinate
   * @returns Distance in kilometers
   */
  calculateDistance(
    coord1: { lat: number; lng: number },
    coord2: { lat: number; lng: number }
  ): number {
    const R = 6371; // Earth's radius in km
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

  /**
   * Convert degrees to radians
   */
  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Extract context data from Mapbox response
   */
  private extractContext(context: any[] = [], type: string): string | undefined {
    const item = context.find((ctx) => ctx.id.startsWith(type));
    return item?.text;
  }

  /**
   * Fallback: Manual coordinate validation without API
   * Use when Mapbox token is not available
   */
  async searchLocationFallback(query: string): Promise<LocationSearchResult[]> {
    // This is a placeholder for offline/fallback mode
    // You could integrate with OpenStreetMap Nominatim (no auth required)
    try {
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: query,
          format: 'json',
          limit: 5,
          addressdetails: 1
        },
        headers: {
          'User-Agent': 'Nomadly-App/1.0'
        }
      });

      return response.data.map((item: any) => ({
        name: item.display_name.split(',')[0],
        address: item.display_name,
        coordinates: {
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon)
        },
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
}

export default new MapService();