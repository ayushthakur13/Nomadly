import { Types } from 'mongoose';

export type MemberRole = 'creator' | 'member';

export interface MemberDTO {
  userId: Types.ObjectId | string;
  role: MemberRole;
  joinedAt: Date;
  invitedBy?: Types.ObjectId | string | undefined;
  username?: string;
  name?: string;
  profilePicUrl?: string;
}

export interface AddMemberDTO {
  userId: string;
  invitedBy?: string;
}

export interface UpdateMemberRoleDTO {
  role: 'member';
}

export interface MemberListQueryDTO {
  tripId: string;
  includeUserDetails?: boolean;
}

export interface MemberPermissionCheck {
  userId: string;
  tripId: string;
  requiredRole?: MemberRole;
}
