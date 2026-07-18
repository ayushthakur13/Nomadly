import api from "./api";
import { extractApiError, type ApiError } from "../utils/errorHandling";

export interface PublicProfileResponse {
  user: {
    username: string;
    name?: string;
    profilePicUrl?: string | null;
    bio?: string;
    publicTripCount: number;
  };
  trips: any[];
}

/**
 * Fetch a user's public profile and their public trips grid
 */
export const fetchPublicProfileAPI = async (username: string): Promise<PublicProfileResponse> => {
  try {
    const response = await api.get(`/users/public/${username}`);
    return response.data.data;
  } catch (error) {
    throw new Error(extractApiError(error as ApiError, "Failed to fetch public profile"));
  }
};

/**
 * Update authenticated user's profile details
 */
export const updateProfileAPI = async (updates: any): Promise<any> => {
  try {
    const response = await api.patch("/users/me", updates);
    return response.data;
  } catch (error) {
    throw new Error(extractApiError(error as ApiError, "Failed to update profile"));
  }
};

/**
 * Update authenticated user's username
 */
export const updateUsernameAPI = async (username: string): Promise<any> => {
  try {
    const response = await api.patch("/users/me/username", { username });
    return response.data;
  } catch (error) {
    throw new Error(extractApiError(error as ApiError, "Failed to update username"));
  }
};

/**
 * Upload authenticated user's avatar image
 */
export const uploadAvatarAPI = async (formData: FormData): Promise<any> => {
  try {
    const response = await api.post("/users/me/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    throw new Error(extractApiError(error as ApiError, "Failed to upload avatar"));
  }
};

/**
 * Delete authenticated user's avatar image
 */
export const deleteAvatarAPI = async (): Promise<any> => {
  try {
    const response = await api.delete("/users/me/avatar");
    return response.data;
  } catch (error) {
    throw new Error(extractApiError(error as ApiError, "Failed to remove avatar"));
  }
};

/**
 * Fetch authenticated user's profile details
 */
export const fetchCurrentUserAPI = async (): Promise<any> => {
  try {
    const response = await api.get("/users/me");
    return response.data;
  } catch (error) {
    throw new Error(extractApiError(error as ApiError, "Failed to fetch current user"));
  }
};

/**
 * Update authenticated user's password
 */
export const updatePasswordAPI = async (payload: any): Promise<any> => {
  try {
    const response = await api.patch("/users/me/password", payload);
    return response.data;
  } catch (error) {
    throw new Error(extractApiError(error as ApiError, "Failed to update password"));
  }
};

