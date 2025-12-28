import { TripLifecycleStatus, TripCategory } from './trip.model';

export interface LocationDTO {
  name: string;
  address?: string;
  coordinates: { lat: number; lng: number; };
  placeId?: string;
}

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
