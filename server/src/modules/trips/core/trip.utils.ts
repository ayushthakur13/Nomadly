import { Types } from 'mongoose';
import slugify from 'slugify';
import Trip, { ITrip } from './trip.model';

export async function generateUniqueSlug(tripName: string, tripId?: Types.ObjectId): Promise<string> {
  let baseSlug = slugify(tripName, { lower: true, strict: true });
  let slug = baseSlug;
  let counter = 1;
  while (await Trip.findOne({ slug, _id: { $ne: tripId } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  return slug;
}

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

export function canAccessTrip(trip: ITrip, userId?: Types.ObjectId | string): boolean {
  if ((trip as any).isPublic) return true;
  if (!userId) return false;
  if (isTripCreator(trip, userId)) return true;
  return isTripMember(trip, userId);
}

export function calculateTripProgress(startDate: Date, endDate: Date): number {
  const now = new Date();
  const start = startDate.getTime();
  const end = endDate.getTime();
  const current = now.getTime();
  if (current < start) return 0;
  if (current > end) return 100;
  const totalDuration = end - start;
  const elapsed = current - start;
  return Math.round((elapsed / totalDuration) * 100);
}

export function validateTripDates(startDate: Date, endDate: Date): { valid: boolean; error?: string } {
  if (endDate < startDate) {
    return { valid: false, error: 'End date must be after start date' };
  }
  const maxDuration = 365;
  const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  if (durationDays > maxDuration) {
    return { valid: false, error: `Trip duration cannot exceed ${maxDuration} days` };
  }
  return { valid: true };
}

export default {
  generateUniqueSlug,
  isTripMember,
  getMemberRole,
  canEditTrip,
  isTripCreator,
  addMemberToTrip,
  removeMemberFromTrip,
  updateMemberRole,
  canAccessTrip,
  calculateTripProgress,
  validateTripDates,
  normalizeMemberRole
};