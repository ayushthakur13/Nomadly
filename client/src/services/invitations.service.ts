import api from './api';
import { extractApiError, type ApiError } from '../utils/errorHandling';
import type { Invitation as IInvitation, CreateInvitationPayload as ICreateInvitationPayload, InvitationQueryOptions as IInvitationQueryOptions } from '@shared/types';

/**
 * Re-export types for convenience
 */
export type Invitation = IInvitation;
export type CreateInvitationPayload = ICreateInvitationPayload;
export type InvitationQueryOptions = IInvitationQueryOptions;

/**
 * Normalization helpers
 */
const normalizeInvitationsResponse = (responseData: any): Invitation[] => {
  if (responseData?.data?.invitations) return responseData.data.invitations;
  if (responseData?.invitations) return responseData.invitations;
  return responseData;
};

/**
 * Create an invitation for a trip
 */
export async function createInvitation(tripId: string, payload: CreateInvitationPayload): Promise<Invitation> {
  try {
    const response = await api.post('/invitations', {
      tripId,
      invitedEmail: payload.email,
      invitedUsername: payload.username,
      message: payload.message,
    });
    return response.data?.data?.invitation || response.data?.invitation || response.data;
  } catch (error) {
    throw new Error(extractApiError(error as ApiError, 'Failed to send invitation'));
  }
}

/**
 * Fetch pending invitations for current user
 */
export async function fetchMyPendingInvitations(): Promise<Invitation[]> {
  try {
    const response = await api.get('/invitations/me/pending');
    return normalizeInvitationsResponse(response.data);
  } catch (error) {
    throw new Error(extractApiError(error as ApiError, 'Failed to fetch invitations'));
  }
}

/**
 * Fetch invitations for a specific trip (creator view)
 */
export async function fetchTripInvitations(tripId: string, options: InvitationQueryOptions = {}): Promise<Invitation[]> {
  const params = new URLSearchParams({ tripId });
  if (options.status) params.set('status', options.status);

  try {
    const response = await api.get(`/invitations?${params.toString()}`);
    return normalizeInvitationsResponse(response.data);
  } catch (error) {
    throw new Error(extractApiError(error as ApiError, 'Failed to fetch invitations'));
  }
}

/**
 * Accept an invitation
 */
export async function acceptInvitation(invitationId: string): Promise<void> {
  try {
    await api.post(`/invitations/${invitationId}/accept`);
  } catch (error) {
    throw new Error(extractApiError(error as ApiError, 'Failed to accept invitation'));
  }
}

/**
 * Reject an invitation
 */
export async function rejectInvitation(invitationId: string): Promise<void> {
  try {
    await api.post(`/invitations/${invitationId}/reject`);
  } catch (error) {
    throw new Error(extractApiError(error as ApiError, 'Failed to reject invitation'));
  }
}

/**
 * Cancel an invitation (creator only)
 */
export async function cancelInvitation(invitationId: string): Promise<void> {
  try {
    await api.post(`/invitations/${invitationId}/cancel`);
  } catch (error) {
    throw new Error(extractApiError(error as ApiError, 'Failed to cancel invitation'));
  }
}
