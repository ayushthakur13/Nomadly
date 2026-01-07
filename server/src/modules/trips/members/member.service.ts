import { Types } from 'mongoose';
import Trip, { ITrip } from '../core/trip.model';
import User from '../../users/user.model';
import { 
  isTripCreator, 
  isTripMember, 
  getMemberRole,
  addMemberToTrip as addMemberUtil,
  removeMemberFromTrip as removeMemberUtil,
  updateMemberRole as updateMemberRoleUtil
} from './member.utils';
import { MemberDTO } from './member.types';

class MemberService {
  /**
   * Add a member to a trip
   * Can only be done by the trip creator
   */
  async addMemberToTrip(
    tripId: string | Types.ObjectId,
    userId: string | Types.ObjectId,
    invitedBy?: string | Types.ObjectId
  ): Promise<ITrip> {
    const trip = await Trip.findById(tripId);
    if (!trip) throw new Error('Trip not found');

    const userObjectId = new Types.ObjectId(userId);
    
    // Check if user exists
    const user = await User.findById(userObjectId);
    if (!user) throw new Error('User not found');

    // Check if already a member
    if (isTripMember(trip, userObjectId)) {
      throw new Error('User is already a member of this trip');
    }

    const invitedByObjectId = invitedBy ? new Types.ObjectId(invitedBy) : undefined;
    
    // Use utility to add member
    addMemberUtil(trip, userObjectId, 'member', invitedByObjectId);
    
    await trip.save();
    return trip;
  }

  /**
   * Remove a member from a trip
   * Can only be done by the trip creator
   * Creator cannot be removed
   */
  async removeMemberFromTrip(
    tripId: string | Types.ObjectId,
    userId: string | Types.ObjectId,
    requesterId: string | Types.ObjectId
  ): Promise<ITrip> {
    const trip = await Trip.findById(tripId);
    if (!trip) throw new Error('Trip not found');

    const userObjectId = new Types.ObjectId(userId);
    const requesterObjectId = new Types.ObjectId(requesterId);

    // Only creator can remove members
    if (!isTripCreator(trip, requesterObjectId)) {
      throw new Error('Only trip creator can remove members');
    }

    // Cannot remove creator
    if (isTripCreator(trip, userObjectId)) {
      throw new Error('Cannot remove trip creator');
    }

    // Check if user is a member
    if (!isTripMember(trip, userObjectId)) {
      throw new Error('User is not a member of this trip');
    }

    // Use utility to remove member
    removeMemberUtil(trip, userObjectId);
    
    await trip.save();
    return trip;
  }

  /**
   * Update member role
   * Can only be done by the trip creator
   * Creator's role cannot be changed
   */
  async updateMemberRole(
    tripId: string | Types.ObjectId,
    userId: string | Types.ObjectId,
    newRole: 'member',
    requesterId: string | Types.ObjectId
  ): Promise<ITrip> {
    const trip = await Trip.findById(tripId);
    if (!trip) throw new Error('Trip not found');

    const userObjectId = new Types.ObjectId(userId);
    const requesterObjectId = new Types.ObjectId(requesterId);

    // Only creator can update roles
    if (!isTripCreator(trip, requesterObjectId)) {
      throw new Error('Only trip creator can update member roles');
    }

    // Use utility to update role
    updateMemberRoleUtil(trip, userObjectId, newRole);
    
    await trip.save();
    return trip;
  }

  /**
   * Get all members of a trip with optional user details
   */
  async getTripMembers(
    tripId: string | Types.ObjectId,
    includeUserDetails: boolean = false
  ): Promise<MemberDTO[]> {
    const trip = await Trip.findById(tripId);
    if (!trip) throw new Error('Trip not found');

    if (!includeUserDetails) {
      return trip.members.map(m => ({
        userId: m.userId.toString(),
        role: m.role,
        joinedAt: (m.joinedAt as Date).toISOString(),
        invitedBy: m.invitedBy?.toString()
      })) as MemberDTO[];
    }

    // Populate user details
    const populatedTrip = await Trip.findById(tripId).populate({
      path: 'members.userId',
      select: 'username name profilePicUrl'
    });

    if (!populatedTrip) throw new Error('Trip not found');

    return populatedTrip.members.map(m => {
      const user = m.userId as any;
      return {
        userId: user._id?.toString?.() ?? user._id,
        role: m.role,
        joinedAt: (m.joinedAt as Date).toISOString(),
        invitedBy: (m.invitedBy as any)?.toString?.() ?? m.invitedBy,
        username: user.username,
        name: user.name,
        profilePicUrl: user.profilePicUrl
      } as MemberDTO;
    });
  }

  /**
   * Check if user has permission to perform an action on a trip
   */
  async checkMemberPermission(
    tripId: string | Types.ObjectId,
    userId: string | Types.ObjectId,
    requiredRole?: 'creator' | 'member'
  ): Promise<{ hasPermission: boolean; userRole: 'creator' | 'member' | null }> {
    const trip = await Trip.findById(tripId);
    if (!trip) throw new Error('Trip not found');

    const userObjectId = new Types.ObjectId(userId);
    const userRole = getMemberRole(trip, userObjectId);

    if (!userRole) {
      return { hasPermission: false, userRole: null };
    }

    if (!requiredRole) {
      return { hasPermission: true, userRole };
    }

    if (requiredRole === 'creator') {
      return { hasPermission: userRole === 'creator', userRole };
    }

    // For 'member' requirement, both creator and member have permission
    return { hasPermission: true, userRole };
  }

  /**
   * Leave a trip (self-removal)
   * Creator cannot leave
   */
  async leaveTrip(
    tripId: string | Types.ObjectId,
    userId: string | Types.ObjectId
  ): Promise<ITrip> {
    const trip = await Trip.findById(tripId);
    if (!trip) throw new Error('Trip not found');

    const userObjectId = new Types.ObjectId(userId);

    // Creator cannot leave
    if (isTripCreator(trip, userObjectId)) {
      throw new Error('Trip creator cannot leave. Transfer ownership or delete the trip instead.');
    }

    // Check if user is a member
    if (!isTripMember(trip, userObjectId)) {
      throw new Error('You are not a member of this trip');
    }

    removeMemberUtil(trip, userObjectId);
    await trip.save();
    
    return trip;
  }
}

export default new MemberService();
