/**
 * Shared Member types used by both frontend and backend
 */

export type MemberRole = 'creator' | 'member';

/**
 * Trip member with user details
 * Used in member list responses
 */
export interface TripMember {
  userId: string;
  username?: string;
  name?: string;
  profilePicUrl?: string;
  role: MemberRole;
  joinedAt: string;
  invitedBy?: string;
}

/**
 * Payload to add a member to a trip
 */
export interface AddMemberPayload {
  email?: string;
  username?: string;
  message?: string;
  role?: 'member';
}

/**
 * Payload to update member role
 */
export interface UpdateMemberRolePayload {
  role: 'member';
}
