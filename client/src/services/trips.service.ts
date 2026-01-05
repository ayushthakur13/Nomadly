import api from './api';
import { extractApiError, type ApiError } from '../utils/errorHandling';

// Import shared domain types from monorepo
import type {
  Trip,
  TripMember,
  TripEngagement,
  TripBudgetSummary,
  CreateTripDTO,
  UpdateTripDTO,
  Location,
  LocationDTO,
  TripLifecycleStatus,
  TripCategory,
  TripTimeStatus,
} from '../../../shared/types';

// Re-export for backward compatibility
export type { Trip, TripMember, Location, LocationDTO, TripLifecycleStatus, TripCategory, TripTimeStatus };
export type Engagement = TripEngagement;
export type BudgetSummary = TripBudgetSummary;

export interface CategorizedTrips {
  all: Trip[];
  upcoming: Trip[];
  ongoing: Trip[];
  past: Trip[];
}

// Re-export DTOs with local aliases for backward compatibility
export type CreateTripPayload = CreateTripDTO;
export type UpdateTripPayload = UpdateTripDTO;

export interface FetchTripsParams {
  status?: string;
  category?: string;
  sort?: string;
  order?: string;
}

/**
 * API Response shape normalization helpers
 * We pass response.data to these functions (the backend JSON response body)
 * Backend structure: { success: true, data: { trip/trips: ... } }
 */
const normalizeTripResponse = (responseData: any): Trip => {
  // Backend structure: { success: true, data: { trip: {...} } }
  if (responseData?.data?.trip) return responseData.data.trip;
  // Fallback: { trip: {...} }
  if (responseData?.trip) return responseData.trip;
  // Direct trip object
  return responseData;
};

const normalizeTripsResponse = (responseData: any): Trip[] | CategorizedTrips => {
  // Backend structure: { success: true, data: { trips: [...] } }
  if (responseData?.data?.trips) return responseData.data.trips;
  // Fallback: { trips: [...] }
  if (responseData?.trips) return responseData.trips;
  // Direct array or categorized object
  return responseData;
};

/**
 * Fetch all trips with optional filters
 */
export const fetchTripsAPI = async (params: FetchTripsParams = {}): Promise<Trip[] | CategorizedTrips> => {
  try {
    const { status, category, sort = 'createdAt', order = 'desc' } = params;
    
    const searchParams = new URLSearchParams();
    if (status) searchParams.append('status', status);
    if (category) searchParams.append('category', category);
    searchParams.append('sort', sort);
    searchParams.append('order', order);
    
    const response = await api.get(`/trips?${searchParams.toString()}`);
    return normalizeTripsResponse(response.data);
  } catch (error) {
    throw new Error(extractApiError(error as ApiError, 'Failed to fetch trips'));
  }
};

/**
 * Fetch a single trip by ID
 */
export const fetchTripByIdAPI = async (tripId: string): Promise<Trip> => {
  try {
    const response = await api.get(`/trips/${tripId}`);
    return normalizeTripResponse(response.data);
  } catch (error) {
    throw new Error(extractApiError(error as ApiError, 'Failed to fetch trip'));
  }
};

/**
 * Create a new trip
 */
export const createTripAPI = async (tripData: CreateTripPayload): Promise<Trip> => {
  try {
    const response = await api.post('/trips', tripData);
    return normalizeTripResponse(response.data);
  } catch (error) {
    throw new Error(extractApiError(error as ApiError, 'Failed to create trip'));
  }
};

/**
 * Update an existing trip
 */
export const updateTripAPI = async (tripId: string, updates: UpdateTripPayload): Promise<Trip> => {
  try {
    const response = await api.put(`/trips/${tripId}`, updates);
    return normalizeTripResponse(response.data);
  } catch (error) {
    throw new Error(extractApiError(error as ApiError, 'Failed to update trip'));
  }
};

/**
 * Delete a trip
 */
export const deleteTripAPI = async (tripId: string): Promise<{ success: boolean; message?: string }> => {
  try {
    const response = await api.delete(`/trips/${tripId}`);
    return response.data;
  } catch (error) {
    throw new Error(extractApiError(error as ApiError, 'Failed to delete trip'));
  }
};

/**
 * Update trip cover image
 */
export const updateTripCoverAPI = async (tripId: string, formData: FormData): Promise<Trip> => {
  try {
    const response = await api.post(`/trips/${tripId}/cover`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return normalizeTripResponse(response.data);
  } catch (error) {
    throw new Error(extractApiError(error as ApiError, 'Failed to update trip cover'));
  }
};

/**
 * Delete trip cover image
 */
export const deleteTripCoverAPI = async (tripId: string): Promise<Trip> => {
  try {
    const response = await api.delete(`/trips/${tripId}/cover`);
    return normalizeTripResponse(response.data);
  } catch (error) {
    throw new Error(extractApiError(error as ApiError, 'Failed to delete trip cover'));
  }
};

/**
 * Publish a trip
 */
export const publishTripAPI = async (tripId: string): Promise<Trip> => {
  try {
    const response = await api.patch(`/trips/${tripId}/publish`);
    return normalizeTripResponse(response.data);
  } catch (error) {
    throw new Error(extractApiError(error as ApiError, 'Failed to publish trip'));
  }
};

/**
 * Unpublish a trip
 */
export const unpublishTripAPI = async (tripId: string): Promise<Trip> => {
  try {
    const response = await api.patch(`/trips/${tripId}/unpublish`);
    return normalizeTripResponse(response.data);
  } catch (error) {
    throw new Error(extractApiError(error as ApiError, 'Failed to unpublish trip'));
  }
};
