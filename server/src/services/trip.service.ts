import { Types } from 'mongoose';
import Trip, { ITrip, TripStatus } from '../models/trip.model';
// Ensure Destination model is registered before population
import '../models/destination.model';
import User from '../models/user.model';
import { CreateTripDTO, UpdateTripDTO, TripQueryFilters, CloneTripOptions } from '../types/trip.types';
import mapService from './map.service';
import tripUtils from '../utils/trip.utils';

/**
 * Trip Service Layer
 * Business logic for trip operations
 */
class TripService {
  /**
   * Create a new trip
   */
  async createTrip(userId: string, data: CreateTripDTO): Promise<ITrip> {
    // Validate coordinates if provided
    if (data.destinationCoordinates) {
      const { lat, lng } = data.destinationCoordinates;
      if (!mapService.validateCoordinates(lat, lng)) {
        throw new Error('Invalid destination coordinates');
      }
    }

    // Prepare destinationPoint (GeoJSON) if coordinates exist
    let destinationPoint: any = undefined;
    if (data.destinationCoordinates) {
      destinationPoint = mapService.buildGeoPoint(data.destinationCoordinates.lat, data.destinationCoordinates.lng);
    }

    if (data.sourceLocation?.coordinates) {
      const { lat, lng } = data.sourceLocation.coordinates;
      if (!mapService.validateCoordinates(lat, lng)) {
        throw new Error('Invalid source coordinates');
      }
    }

    // Validate dates
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    const dateValidation = tripUtils.validateTripDates(startDate, endDate);
    if (!dateValidation.valid) {
      throw new Error(dateValidation.error);
    }

    // Generate unique slug
    const slug = await tripUtils.generateUniqueSlug(data.tripName);

    // Create trip data - exclude destinationCoordinates as it's converted to destinationPoint
    const { destinationCoordinates, ...cleanData } = data;
    
    const tripData: any = {
      ...cleanData,
      slug,
      startDate,
      endDate,
      createdBy: new Types.ObjectId(userId),
      members: [
        {
          userId: new Types.ObjectId(userId),
          role: 'creator' as const,
          joinedAt: new Date()
        }
      ],
      membersCount: 1,
      status: TripStatus.DRAFT
    };

    if (destinationPoint) {
      tripData.destinationPoint = destinationPoint;
    }

    const trip = new Trip(tripData);
    await trip.save();

    // Increment user's trip count (denormalized)
    await User.findByIdAndUpdate(userId, { $inc: { 'stats.tripsCount': 1 } });

    return trip;
  }

  /**
   * Get all trips with filters and pagination
   */
  async getTrips(filters: TripQueryFilters, requestingUserId?: string) {
    const {
      userId,
      status,
      category,
      isPublic,
      isFeatured,
      search,
      startDateFrom,
      startDateTo,
      tags,
      destination,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = filters;

    // Build query
    const query: any = {};
    const conditions: any[] = [];

    // User/membership filter
    if (userId) {
      const membershipCondition = {
        $or: [
          { createdBy: new Types.ObjectId(userId) },
          { 'members.userId': new Types.ObjectId(userId) }
        ]
      };
      
      if (requestingUserId !== userId) {
        membershipCondition.$or = membershipCondition.$or.map(c => ({ ...c, isPublic: true }));
      }
      
      conditions.push(membershipCondition);
    } else {
      query.isPublic = true;
    }

    // Status and category filters
    if (status) query.status = status;
    if (category) query.category = category;
    if (isPublic !== undefined) query.isPublic = isPublic;
    if (isFeatured !== undefined) query.isFeatured = isFeatured;

    // Search filter (preserves membership constraints)
    if (search) {
      conditions.push({
        $or: [
          { tripName: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { mainDestination: { $regex: search, $options: 'i' } }
        ]
      });
    }

    // Merge conditions
    if (conditions.length > 1) {
      query.$and = conditions;
    } else if (conditions.length === 1) {
      Object.assign(query, conditions[0]);
    }

    if (destination) {
      query.mainDestination = { $regex: destination, $options: 'i' };
    }

    if (startDateFrom || startDateTo) {
      query.startDate = {};
      if (startDateFrom) query.startDate.$gte = new Date(startDateFrom);
      if (startDateTo) query.startDate.$lte = new Date(startDateTo);
    }

    if (tags && tags.length > 0) {
      query.tags = { $in: tags };
    }

    // Pagination
    const skip = (page - 1) * limit;
    const sortOption: any = {};
    sortOption[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query
    const [trips, totalTrips] = await Promise.all([
      Trip.find(query)
        .populate('createdBy', 'username name profilePicUrl')
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean(),
      Trip.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalTrips / limit);

    return {
      trips,
      pagination: {
        currentPage: page,
        totalPages,
        totalTrips,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
  }

  /**
   * Get single trip by ID or slug
   */
  async getTripById(tripIdOrSlug: string, requestingUserId?: string): Promise<ITrip | null> {
    let trip;
    
    if (Types.ObjectId.isValid(tripIdOrSlug)) {
      trip = await Trip.findById(tripIdOrSlug)
        .populate('createdBy', 'username name profilePicUrl email')
        .populate('members.userId', 'username name profilePicUrl')
        .populate('destinations')
        .lean();
    } else {
      trip = await Trip.findOne({ slug: tripIdOrSlug })
        .populate('createdBy', 'username name profilePicUrl email')
        .populate('members.userId', 'username name profilePicUrl')
        .populate('destinations')
        .lean();
    }

    if (!trip) return null;

    // Check access permission
    const canAccess = tripUtils.canAccessTrip(
      trip as ITrip, 
      requestingUserId ? new Types.ObjectId(requestingUserId) : undefined
    );

    if (!canAccess) {
      throw new Error('TRIP_PRIVATE');
    }

    // Increment view count (only if not member)
    const isMember = requestingUserId && tripUtils.isTripMember(trip as ITrip, requestingUserId);
    if (!isMember) {
      await Trip.findByIdAndUpdate(trip._id, { $inc: { viewsCount: 1 } });
    }

    return trip as ITrip;
  }

  /**
   * Update trip
   */
  async updateTrip(tripId: string, userId: string, updates: UpdateTripDTO): Promise<ITrip | null> {
    const trip = await Trip.findById(tripId);
    if (!trip) return null;

    // Check permission
    if (!tripUtils.canEditTrip(trip, userId)) {
      throw new Error('INSUFFICIENT_PERMISSIONS');
    }

    // Validate coordinates and prepare destinationPoint
    if (updates.destinationCoordinates) {
      const { lat, lng } = updates.destinationCoordinates;
      if (!mapService.validateCoordinates(lat, lng)) {
        throw new Error('Invalid destination coordinates');
      }
      (updates as any).destinationPoint = mapService.buildGeoPoint(lat, lng);
    }

    if (updates.sourceLocation?.coordinates) {
      const { lat, lng } = updates.sourceLocation.coordinates;
      if (!mapService.validateCoordinates(lat, lng)) {
        throw new Error('Invalid source coordinates');
      }
    }

    // Validate dates
    if (updates.startDate && updates.endDate) {
      const dateValidation = tripUtils.validateTripDates(
        new Date(updates.startDate),
        new Date(updates.endDate)
      );
      if (!dateValidation.valid) {
        throw new Error(dateValidation.error);
      }
    }

    // Update slug if trip name changed
    if (updates.tripName && updates.tripName !== trip.tripName) {
      const newSlug = await tripUtils.generateUniqueSlug(updates.tripName, trip._id);
      (updates as any).slug = newSlug;
    }

    // Convert dates
    if (updates.startDate) updates.startDate = new Date(updates.startDate);
    if (updates.endDate) updates.endDate = new Date(updates.endDate);

    Object.assign(trip, updates);
    await trip.save();

    return trip;
  }

  /**
   * Delete trip
   */
  async deleteTrip(tripId: string, userId: string): Promise<boolean> {
    const trip = await Trip.findById(tripId);
    if (!trip) return false;

    if (!tripUtils.isTripCreator(trip, userId)) {
      throw new Error('ONLY_CREATOR_CAN_DELETE');
    }

    await Trip.findByIdAndDelete(tripId);
    await User.findByIdAndUpdate(userId, { $inc: { 'stats.tripsCount': -1 } });

    return true;
  }

  /**
   * Publish trip
   */
  async publishTrip(tripId: string, userId: string): Promise<ITrip | null> {
    const trip = await Trip.findById(tripId);
    if (!trip) return null;

    if (!tripUtils.isTripCreator(trip, userId)) {
      throw new Error('ONLY_CREATOR_CAN_PUBLISH');
    }

    trip.isPublic = true;
    // Update status to reflect current date position when publishing
    trip.status = tripUtils.calculateTripStatusForPublish(trip.startDate, trip.endDate);

    await trip.save();
    return trip;
  }

  /**
   * Unpublish trip
   */
  async unpublishTrip(tripId: string, userId: string): Promise<ITrip | null> {
    const trip = await Trip.findById(tripId);
    if (!trip) return null;

    if (!tripUtils.isTripCreator(trip, userId)) {
      throw new Error('ONLY_CREATOR_CAN_UNPUBLISH');
    }

    trip.isPublic = false;
    await trip.save();
    return trip;
  }

  /**
   * Update cover image
   */
  async updateCoverImage(
    tripId: string,
    userId: string,
    imageUrl: string,
    publicId: string
  ): Promise<{ trip: ITrip; oldPublicId: string | null }> {
    const trip = await Trip.findById(tripId);
    if (!trip) throw new Error('TRIP_NOT_FOUND');

    if (!tripUtils.canEditTrip(trip, userId)) {
      throw new Error('INSUFFICIENT_PERMISSIONS');
    }

    const oldPublicId = trip.coverImagePublicId || null;
    trip.coverImageUrl = imageUrl;
    trip.coverImagePublicId = publicId;
    await trip.save();

    return { trip, oldPublicId };
  }

  /**
   * Delete cover image
   */
  async deleteCoverImage(tripId: string, userId: string): Promise<ITrip | null> {
    const trip = await Trip.findById(tripId);
    if (!trip) return null;

    if (!tripUtils.canEditTrip(trip, userId)) {
      throw new Error('INSUFFICIENT_PERMISSIONS');
    }

    trip.coverImageUrl = null as any;
    trip.coverImagePublicId = null as any;
    await trip.save();

    return trip;
  }

  /**
   * Get user's trips
   */
  async getUserTrips(userId: string, includePrivate = true): Promise<ITrip[]> {
    const query: any = {
      $or: [
        { createdBy: new Types.ObjectId(userId) },
        { 'members.userId': new Types.ObjectId(userId) }
      ]
    };
    
    if (!includePrivate) query.isPublic = true;

    return Trip.find(query)
      .populate('createdBy', 'username name profilePicUrl')
      .sort({ createdAt: -1 })
      .lean();
  }

  /**
   * Clone trip
   */
  async cloneTrip(tripId: string, userId: string, options: CloneTripOptions = {}): Promise<ITrip> {
    const originalTrip = await Trip.findById(tripId).populate('destinations').lean();
    if (!originalTrip) throw new Error('TRIP_NOT_FOUND');

    if (!tripUtils.canAccessTrip(originalTrip as ITrip, userId)) {
      throw new Error('TRIP_PRIVATE');
    }

    const { newTripName, newStartDate, includeBudget = true } = options;
    const slug = await tripUtils.generateUniqueSlug(newTripName || `${originalTrip.tripName} (Copy)`);

    const clonedData: any = {
      ...originalTrip,
      _id: undefined,
      tripName: newTripName || `${originalTrip.tripName} (Copy)`,
      slug,
      startDate: newStartDate || new Date(),
      endDate: newStartDate 
        ? new Date(newStartDate.getTime() + (originalTrip.endDate.getTime() - originalTrip.startDate.getTime()))
        : new Date(Date.now() + (originalTrip.endDate.getTime() - originalTrip.startDate.getTime())),
      isPublic: false,
      createdBy: new Types.ObjectId(userId),
      members: [{ userId: new Types.ObjectId(userId), role: 'creator' as const, joinedAt: new Date() }],
      membersCount: 1,
      status: TripStatus.DRAFT,
      viewsCount: 0,
      likesCount: 0,
      savesCount: 0,
      sharesCount: 0,
      clonesCount: 0
    };

    if (includeBudget && originalTrip.budgetSummary) {
      clonedData.budgetSummary = {
        total: originalTrip.budgetSummary.total,
        spent: 0,
        remaining: originalTrip.budgetSummary.total
      };
    }

    const clonedTrip = new Trip(clonedData);
    await clonedTrip.save();

    await Trip.findByIdAndUpdate(tripId, { $inc: { clonesCount: 1 } });
    await User.findByIdAndUpdate(userId, { $inc: { 'stats.tripsCount': 1 } });

    return clonedTrip;
  }

  /**
   * Get featured trips
   */
  async getFeaturedTrips(limit = 10): Promise<ITrip[]> {
    return Trip.find({ isFeatured: true, isPublic: true })
      .populate('createdBy', 'username name profilePicUrl')
      .sort({ likesCount: -1, viewsCount: -1, createdAt: -1 })
      .limit(limit)
      .lean();
  }

  /**
   * Search by destination
   */
  async searchByDestination(destinationName: string, limit = 10): Promise<ITrip[]> {
    return Trip.find({
      isPublic: true,
      mainDestination: { $regex: destinationName, $options: 'i' }
    })
      .limit(limit)
      .populate('createdBy', 'username name profilePicUrl')
      .sort({ likesCount: -1, viewsCount: -1 })
      .lean();
  }

  /**
   * Get nearby trips
   */
  async getTripsNearLocation(lat: number, lng: number, maxDistanceKm = 100, limit = 20): Promise<ITrip[]> {
    return Trip.find({
      isPublic: true,
      destinationPoint: {
        $near: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: maxDistanceKm * 1000
        }
      }
    })
      .limit(limit)
      .populate('createdBy', 'username name profilePicUrl')
      .lean();
  }
}

export default new TripService();