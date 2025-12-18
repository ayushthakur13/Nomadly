import { TripStatus, TripCategory } from '../models/trip.model';

/**
 * DTO for creating a new trip
 */
export interface CreateTripDTO {
  tripName: string;
  description?: string;
  startDate: string | Date;
  endDate: string | Date;
  mainDestination: string;
  sourceLocation?: {
    name: string;
    address?: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    placeId?: string;
  };
  destinationCoordinates?: {
    lat: number;
    lng: number;
  };
  category?: TripCategory | string;
  tags?: string[];
  isPublic?: boolean;
}

/**
 * DTO for updating a trip
 */
export interface UpdateTripDTO {
  tripName?: string;
  description?: string;
  startDate?: string | Date;
  endDate?: string | Date;
  mainDestination?: string;
  sourceLocation?: {
    name: string;
    address?: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    placeId?: string;
  };
  destinationCoordinates?: {
    lat: number;
    lng: number;
  };
  category?: TripCategory | string;
  tags?: string[];
  isPublic?: boolean;
  status?: TripStatus;
}

/**
 * Query filters for fetching trips
 */
export interface TripQueryFilters {
  userId?: string;
  status?: TripStatus;
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
  sortBy?: 'createdAt' | 'startDate' | 'viewsCount' | 'likesCount' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated response structure
 */
export interface PaginatedTripsResponse {
  success: boolean;
  data: {
    trips: any[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalTrips: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

/**
 * Map service response for location search
 */
export interface LocationSearchResult {
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  placeId: string;
  type?: string;
  country?: string;
  city?: string;
}

/**
 * Cloudinary upload result
 */
export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
}

/**
 * Member invitation DTO
 */
export interface InviteMemberDTO {
  email?: string;
  username?: string;
  role: 'editor' | 'viewer';
  message?: string;
}

/**
 * Trip clone options
 */
export interface CloneTripOptions {
  includeMembers?: boolean;
  includeDestinations?: boolean;
  includeTasks?: boolean;
  includeBudget?: boolean;
  newTripName?: string;
  newStartDate?: Date;
}