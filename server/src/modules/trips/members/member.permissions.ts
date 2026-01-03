import { Types } from 'mongoose';
import { ITrip } from '../core/trip.model';
import { isTripCreator, isTripMember } from './member.utils';

/**
 * Shared permission helper for ALL trip resource modifications
 * 
 * Use this across destinations, tasks, budget, memories, etc.
 * 
 * Rules:
 * - Creator: true
 * - Member: true  
 * - Non-member: false
 * 
 * @param trip The trip document
 * @param userId The user ID to check permissions for
 * @returns true if user can modify trip resources, false otherwise
 * 
 * @example
 * // In destination controller
 * if (!canModifyTripResources(trip, req.user.id)) {
 *   return res.status(403).json({ message: 'Not authorized' });
 * }
 * 
 * @example
 * // In task service
 * const trip = await Trip.findById(taskData.tripId);
 * if (!canModifyTripResources(trip, userId)) {
 *   throw new Error('User cannot modify this trip');
 * }
 */
export function canModifyTripResources(
  trip: ITrip,
  userId: Types.ObjectId | string
): boolean {
  // Creator can always modify
  if (isTripCreator(trip, userId)) {
    return true;
  }
  
  // Members can modify
  if (isTripMember(trip, userId)) {
    return true;
  }
  
  // Non-members cannot modify
  return false;
}

/**
 * Check if user can delete a trip (creator only)
 */
export function canDeleteTrip(
  trip: ITrip,
  userId: Types.ObjectId | string
): boolean {
  return isTripCreator(trip, userId);
}

/**
 * Check if user can manage members (add/remove) (creator only)
 */
export function canManageMembers(
  trip: ITrip,
  userId: Types.ObjectId | string
): boolean {
  return isTripCreator(trip, userId);
}

export default {
  canModifyTripResources,
  canDeleteTrip,
  canManageMembers
};
