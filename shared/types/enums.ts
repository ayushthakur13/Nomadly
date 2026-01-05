/**
 * Shared enums used across client and server
 * These represent the domain's business rules and API contracts
 * 
 * Note: Using const enums for better ES module compatibility
 */

export const TripLifecycleStatus = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
} as const;

export type TripLifecycleStatus = typeof TripLifecycleStatus[keyof typeof TripLifecycleStatus];

export const TripCategory = {
  ADVENTURE: 'adventure',
  LEISURE: 'leisure',
  BUSINESS: 'business',
  FAMILY: 'family',
  SOLO: 'solo',
  COUPLE: 'couple',
  FRIENDS: 'friends',
  BACKPACKING: 'backpacking',
  LUXURY: 'luxury',
  BUDGET: 'budget',
} as const;

export type TripCategory = typeof TripCategory[keyof typeof TripCategory];

export type TripMemberRole = 'creator' | 'member';

export type TripTimeStatus = 'upcoming' | 'ongoing' | 'completed';
