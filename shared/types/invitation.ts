/**
 * Shared Invitation types used by both frontend and backend
 */

export type InvitationStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'expired';
export type MemberRole = 'creator' | 'member';

/**
 * Invitation response type (API response from backend)
 * Used when fetching invitations with populated relations
 */
export interface Invitation {
  _id: string;
  tripId: {
    _id?: string;
    tripName: string;
    slug?: string;
    coverImageUrl?: string;
    startDate?: string;
    endDate?: string;
  };
  invitedBy: {
    _id?: string;
    username: string;
    name?: string;
    profilePicUrl?: string;
  };
  invitedUserId?: {
    _id?: string;
    username: string;
    name?: string;
    profilePicUrl?: string;
  } | null;
  invitedEmail?: string;
  message?: string;
  status: InvitationStatus;
  createdAt: string;
  expiresAt?: string;
}

/**
 * Payload to create an invitation
 */
export interface CreateInvitationPayload {
  email?: string;
  username?: string;
  message?: string;
}

/**
 * Query options for fetching invitations
 */
export interface InvitationQueryOptions {
  status?: InvitationStatus;
}
