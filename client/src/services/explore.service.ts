import api from "./api";
import { extractApiError, type ApiError } from "../utils/errorHandling";

export interface ExploreFeedParams {
  limit?: number;
  nextCursor?: string;
  sortBy?: "recent" | "most-liked";
  category?: string;
  destination?: string;
}

export interface ExploreFeedResponse {
  trips: any[];
  pagination: {
    nextCursor: string | null;
    hasNextPage: boolean;
  };
}

export interface TripSocialStatus {
  liked: boolean;
  saved: boolean;
}

/**
 * Fetch public Explore feed
 */
export const fetchExploreFeedAPI = async (params: ExploreFeedParams = {}): Promise<ExploreFeedResponse> => {
  try {
    const searchParams = new URLSearchParams();
    if (params.limit) searchParams.append("limit", params.limit.toString());
    if (params.nextCursor) searchParams.append("nextCursor", params.nextCursor);
    if (params.sortBy) searchParams.append("sortBy", params.sortBy);
    if (params.category) searchParams.append("category", params.category);
    if (params.destination) searchParams.append("destination", params.destination);

    const response = await api.get(`/explore/trips?${searchParams.toString()}`);
    return response.data.data;
  } catch (error) {
    throw new Error(extractApiError(error as ApiError, "Failed to fetch explore feed"));
  }
};

/**
 * Like a public trip
 */
export const likeTripAPI = async (tripId: string): Promise<number> => {
  try {
    const response = await api.post(`/explore/trips/${tripId}/like`);
    return response.data.data.likeCount;
  } catch (error) {
    throw new Error(extractApiError(error as ApiError, "Failed to like trip"));
  }
};

/**
 * Unlike a public trip
 */
export const unlikeTripAPI = async (tripId: string): Promise<number> => {
  try {
    const response = await api.delete(`/explore/trips/${tripId}/like`);
    return response.data.data.likeCount;
  } catch (error) {
    throw new Error(extractApiError(error as ApiError, "Failed to unlike trip"));
  }
};

/**
 * Save a public trip to bookmarks
 */
export const saveTripAPI = async (tripId: string): Promise<void> => {
  try {
    await api.post(`/explore/trips/${tripId}/save`);
  } catch (error) {
    throw new Error(extractApiError(error as ApiError, "Failed to save trip"));
  }
};

/**
 * Unsave a public trip from bookmarks
 */
export const unsaveTripAPI = async (tripId: string): Promise<void> => {
  try {
    await api.delete(`/explore/trips/${tripId}/save`);
  } catch (error) {
    throw new Error(extractApiError(error as ApiError, "Failed to unsave trip"));
  }
};

/**
 * Fetch user's saved trips
 */
export const fetchSavedTripsAPI = async (): Promise<any[]> => {
  try {
    const response = await api.get("/explore/saved");
    return response.data.data.trips || [];
  } catch (error) {
    throw new Error(extractApiError(error as ApiError, "Failed to fetch saved trips"));
  }
};

/**
 * Fetch trip liked/saved social status for current user
 */
export const fetchTripSocialStatusAPI = async (tripId: string): Promise<TripSocialStatus> => {
  try {
    const response = await api.get(`/explore/trips/${tripId}/status`);
    return response.data.data;
  } catch (error) {
    throw new Error(extractApiError(error as ApiError, "Failed to fetch trip social status"));
  }
};
