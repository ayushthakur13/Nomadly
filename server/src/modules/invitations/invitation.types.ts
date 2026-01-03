import { Types } from 'mongoose';
import { InvitationStatus } from './invitation.model';

export interface CreateInvitationDTO {
  tripId: string;
  invitedBy: string;
  invitedUserId?: string; // For inviting by username/userId
  invitedEmail?: string; // For inviting by email
  message?: string;
  expiresInDays?: number; // Default: 7 days
}

export interface UpdateInvitationStatusDTO {
  status: InvitationStatus.ACCEPTED | InvitationStatus.REJECTED | InvitationStatus.CANCELLED;
}

export interface InvitationQueryFilters {
  tripId?: string;
  invitedUserId?: string;
  invitedEmail?: string;
  invitedBy?: string;
  status?: InvitationStatus | InvitationStatus[];
  includeExpired?: boolean;
  page?: number;
  limit?: number;
}

export interface InvitationDTO {
  _id: Types.ObjectId | string;
  tripId: Types.ObjectId | string;
  invitedBy: Types.ObjectId | string;
  invitedUserId?: Types.ObjectId | string;
  invitedEmail?: string;
  status: InvitationStatus;
  message?: string;
  token?: string;
  expiresAt: Date;
  respondedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  // Populated fields
  trip?: {
    tripName: string;
    slug?: string;
    coverImageUrl?: string;
    startDate: Date;
    endDate: Date;
  };
  inviter?: {
    username: string;
    name?: string;
    profilePicUrl?: string;
  };
  invitedUser?: {
    username: string;
    name?: string;
    profilePicUrl?: string;
  };
}

export interface AcceptInvitationResult {
  invitation: InvitationDTO;
  trip: any; // ITrip with updated members
  memberAdded: boolean;
}
