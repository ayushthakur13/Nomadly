import api from './api';
import { extractApiError, type ApiError } from '../utils/errorHandling';

// Import and re-export shared domain type
import type { Destination } from '../../../shared/types';
export type { Destination };

export interface DestinationLocation {
  name?: string;
  address?: string;
  placeId?: string;
  coordinates?: [number, number]; // [lng, lat] - optional for manual entry
}

export interface DestinationPayload {
  name: string;
  location?: DestinationLocation;
  arrivalDate?: string;
  departureDate?: string;
  notes?: string;
  imageUrl?: string;
}

/**
 * API Response normalization helper
 * We pass response.data to these functions (the backend JSON response body)
 * Backend structure: { success: true, data: { destination/destinations: ... } }
 */
const normalizeDestinationResponse = (response: any): any => {
  // Backend structure: { success: true, data: { destination: {...} } }
  if (response.data?.destination) return response.data.destination;
  // Fallback: { destination: {...} }
  if (response.destination) return response.destination;
  // Direct destination object
  return response;
};

const normalizeDestinationsResponse = (response: any): any[] => {
  // Backend structure: { success: true, data: { destinations: [...] } }
  if (response.data?.destinations) return response.data.destinations;
  // Fallback: { destinations: [...] }
  if (response.destinations) return response.destinations;
  // Direct array
  return response;
};

export async function fetchDestinations(tripId: string): Promise<Destination[]> {
  try {
    const res = await api.get(`/trips/${tripId}/destinations`);
    return normalizeDestinationsResponse(res.data);
  } catch (error) {
    throw new Error(extractApiError(error as ApiError, 'Failed to fetch destinations'));
  }
}

export async function createDestination(tripId: string, payload: DestinationPayload): Promise<Destination> {
  try {
    const res = await api.post(`/trips/${tripId}/destinations`, payload);
    return normalizeDestinationResponse(res.data);
  } catch (error) {
    throw new Error(extractApiError(error as ApiError, 'Failed to create destination'));
  }
}

export async function updateDestination(destinationId: string, payload: Partial<DestinationPayload>): Promise<Destination> {
  try {
    const res = await api.patch(`/destinations/${destinationId}`, payload);
    return normalizeDestinationResponse(res.data);
  } catch (error) {
    throw new Error(extractApiError(error as ApiError, 'Failed to update destination'));
  }
}

export async function deleteDestination(destinationId: string): Promise<void> {
  try {
    await api.delete(`/destinations/${destinationId}`);
  } catch (error) {
    throw new Error(extractApiError(error as ApiError, 'Failed to delete destination'));
  }
}

export async function reorderDestinations(tripId: string, orderedIds: string[]): Promise<Destination[]> {
  try {
    const res = await api.patch(`/trips/${tripId}/destinations/reorder`, { orderedDestinationIds: orderedIds });
    return normalizeDestinationsResponse(res.data);
  } catch (error) {
    throw new Error(extractApiError(error as ApiError, 'Failed to reorder destinations'));
  }
}

export async function uploadDestinationImage(destinationId: string, formData: FormData): Promise<Destination> {
  try {
    const res = await api.post(`/destinations/${destinationId}/image`, formData);
    return normalizeDestinationResponse(res.data);
  } catch (error) {
    throw new Error(extractApiError(error as ApiError, 'Failed to upload destination image'));
  }
}

export async function deleteDestinationImage(destinationId: string): Promise<Destination> {
  try {
    const res = await api.delete(`/destinations/${destinationId}/image`);
    return normalizeDestinationResponse(res.data);
  } catch (error) {
    throw new Error(extractApiError(error as ApiError, 'Failed to delete destination image'));
  }
}

export default {
  fetchDestinations,
  createDestination,
  updateDestination,
  deleteDestination,
  reorderDestinations,
  uploadDestinationImage,
  deleteDestinationImage,
};
