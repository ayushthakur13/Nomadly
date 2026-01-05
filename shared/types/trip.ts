/**
 * Trip domain types - API contract between client and server
 * These types are framework-agnostic and represent the core business domain
 */

import { TripLifecycleStatus, TripCategory, TripMemberRole, TripTimeStatus } from './enums';
import { Location, LocationDTO } from './common';

/**
 * Trip member within a trip
 */
export interface TripMember {
  userId: string;
  role: TripMemberRole;
  joinedAt: string;
  invitedBy?: string;
}

/**
 * Engagement metrics for a trip
 */
export interface TripEngagement {
  likes: number;
  saves: number;
  shares: number;
  views: number;
  clones: number;
}

/**
 * Budget summary for a trip
 */
export interface TripBudgetSummary {
  total: number;
  spent: number;
}

/**
 * Core Trip domain model
 * Represents the API contract for a trip resource
 */
export interface Trip {
  _id: string;
  tripName: string;
  slug?: string;
  description?: string;
  startDate: string;
  endDate: string;
  sourceLocation?: Location;
  destinationLocation: Location;
  coverImageUrl?: string;
  coverImagePublicId?: string;
  category?: TripCategory | string;
  tags?: string[];
  isPublic: boolean;
  isFeatured: boolean;
  lifecycleStatus: TripLifecycleStatus;
  createdBy: string;
  members: TripMember[];
  destinations: string[];
  tasksCount: number;
  membersCount: number;
  engagement: TripEngagement;
  budgetSummary?: TripBudgetSummary;
  createdAt: string;
  updatedAt: string;
  // Virtual fields computed by backend
  timeStatus?: TripTimeStatus;
  isOngoing?: boolean;
  durationDays?: number;
}

/**
 * DTO for creating a new trip
 */
export interface CreateTripDTO {
  tripName: string;
  description?: string;
  startDate: string | Date;
  endDate: string | Date;
  sourceLocation?: LocationDTO;
  destinationLocation: LocationDTO;
  category?: TripCategory | string;
  tags?: string[];
  isPublic?: boolean;
}

/**
 * DTO for updating an existing trip
 */
export interface UpdateTripDTO {
  tripName?: string;
  description?: string;
  startDate?: string | Date;
  endDate?: string | Date;
  sourceLocation?: LocationDTO;
  destinationLocation?: LocationDTO;
  category?: TripCategory | string;
  tags?: string[];
  isPublic?: boolean;
  lifecycleStatus?: TripLifecycleStatus;
}
