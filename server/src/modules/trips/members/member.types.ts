import type { MemberRole, AddMemberPayload, TripMember } from '../../../../../shared';

// Re-export AddMemberPayload as AddMemberDTO for consistency with server naming
export type AddMemberDTO = AddMemberPayload;

// Re-export TripMember as MemberDTO for consistency with server naming
export type MemberDTO = TripMember;

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
