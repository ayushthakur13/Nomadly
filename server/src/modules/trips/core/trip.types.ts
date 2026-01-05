// Import shared domain types from monorepo
import { TripLifecycleStatus, TripCategory } from '../../../../../shared/types';

// Re-export for backward compatibility
export { TripLifecycleStatus, TripCategory };

// Import and re-export DTOs (these are API contracts, so they belong in shared)
export type { CreateTripDTO, UpdateTripDTO, LocationDTO } from '../../../../../shared/types';

export interface TripQueryFilters {
  userId?: string;
  lifecycleStatus?: TripLifecycleStatus;
  category?: TripCategory | string;
  isPublic?: boolean;
  isFeatured?: boolean;
  search?: string;
  startDateFrom?: string | Date;
  startDateTo?: string | Date;
  tags?: string[];
  destination?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'startDate' | 'engagement.views' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedTripsResponse {
  success: boolean;
  data: {
    trips: any[];
    pagination: { currentPage: number; totalPages: number; totalTrips: number; hasNextPage: boolean; hasPrevPage: boolean; };
  };
}

export interface LocationSearchResult {
  name: string;
  address: string;
  coordinates: { lat: number; lng: number; };
  placeId: string;
  type?: string;
  country?: string;
  city?: string;
}

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
}

export interface InviteMemberDTO {
  email?: string;
  username?: string;
  role: 'member';
  message?: string;
}

export interface CloneTripOptions {
  includeMembers?: boolean;
  includeDestinations?: boolean;
  includeTasks?: boolean;
  includeBudget?: boolean;
  newTripName?: string;
  newStartDate?: Date;
}
