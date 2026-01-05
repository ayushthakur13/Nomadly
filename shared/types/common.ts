/**
 * Common domain types shared across client and server
 */

/**
 * Geographic location with optional coordinates
 */
export interface Location {
  name: string;
  address?: string;
  placeId?: string;
  point?: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
}

/**
 * Simplified location for API requests (without MongoDB-specific fields)
 */
export interface LocationDTO {
  name: string;
  address?: string;
  placeId?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}
