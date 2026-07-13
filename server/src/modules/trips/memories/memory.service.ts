import { Types } from 'mongoose';
import Memory, { IMemory } from './memory.model';
import Trip from '../core/trip.model';
import { isTripMember, isTripCreator } from '../members/member.utils';
import { deleteFromCloudinary } from '@shared/utils';

class MemoryService {
  /**
   * Get all memories for a trip
   */
  async getMemoriesByTripId(tripId: string, userId: string): Promise<IMemory[]> {
    if (!Types.ObjectId.isValid(tripId)) {
      throw new Error('Invalid trip ID');
    }

    const trip = await Trip.findById(tripId).lean();
    if (!trip) {
      throw new Error('Trip not found');
    }

    // Check permissions: if trip is private, user must be owner or member
    const isOwner = trip.createdBy.toString() === userId;
    const isMember = trip.members.some((m: any) => m.userId.toString() === userId);

    if (!trip.isPublic && !isOwner && !isMember) {
      throw new Error('Unauthorized to view memories');
    }

    const memories = await Memory.find({ tripId: new Types.ObjectId(tripId) })
      .populate('uploadedBy', 'username name email profilePicUrl')
      .sort({ createdAt: -1 })
      .lean();

    return memories as IMemory[];
  }

  /**
   * Upload and create a memory
   */
  async createMemory(
    tripId: string,
    userId: string,
    url: string,
    publicId: string,
    caption?: string
  ): Promise<IMemory> {
    if (!Types.ObjectId.isValid(tripId)) {
      throw new Error('Invalid trip ID');
    }

    const trip = await Trip.findById(tripId);
    if (!trip) {
      throw new Error('Trip not found');
    }

    // Must be owner or member to upload
    const isOwner = trip.createdBy.toString() === userId;
    const isMember = trip.members.some((m: any) => m.userId.toString() === userId);

    if (!isOwner && !isMember) {
      throw new Error('Unauthorized to upload memories');
    }

    const memory = new Memory({
      tripId: new Types.ObjectId(tripId),
      uploadedBy: new Types.ObjectId(userId),
      url,
      publicId,
      caption: caption?.trim(),
    });

    await memory.save();
    
    // Populate uploadedBy information before returning
    await memory.populate('uploadedBy', 'username name email profilePicUrl');

    return memory;
  }

  /**
   * Update memory caption
   */
  async updateMemoryCaption(
    memoryId: string,
    userId: string,
    caption: string
  ): Promise<IMemory> {
    if (!Types.ObjectId.isValid(memoryId)) {
      throw new Error('Invalid memory ID');
    }

    const memory = await Memory.findById(memoryId);
    if (!memory) {
      throw new Error('Memory not found');
    }

    const trip = await Trip.findById(memory.tripId);
    if (!trip) {
      throw new Error('Trip not found');
    }

    const isUploader = memory.uploadedBy.toString() === userId;
    const isTripOwner = trip.createdBy.toString() === userId;

    if (!isUploader && !isTripOwner) {
      throw new Error('Unauthorized to update memory caption');
    }

    memory.caption = caption?.trim();
    await memory.save();

    await memory.populate('uploadedBy', 'username name email profilePicUrl');

    return memory;
  }

  /**
   * Delete a single memory
   */
  async deleteMemory(memoryId: string, userId: string): Promise<void> {
    if (!Types.ObjectId.isValid(memoryId)) {
      throw new Error('Invalid memory ID');
    }

    const memory = await Memory.findById(memoryId);
    if (!memory) {
      throw new Error('Memory not found');
    }

    const trip = await Trip.findById(memory.tripId);
    if (!trip) {
      throw new Error('Trip not found');
    }

    const isUploader = memory.uploadedBy.toString() === userId;
    const isTripOwner = trip.createdBy.toString() === userId;

    if (!isUploader && !isTripOwner) {
      throw new Error('Unauthorized to delete memory');
    }

    // Delete image from Cloudinary if publicId exists
    if (memory.publicId) {
      await deleteFromCloudinary(memory.publicId).catch((err) => {
        console.error(`Failed to delete asset ${memory.publicId} from Cloudinary:`, err);
      });
    }

    await Memory.findByIdAndDelete(memoryId);
  }

  /**
   * Delete all memories uploaded by a specific user in a trip (cascade removal when user is removed)
   */
  async deleteUserMemoriesInTrip(tripId: string, userId: string): Promise<void> {
    const memories = await Memory.find({
      tripId: new Types.ObjectId(tripId),
      uploadedBy: new Types.ObjectId(userId),
    });

    for (const memory of memories) {
      if (memory.publicId) {
        await deleteFromCloudinary(memory.publicId).catch((err) => {
          console.error(`Cascade delete failed for asset ${memory.publicId}:`, err);
        });
      }
    }

    await Memory.deleteMany({
      tripId: new Types.ObjectId(tripId),
      uploadedBy: new Types.ObjectId(userId),
    });
  }

  /**
   * Delete all memories associated with a trip (cascade removal when trip is deleted)
   */
  async deleteTripMemories(tripId: string): Promise<void> {
    const memories = await Memory.find({
      tripId: new Types.ObjectId(tripId),
    });

    for (const memory of memories) {
      if (memory.publicId) {
        await deleteFromCloudinary(memory.publicId).catch((err) => {
          console.error(`Cascade delete failed for asset ${memory.publicId}:`, err);
        });
      }
    }

    await Memory.deleteMany({
      tripId: new Types.ObjectId(tripId),
    });
  }
}

export default new MemoryService();
