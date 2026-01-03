import { Types } from 'mongoose';
import { ITrip } from '../core/trip.model';

export function isTripMember(trip: ITrip, userId: Types.ObjectId | string): boolean {
  const userIdStr = userId.toString();
  return trip.members.some((m: any) => {
    const memberId = (m.userId && typeof m.userId === 'object' && (m.userId as any)._id)
      ? (m.userId as any)._id
      : m.userId;
    return memberId && memberId.toString() === userIdStr;
  });
}

export function normalizeMemberRole(role: string): 'creator' | 'member' {
  if (role === 'creator') return 'creator';
  return 'member';
}

export function getMemberRole(trip: ITrip, userId: Types.ObjectId | string): 'creator' | 'member' | null {
  const userIdStr = userId.toString();
  const member = trip.members.find(m => {
    const memberId = (m.userId && typeof m.userId === 'object' && (m.userId as any)._id)
      ? (m.userId as any)._id
      : m.userId;
    return memberId && memberId.toString() === userIdStr;
  });
  if (!member) return null;
  return normalizeMemberRole(member.role as any);
}

export function canEditTrip(trip: ITrip, userId: Types.ObjectId | string): boolean {
  const role = getMemberRole(trip, userId);
  return role === 'creator' || role === 'member';
}

export function isTripCreator(trip: ITrip, userId: Types.ObjectId | string): boolean {
  return (trip.createdBy as any).toString() === userId.toString();
}

export function addMemberToTrip(
  trip: ITrip,
  userId: Types.ObjectId,
  role: 'member',
  invitedBy?: Types.ObjectId
): void {
  const exists = trip.members.some(m => (m.userId as any).toString() === userId.toString());
  if (exists) throw new Error('Member already exists in trip');
  (trip.members as any).push({ userId, role, joinedAt: new Date(), invitedBy: invitedBy || undefined });
  (trip as any).membersCount = trip.members.length;
}

export function removeMemberFromTrip(trip: ITrip, userId: Types.ObjectId): void {
  if (isTripCreator(trip, userId)) throw new Error('Cannot remove trip creator');
  (trip.members as any) = trip.members.filter(m => (m.userId as any).toString() !== userId.toString());
  (trip as any).membersCount = trip.members.length;
}

export function updateMemberRole(
  trip: ITrip,
  userId: Types.ObjectId,
  newRole: 'member'
): void {
  if (isTripCreator(trip, userId)) throw new Error('Cannot change creator role');
  const member: any = (trip.members as any).find((m: any) => (m.userId as any).toString() === userId.toString());
  if (!member) throw new Error('Member not found in trip');
  member.role = newRole;
}

export default {
    isTripMember,
    normalizeMemberRole,
    getMemberRole,
    canEditTrip,
    isTripCreator,
    addMemberToTrip,
    removeMemberFromTrip,
    updateMemberRole
}