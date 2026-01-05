/**
 * Destination domain types - API contract between client and server
 */

/**
 * Destination location
 */
export interface DestinationLocation {
  name?: string;
  address?: string;
  placeId?: string;
  point: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
}

/**
 * Core Destination domain model
 */
export interface Destination {
  _id: string;
  tripId: string;
  name: string;
  location?: DestinationLocation;
  arrivalDate?: string;
  departureDate?: string;
  notes?: string;
  imageUrl?: string;
  imagePublicId?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}
