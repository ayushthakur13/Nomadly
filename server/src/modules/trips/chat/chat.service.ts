import { Types } from 'mongoose';
import Message, { IMessage } from './message.model';
import Trip from '../core/trip.model';
import { isTripMember, isTripCreator } from '../members/member.utils';

class ChatService {
  /**
   * Fetch historical messages for a trip with cursor pagination
   */
  async getMessages(
    tripId: string,
    userId: string,
    limit: number = 50,
    beforeDate?: string
  ): Promise<IMessage[]> {
    if (!Types.ObjectId.isValid(tripId)) {
      throw new Error('Invalid trip ID');
    }

    const trip = await Trip.findById(tripId).lean();
    if (!trip) {
      throw new Error('Trip not found');
    }

    // Permission check: must be owner or member
    const isOwner = isTripCreator(trip, userId);
    const isMember = isTripMember(trip, userId);

    if (!isOwner && !isMember) {
      throw new Error('Unauthorized to view trip chat');
    }

    const query: any = { trip: new Types.ObjectId(tripId) };

    if (beforeDate) {
      query.createdAt = { $lt: new Date(beforeDate) };
    }

    const messages = await Message.find(query)
      .populate('sender', 'username profilePicUrl')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // Reverse messages to return them in chronological order (earliest to latest)
    return (messages as IMessage[]).reverse();
  }

  /**
   * Cascade delete all messages associated with a trip
   */
  async deleteTripMessages(tripId: string): Promise<void> {
    await Message.deleteMany({ trip: new Types.ObjectId(tripId) });
  }

  /**
   * Save a new message
   */
  async saveMessage(tripId: string, senderId: string, content: string): Promise<IMessage> {
    if (!Types.ObjectId.isValid(tripId)) {
      throw new Error('Invalid trip ID');
    }
    return await Message.create({
      trip: new Types.ObjectId(tripId),
      sender: new Types.ObjectId(senderId),
      content: content.trim(),
    });
  }
}

export default new ChatService();
