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
