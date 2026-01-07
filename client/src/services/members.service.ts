import api from './api';
import { extractApiError, type ApiError } from '../utils/errorHandling';
import type { TripMember as IBaseTripMember, AddMemberPayload as IAddMemberPayload } from '@shared/types';

/**
 * Re-export and extend types for convenience
 */
export type TripMember = IBaseTripMember & { name?: string; username?: string; profilePicUrl?: string };
export type AddMemberPayload = IAddMemberPayload;

/**
 * Normalization helper for member responses
 */
const normalizeMembersResponse = (responseData: any): TripMember[] => {
  if (responseData?.data?.members) return responseData.data.members;
  if (responseData?.members) return responseData.members;
  return responseData;
};

/**
 * Fetch all members of a trip
 */
export async function fetchTripMembers(tripId: string): Promise<TripMember[]> {
  try {
    const response = await api.get(`/trips/${tripId}/members?includeUserDetails=true`);
    return normalizeMembersResponse(response.data);
  } catch (error) {
    throw new Error(extractApiError(error as ApiError, 'Failed to fetch trip members'));
  }
}

/**
 * Add a member to a trip (creator only)
 */
export async function addTripMember(tripId: string, payload: AddMemberPayload): Promise<void> {
  try {
    await api.post(`/trips/${tripId}/members`, payload);
  } catch (error) {
    throw new Error(extractApiError(error as ApiError, 'Failed to add member'));
  }
}

/**
 * Remove a member from a trip (creator only)
 */
export async function removeTripMember(tripId: string, userId: string): Promise<void> {
  try {
    await api.delete(`/trips/${tripId}/members/${userId}`);
  } catch (error) {
    throw new Error(extractApiError(error as ApiError, 'Failed to remove member'));
  }
}

/**
 * Leave a trip (non-creator only)
 */
export async function leaveTripAsMe(tripId: string): Promise<void> {
  try {
    await api.post(`/trips/${tripId}/members/leave`);
  } catch (error) {
    throw new Error(extractApiError(error as ApiError, 'Failed to leave trip'));
  }
}
