import { Types } from 'mongoose';
import slugify from 'slugify';
import Trip, { ITrip } from './trip.model';
import { isTripCreator, isTripMember } from '../members/member.utils'

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
  canAccessTrip,
  calculateTripProgress,
  validateTripDates
};