import { Types } from 'mongoose';
import Trip, { ITrip, TripLifecycleStatus } from './trip.model';
import '../destinations/destination.model';
import User from '../../users/user.model';
import { CreateTripDTO, UpdateTripDTO, TripQueryFilters, CloneTripOptions } from './trip.types';
import mapService from '../../maps/map.service';
import tripUtils from './trip.utils';

class TripService {
  async createTrip(userId: string, data: CreateTripDTO): Promise<ITrip> {
    if (!data.destinationLocation) {
      throw new Error('Destination location is required');
    }
    
    const { lat: destLat, lng: destLng } = data.destinationLocation.coordinates;
    if (!mapService.validateCoordinates(destLat, destLng)) {
      throw new Error('Invalid destination coordinates');
    }

    if (data.sourceLocation?.coordinates) {
      const { lat, lng } = data.sourceLocation.coordinates;
      if (!mapService.validateCoordinates(lat, lng)) {
        throw new Error('Invalid source coordinates');
      }
    }

    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    const dateValidation = tripUtils.validateTripDates(startDate, endDate);
    if (!dateValidation.valid) {
      throw new Error(dateValidation.error);
    }

    const slug = await tripUtils.generateUniqueSlug(data.tripName);

    const destinationLocation = {
      ...data.destinationLocation,
      point: mapService.buildGeoPoint(destLat, destLng)
    };

    const sourceLocation = data.sourceLocation ? {
      ...data.sourceLocation,
      point: mapService.buildGeoPoint(
        data.sourceLocation.coordinates.lat,
        data.sourceLocation.coordinates.lng
      )
    } : undefined;
    
    const tripData: any = {
      tripName: data.tripName,
      description: data.description,
      slug,
      startDate,
      endDate,
      destinationLocation,
      sourceLocation,
      category: data.category,
      tags: data.tags || [],
      isPublic: data.isPublic || false,
      lifecycleStatus: TripLifecycleStatus.DRAFT,
      createdBy: new Types.ObjectId(userId),
      members: [
        {
          userId: new Types.ObjectId(userId),
          role: 'creator' as const,
          joinedAt: new Date()
        }
      ]
    };

    const trip = new Trip(tripData);
    await trip.save();

    await User.findByIdAndUpdate(userId, { $inc: { 'stats.tripsCount': 1 } });

    return trip;
  }

  async getTrips(filters: TripQueryFilters, requestingUserId?: string) {
    const {
      userId,
      lifecycleStatus,
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

    const query: any = {};
    const conditions: any[] = [];

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

    if (lifecycleStatus) query.lifecycleStatus = lifecycleStatus;
    if (category) query.category = category;
    if (isPublic !== undefined) query.isPublic = isPublic;
    if (isFeatured !== undefined) query.isFeatured = isFeatured;

    if (search) {
      conditions.push({
        $or: [
          { tripName: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { 'destinationLocation.name': { $regex: search, $options: 'i' } }
        ]
      });
    }

    if (conditions.length > 1) {
      query.$and = conditions;
    } else if (conditions.length === 1) {
      Object.assign(query, conditions[0]);
    }

    if (destination) {
      query['destinationLocation.name'] = { $regex: destination, $options: 'i' };
    }

    if (startDateFrom || startDateTo) {
      query.startDate = {};
      if (startDateFrom) query.startDate.$gte = new Date(startDateFrom);
      if (startDateTo) query.startDate.$lte = new Date(startDateTo);
    }

    if (tags && tags.length > 0) {
      query.tags = { $in: tags };
    }

    const skip = (page - 1) * limit;
    const sortOption: any = {};
    sortOption[sortBy] = sortOrder === 'asc' ? 1 : -1;

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

    const canAccess = tripUtils.canAccessTrip(
      trip as ITrip, 
      requestingUserId ? new Types.ObjectId(requestingUserId) : undefined
    );

    if (!canAccess) {
      throw new Error('TRIP_PRIVATE');
    }

    const isMember = requestingUserId && tripUtils.isTripMember(trip as ITrip, requestingUserId);
    if (!isMember) {
      await Trip.findByIdAndUpdate(trip._id, { $inc: { 'engagement.views': 1 } });
    }

    return trip as ITrip;
  }

  async updateTrip(tripId: string, userId: string, updates: UpdateTripDTO): Promise<ITrip | null> {
    const trip = await Trip.findById(tripId);
    if (!trip) return null;

    if (!tripUtils.canEditTrip(trip, userId)) {
      throw new Error('INSUFFICIENT_PERMISSIONS');
    }

    if (updates.destinationLocation) {
      const { lat, lng } = updates.destinationLocation.coordinates;
      if (!mapService.validateCoordinates(lat, lng)) {
        throw new Error('Invalid destination coordinates');
      }
      (updates as any).destinationLocation = {
        ...updates.destinationLocation,
        point: mapService.buildGeoPoint(lat, lng)
      };
    }

    if (updates.sourceLocation) {
      const { lat, lng } = updates.sourceLocation.coordinates;
      if (!mapService.validateCoordinates(lat, lng)) {
        throw new Error('Invalid source coordinates');
      }
      (updates as any).sourceLocation = {
        ...updates.sourceLocation,
        point: mapService.buildGeoPoint(lat, lng)
      };
    }

    if (updates.startDate && updates.endDate) {
      const dateValidation = tripUtils.validateTripDates(
        new Date(updates.startDate),
        new Date(updates.endDate)
      );
      if (!dateValidation.valid) {
        throw new Error(dateValidation.error);
      }
    }

    if (updates.tripName && updates.tripName !== trip.tripName) {
      const newSlug = await tripUtils.generateUniqueSlug(updates.tripName, trip._id);
      (updates as any).slug = newSlug;
    }

    if (updates.startDate) updates.startDate = new Date(updates.startDate);
    if (updates.endDate) updates.endDate = new Date(updates.endDate);

    const updatedTrip = { ...trip.toObject(), ...updates };
    Object.assign(trip, updatedTrip);
    await trip.save();

    await trip.populate('createdBy', 'username name profilePicUrl email');

    return trip;
  }

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

  async publishTrip(tripId: string, userId: string): Promise<ITrip | null> {
    const trip = await Trip.findById(tripId);
    if (!trip) return null;

    if (!tripUtils.isTripCreator(trip, userId)) {
      throw new Error('ONLY_CREATOR_CAN_PUBLISH');
    }

    trip.isPublic = true;
    trip.lifecycleStatus = TripLifecycleStatus.PUBLISHED;

    await trip.save();
    return trip;
  }

  async unpublishTrip(tripId: string, userId: string): Promise<ITrip | null> {
    const trip = await Trip.findById(tripId);
    if (!trip) return null;

    if (!tripUtils.isTripCreator(trip, userId)) {
      throw new Error('ONLY_CREATOR_CAN_UNPUBLISH');
    }

    trip.isPublic = false;
    trip.lifecycleStatus = TripLifecycleStatus.DRAFT;

    await trip.save();
    return trip;
  }

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
      lifecycleStatus: TripLifecycleStatus.DRAFT,
      engagement: {
        likes: 0,
        saves: 0,
        shares: 0,
        views: 0,
        clones: 0
      }
    };

    if (includeBudget && originalTrip.budgetSummary) {
      clonedData.budgetSummary = {
        total: originalTrip.budgetSummary.total,
        spent: 0
      };
    }

    const clonedTrip = new Trip(clonedData);
    await clonedTrip.save();

    await Trip.findByIdAndUpdate(tripId, { $inc: { 'engagement.clones': 1 } });
    await User.findByIdAndUpdate(userId, { $inc: { 'stats.tripsCount': 1 } });

    return clonedTrip;
  }

  async getFeaturedTrips(limit = 10): Promise<ITrip[]> {
    return Trip.find({ isFeatured: true, isPublic: true })
      .populate('createdBy', 'username name profilePicUrl')
      .sort({ 'engagement.likes': -1, 'engagement.views': -1, createdAt: -1 })
      .limit(limit)
      .lean();
  }

  async searchByDestination(destinationName: string, limit = 10): Promise<ITrip[]> {
    return Trip.find({
      isPublic: true,
      'destinationLocation.name': { $regex: destinationName, $options: 'i' }
    })
      .limit(limit)
      .populate('createdBy', 'username name profilePicUrl')
      .sort({ 'engagement.likes': -1, 'engagement.views': -1 })
      .lean();
  }

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
