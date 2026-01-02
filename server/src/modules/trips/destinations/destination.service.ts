import { Types } from 'mongoose';
import Destination, { IDestination } from './destination.model';
import Trip from '../core/trip.model';
import { deleteFromCloudinary } from '@shared/utils/cloudinary.utils';
import { canEditTrip } from '../core/trip.utils';

interface CreateDestinationDTO {
  name: string;
  location?: {
    name?: string;
    address?: string;
    placeId?: string;
    coordinates: [number, number]; // [lng, lat]
  };
  arrivalDate?: Date;
  departureDate?: Date;
  notes?: string;
  imageUrl?: string;
}

interface UpdateDestinationDTO {
  name?: string;
  location?: {
    name?: string;
    address?: string;
    placeId?: string;
    coordinates: [number, number];
  };
  arrivalDate?: Date;
  departureDate?: Date;
  notes?: string;
  imageUrl?: string;
}

class DestinationService {
  /**
   * Get all destinations for a trip, ordered by `order` field
   */
  async getDestinationsByTripId(tripId: string, userId?: string): Promise<IDestination[]> {
    if (!Types.ObjectId.isValid(tripId)) {
      throw new Error('Invalid trip ID');
    }

    const trip = await Trip.findById(tripId).lean();
    if (!trip) {
      throw new Error('Trip not found');
    }

    // Check if user can access this trip
    if (!trip.isPublic && userId) {
      const isMember = trip.members.some(
        (m: any) => m.userId.toString() === userId.toString()
      );
      if (!isMember) {
        throw new Error('Unauthorized to view destinations');
      }
    } else if (!trip.isPublic && !userId) {
      throw new Error('Unauthorized to view destinations');
    }

    const destinations = await Destination.find({ tripId: new Types.ObjectId(tripId) })
      .sort({ order: 1 })
      .lean();

    return destinations;
  }

  /**
   * Create a new destination and append to trip
   */
  async createDestination(
    tripId: string,
    userId: string,
    data: CreateDestinationDTO
  ): Promise<IDestination> {
    if (!Types.ObjectId.isValid(tripId)) {
      throw new Error('Invalid trip ID');
    }

    const trip = await Trip.findById(tripId);
    if (!trip) {
      throw new Error('Trip not found');
    }

    // Check if user can edit trip
    if (!canEditTrip(trip, userId)) {
      throw new Error('Unauthorized to add destinations to this trip');
    }

    // Validate location coordinates if provided
    if (data.location?.coordinates) {
      const [lng, lat] = data.location.coordinates;
      if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
        throw new Error('Invalid coordinates');
      }
    }

    // Validate dates if provided
    if (data.arrivalDate && data.departureDate) {
      if (new Date(data.departureDate) < new Date(data.arrivalDate)) {
        throw new Error('Departure date must be after arrival date');
      }
    }

    // Get the next order value
    const maxOrder = await Destination.findOne({ tripId: new Types.ObjectId(tripId) })
      .sort({ order: -1 })
      .select('order')
      .lean();

    const nextOrder = maxOrder ? maxOrder.order + 1 : 0;

    // Build location object if provided
    const location = data.location
      ? {
          name: data.location.name,
          address: data.location.address,
          placeId: data.location.placeId,
          point: {
            type: 'Point' as const,
            coordinates: data.location.coordinates,
          },
        }
      : undefined;

    // Create destination
    const destination = new Destination({
      tripId: new Types.ObjectId(tripId),
      name: data.name,
      location,
      arrivalDate: data.arrivalDate,
      departureDate: data.departureDate,
      notes: data.notes,
      imageUrl: data.imageUrl,
      order: nextOrder,
    });

    await destination.save();

    // Add destination reference to trip
    trip.destinations.push(destination._id as Types.ObjectId);
    await trip.save();

    return destination;
  }

  /**
   * Update an existing destination
   */
  async updateDestination(
    destinationId: string,
    userId: string,
    data: UpdateDestinationDTO
  ): Promise<IDestination> {
    if (!Types.ObjectId.isValid(destinationId)) {
      throw new Error('Invalid destination ID');
    }

    const destination = await Destination.findById(destinationId);
    if (!destination) {
      throw new Error('Destination not found');
    }

    // Verify ownership
    await this.validateDestinationOwnership(destinationId, userId);

    // Validate location coordinates if provided
    if (data.location?.coordinates) {
      const [lng, lat] = data.location.coordinates;
      if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
        throw new Error('Invalid coordinates');
      }
    }

    // Validate dates if both are provided
    const newArrival = data.arrivalDate || destination.arrivalDate;
    const newDeparture = data.departureDate || destination.departureDate;

    if (newArrival && newDeparture && new Date(newDeparture) < new Date(newArrival)) {
      throw new Error('Departure date must be after arrival date');
    }

    // Update fields
    if (data.name !== undefined) destination.name = data.name;
    if (data.notes !== undefined) destination.notes = data.notes;
    if (data.imageUrl !== undefined) destination.imageUrl = data.imageUrl;
    if (data.arrivalDate !== undefined) destination.arrivalDate = data.arrivalDate;
    if (data.departureDate !== undefined) destination.departureDate = data.departureDate;

    if (data.location) {
      destination.location = {
        ...(data.location.name && { name: data.location.name }),
        ...(data.location.address && { address: data.location.address }),
        ...(data.location.placeId && { placeId: data.location.placeId }),
        point: {
          type: 'Point' as const,
          coordinates: data.location.coordinates,
        },
      };
    }

    await destination.save();
    return destination;
  }

  /**
   * Delete a destination and clean up references
   */
  async deleteDestination(destinationId: string, userId: string): Promise<void> {
    if (!Types.ObjectId.isValid(destinationId)) {
      throw new Error('Invalid destination ID');
    }

    const destination = await Destination.findById(destinationId);
    if (!destination) {
      throw new Error('Destination not found');
    }

    // Verify ownership
    await this.validateDestinationOwnership(destinationId, userId);

    const tripId = destination.tripId;

    // Delete image from Cloudinary if exists
    if (destination.imageUrl) {
      const publicId = this.extractCloudinaryPublicId(destination.imageUrl);
      if (publicId) {
        await deleteFromCloudinary(publicId);
      }
    }

    // Remove destination
    await Destination.findByIdAndDelete(destinationId);

    // Remove reference from trip
    await Trip.findByIdAndUpdate(tripId, {
      $pull: { destinations: new Types.ObjectId(destinationId) },
    });

    // Re-normalize order for remaining destinations
    await this.normalizeDestinationOrder(tripId.toString());
  }

  /**
   * Reorder destinations in bulk
   */
  async reorderDestinations(
    tripId: string,
    userId: string,
    orderedDestinationIds: string[]
  ): Promise<IDestination[]> {
    if (!Types.ObjectId.isValid(tripId)) {
      throw new Error('Invalid trip ID');
    }

    const trip = await Trip.findById(tripId);
    if (!trip) {
      throw new Error('Trip not found');
    }

    // Check if user can edit trip
    if (!canEditTrip(trip, userId)) {
      throw new Error('Unauthorized to reorder destinations');
    }

    // Validate all destination IDs
    const destinationIds = orderedDestinationIds.map((id) => {
      if (!Types.ObjectId.isValid(id)) {
        throw new Error(`Invalid destination ID: ${id}`);
      }
      return new Types.ObjectId(id);
    });

    // Verify all destinations belong to this trip
    const destinations = await Destination.find({
      _id: { $in: destinationIds },
      tripId: new Types.ObjectId(tripId),
    });

    if (destinations.length !== destinationIds.length) {
      throw new Error('Some destination IDs do not belong to this trip');
    }

    // Update order for each destination
    const updatePromises = destinationIds.map((id, index) =>
      Destination.findByIdAndUpdate(id, { order: index }, { new: true })
    );

    const updatedDestinations = await Promise.all(updatePromises);

    return updatedDestinations.filter((d) => d !== null) as IDestination[];
  }

  /**
   * Upload destination image
   */
  async uploadDestinationImage(
    destinationId: string,
    userId: string,
    imageUrl: string,
    publicId: string
  ): Promise<IDestination> {
    if (!Types.ObjectId.isValid(destinationId)) {
      throw new Error('Invalid destination ID');
    }

    const destination = await Destination.findById(destinationId);
    if (!destination) {
      throw new Error('Destination not found');
    }

    // Verify ownership
    await this.validateDestinationOwnership(destinationId, userId);

    // Delete old image if exists
    if (destination.imageUrl) {
      const oldPublicId = this.extractCloudinaryPublicId(destination.imageUrl);
      if (oldPublicId) {
        await deleteFromCloudinary(oldPublicId);
      }
    }

    // Update with new image
    destination.imageUrl = imageUrl;
    destination.imagePublicId = publicId;
    await destination.save();

    return destination;
  }

  /**
   * Delete destination image
   */
  async deleteDestinationImage(destinationId: string, userId: string): Promise<IDestination> {
    if (!Types.ObjectId.isValid(destinationId)) {
      throw new Error('Invalid destination ID');
    }

    const destination = await Destination.findById(destinationId);
    if (!destination) {
      throw new Error('Destination not found');
    }

    // Verify ownership
    await this.validateDestinationOwnership(destinationId, userId);

    if (destination.imageUrl) {
      const publicId = this.extractCloudinaryPublicId(destination.imageUrl);
      if (publicId) {
        await deleteFromCloudinary(publicId);
      }
      destination.imageUrl = '' as any;
      destination.markModified('imageUrl');
      await destination.save();
    }

    return destination;
  }

  /**
   * Validate that user can modify this destination
   */
  private async validateDestinationOwnership(
    destinationId: string,
    userId: string
  ): Promise<void> {
    const destination = await Destination.findById(destinationId).lean();
    if (!destination) {
      throw new Error('Destination not found');
    }

    const trip = await Trip.findById(destination.tripId);
    if (!trip) {
      throw new Error('Associated trip not found');
    }

    if (!canEditTrip(trip, userId)) {
      throw new Error('Unauthorized to modify this destination');
    }
  }

  /**
   * Re-normalize order values after deletion
   */
  private async normalizeDestinationOrder(tripId: string): Promise<void> {
    const destinations = await Destination.find({ tripId: new Types.ObjectId(tripId) })
      .sort({ order: 1 })
      .select('_id');

    const updatePromises = destinations.map((dest, index) =>
      Destination.findByIdAndUpdate(dest._id, { order: index })
    );

    await Promise.all(updatePromises);
  }

  /**
   * Extract Cloudinary public ID from URL
   */
  private extractCloudinaryPublicId(url: string): string | null {
    try {
      const match = url.match(/\/v\d+\/(.+)\.\w+$/);
      return match && match[1] ? match[1] : null;
    } catch {
      return null;
    }
  }
}

export default new DestinationService();
