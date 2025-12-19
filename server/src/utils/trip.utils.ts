import { Types } from 'mongoose';
import slugify from 'slugify';
import Trip, { ITrip, TripStatus } from '../models/trip.model';

/**
 * Utility functions for Trip operations
 */

/**
 * Generate unique slug from trip name
 */
export async function generateUniqueSlug(tripName: string, tripId?: Types.ObjectId): Promise<string> {
  let baseSlug = slugify(tripName, { lower: true, strict: true });
  let slug = baseSlug;
  let counter = 1;
  
  // Ensure unique slug
  while (await Trip.findOne({ slug, _id: { $ne: tripId } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
}

/**
 * Calculate trip status based on dates (preserves draft status)
 */
export function calculateTripStatus(startDate: Date, endDate: Date, currentStatus: TripStatus): TripStatus {
  // Don't auto-update draft status
  if (currentStatus === TripStatus.DRAFT) {
    return TripStatus.DRAFT;
  }
  
  const now = new Date();
  
  if (now < startDate) {
    return TripStatus.UPCOMING;
  } else if (now >= startDate && now <= endDate) {
    return TripStatus.ONGOING;
  } else {
    return TripStatus.COMPLETED;
  }
}

/**
 * Calculate trip status based on dates (for publishing - ignores draft)
 */
export function calculateTripStatusForPublish(startDate: Date, endDate: Date): TripStatus {
  const now = new Date();
  
  if (now < startDate) {
    return TripStatus.UPCOMING;
  } else if (now >= startDate && now <= endDate) {
    return TripStatus.ONGOING;
  } else {
    return TripStatus.COMPLETED;
  }
}

/**
 * Check if user is member of trip
 */
export function isTripMember(trip: ITrip, userId: Types.ObjectId | string): boolean {
  const userIdStr = userId.toString();
  return trip.members.some((m: any) => {
    const memberId = (m.userId && typeof m.userId === 'object' && (m.userId as any)._id)
      ? (m.userId as any)._id
      : m.userId;
    return memberId && memberId.toString() === userIdStr;
  });
}

/**
 * Normalize stored role values to the new model (creator/member)
 * Legacy values 'editor' or 'viewer' are treated as 'member'.
 */
export function normalizeMemberRole(role: string): 'creator' | 'member' {
  if (role === 'creator') return 'creator';
  return 'member';
}

/**
 * Get member role in trip (handles populated userId objects)
 */
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

/**
 * Check if user has edit permission
 */
export function canEditTrip(trip: ITrip, userId: Types.ObjectId | string): boolean {
  const role = getMemberRole(trip, userId);
  return role === 'creator' || role === 'member';
}

/**
 * Check if user is trip creator
 */
export function isTripCreator(trip: ITrip, userId: Types.ObjectId | string): boolean {
  return trip.createdBy.toString() === userId.toString();
}

/**
 * Add member to trip
 */
export function addMemberToTrip(
  trip: ITrip,
  userId: Types.ObjectId,
  role: 'member',
  invitedBy?: Types.ObjectId
): void {
  // Check if member already exists
  const exists = trip.members.some(m => m.userId.toString() === userId.toString());
  if (exists) {
    throw new Error('Member already exists in trip');
  }
  
  trip.members.push({
    userId,
    role,
    joinedAt: new Date(),
    invitedBy: invitedBy || undefined
  } as any);
  
  trip.membersCount = trip.members.length;
}

/**
 * Remove member from trip
 */
export function removeMemberFromTrip(trip: ITrip, userId: Types.ObjectId): void {
  // Don't allow removing creator
  if (isTripCreator(trip, userId)) {
    throw new Error('Cannot remove trip creator');
  }
  
  trip.members = trip.members.filter(m => m.userId.toString() !== userId.toString());
  trip.membersCount = trip.members.length;
}

/**
 * Update member role
 */
export function updateMemberRole(
  trip: ITrip,
  userId: Types.ObjectId,
  newRole: 'member'
): void {
  // Don't allow changing creator role
  if (isTripCreator(trip, userId)) {
    throw new Error('Cannot change creator role');
  }
  
  const member = trip.members.find(m => m.userId.toString() === userId.toString());
  if (!member) {
    throw new Error('Member not found in trip');
  }
  
  member.role = newRole;
}

/**
 * Check if user can access trip (public or member)
 */
export function canAccessTrip(trip: ITrip, userId?: Types.ObjectId | string): boolean {
  if (trip.isPublic) return true;
  if (!userId) return false;
  if (isTripCreator(trip, userId)) return true;
  return isTripMember(trip, userId);
}

/**
 * Calculate trip progress percentage (0-100)
 */
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

/**
 * Validate trip dates
 */
export function validateTripDates(startDate: Date, endDate: Date): { valid: boolean; error?: string } {
  if (endDate < startDate) {
    return { valid: false, error: 'End date must be after start date' };
  }
  
  // Optional: Add more validations
  const maxDuration = 365; // 1 year
  const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (durationDays > maxDuration) {
    return { valid: false, error: `Trip duration cannot exceed ${maxDuration} days` };
  }
  
  return { valid: true };
}

export default {
  generateUniqueSlug,
  calculateTripStatus,
  calculateTripStatusForPublish,
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