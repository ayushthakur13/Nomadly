import { Types } from 'mongoose';
import Invitation, { IInvitation, InvitationStatus } from './invitation.model';
import Trip from '../trips/core/trip.model';
import User from '../users/user.model';
import memberService from '../trips/members/member.service';
import { isTripCreator, isTripMember } from '../trips/members/member.utils';
import {
  generateInvitationToken,
  calculateExpirationDate,
  validateInvitationRecipient
} from './invitation.utils';
import {
  CreateInvitationDTO,
  InvitationQueryFilters,
  InvitationDTO,
  AcceptInvitationResult
} from './invitation.types';

/**
 * Private helper: Check if invitation is expired
 */
function isInvitationExpired(invitation: IInvitation): boolean {
  return invitation.expiresAt < new Date();
}

/**
 * Private helper: Check if invitation can be accepted
 */
function canAcceptInvitation(invitation: IInvitation): { canAccept: boolean; reason?: string } {
  if (invitation.status !== InvitationStatus.PENDING) {
    return { canAccept: false, reason: `Invitation is ${invitation.status}` };
  }
  
  if (isInvitationExpired(invitation)) {
    return { canAccept: false, reason: 'Invitation has expired' };
  }
  
  return { canAccept: true };
}

/**
 * Private helper: Check if invitation can be rejected
 */
function canRejectInvitation(invitation: IInvitation): { canReject: boolean; reason?: string } {
  if (invitation.status !== InvitationStatus.PENDING) {
    return { canReject: false, reason: `Invitation is ${invitation.status}` };
  }
  
  if (isInvitationExpired(invitation)) {
    return { canReject: false, reason: 'Invitation has expired' };
  }
  
  return { canReject: true };
}

/**
 * Private helper: Check if invitation can be cancelled
 */
function canCancelInvitation(invitation: IInvitation): { canCancel: boolean; reason?: string } {
  if (invitation.status !== InvitationStatus.PENDING) {
    return { canCancel: false, reason: `Invitation is ${invitation.status}` };
  }
  
  return { canCancel: true };
}

class InvitationService {
  /**
   * Create a new invitation
   * Can only be done by trip creator
   */
  async createInvitation(data: CreateInvitationDTO): Promise<IInvitation> {
    const { tripId, invitedBy, invitedUserId, invitedEmail, message, expiresInDays = 7 } = data;

    // Validate recipient
    const recipientValidation = validateInvitationRecipient(invitedUserId, invitedEmail);
    if (!recipientValidation.valid) {
      throw new Error(recipientValidation.error);
    }

    // Verify trip exists
    const trip = await Trip.findById(tripId);
    if (!trip) throw new Error('Trip not found');

    // Verify inviter is the trip creator
    if (!isTripCreator(trip, invitedBy)) {
      throw new Error('Only trip creator can send invitations');
    }

    // If inviting by userId, verify user exists
    let targetUserId: Types.ObjectId | undefined;
    if (invitedUserId) {
      const user = await User.findById(invitedUserId);
      if (!user) throw new Error('User not found');
      
      targetUserId = new Types.ObjectId(invitedUserId);

      // Check if user is already a member
      if (isTripMember(trip, targetUserId)) {
        throw new Error('User is already a member of this trip');
      }

      // Check for existing pending invitation
      const existingInvitation = await Invitation.findOne({
        tripId,
        invitedUserId: targetUserId,
        status: InvitationStatus.PENDING
      });
      if (existingInvitation) {
        throw new Error('User already has a pending invitation for this trip');
      }
    }

    // If inviting by email, check for existing pending invitation
    if (invitedEmail) {
      const existingInvitation = await Invitation.findOne({
        tripId,
        invitedEmail: invitedEmail.toLowerCase(),
        status: InvitationStatus.PENDING
      });
      if (existingInvitation) {
        throw new Error('An invitation has already been sent to this email for this trip');
      }

      // Check if email belongs to an existing user who is already a member
      const existingUser = await User.findOne({ email: invitedEmail.toLowerCase() });
      if (existingUser && isTripMember(trip, existingUser._id as Types.ObjectId)) {
        throw new Error('User with this email is already a member of this trip');
      }
    }

    // Create invitation
    const invitation = new Invitation({
      tripId: new Types.ObjectId(tripId),
      invitedBy: new Types.ObjectId(invitedBy),
      invitedUserId: targetUserId,
      invitedEmail: invitedEmail?.toLowerCase(),
      message,
      token: invitedEmail ? generateInvitationToken() : undefined,
      expiresAt: calculateExpirationDate(expiresInDays),
      status: InvitationStatus.PENDING
    });

    await invitation.save();
    return invitation;
  }

  /**
   * Accept an invitation
   * Adds user to trip members
   */
  async acceptInvitation(
    invitationId: string | Types.ObjectId,
    userId: string | Types.ObjectId
  ): Promise<AcceptInvitationResult> {
    const invitation = await Invitation.findById(invitationId);
    if (!invitation) throw new Error('Invitation not found');

    // Check if invitation can be accepted
    const acceptCheck = canAcceptInvitation(invitation);
    if (!acceptCheck.canAccept) {
      throw new Error(acceptCheck.reason || 'Cannot accept this invitation');
    }

    // Verify the invitation is for this user
    const userObjectId = new Types.ObjectId(userId);
    const userIdMatch = invitation.invitedUserId && 
      invitation.invitedUserId.toString() === userObjectId.toString();
    
    let emailMatch = false;
    if (invitation.invitedEmail) {
      const user = await User.findById(userObjectId);
      emailMatch = user?.email?.toLowerCase() === invitation.invitedEmail.toLowerCase();
    }

    if (!userIdMatch && !emailMatch) {
      throw new Error('This invitation is not for you');
    }

    // Update invitation status
    invitation.status = InvitationStatus.ACCEPTED;
    invitation.respondedAt = new Date();
    await invitation.save();

    // Add member to trip using member service
    const trip = await memberService.addMemberToTrip(
      invitation.tripId,
      userObjectId,
      invitation.invitedBy
    );

    return {
      invitation: invitation as any,
      trip,
      memberAdded: true
    };
  }

  /**
   * Reject an invitation
   */
  async rejectInvitation(
    invitationId: string | Types.ObjectId,
    userId: string | Types.ObjectId
  ): Promise<IInvitation> {
    const invitation = await Invitation.findById(invitationId);
    if (!invitation) throw new Error('Invitation not found');

    // Check if invitation can be rejected
    const rejectCheck = canRejectInvitation(invitation);
    if (!rejectCheck.canReject) {
      throw new Error(rejectCheck.reason || 'Cannot reject this invitation');
    }

    // Verify the invitation is for this user
    const userObjectId = new Types.ObjectId(userId);
    const userIdMatch = invitation.invitedUserId && 
      invitation.invitedUserId.toString() === userObjectId.toString();
    
    let emailMatch = false;
    if (invitation.invitedEmail) {
      const user = await User.findById(userObjectId);
      emailMatch = user?.email?.toLowerCase() === invitation.invitedEmail.toLowerCase();
    }

    if (!userIdMatch && !emailMatch) {
      throw new Error('This invitation is not for you');
    }

    // Update invitation status
    invitation.status = InvitationStatus.REJECTED;
    invitation.respondedAt = new Date();
    await invitation.save();

    return invitation;
  }

  /**
   * Cancel an invitation
   * Can only be done by the inviter (trip creator)
   */
  async cancelInvitation(
    invitationId: string | Types.ObjectId,
    userId: string | Types.ObjectId
  ): Promise<IInvitation> {
    const invitation = await Invitation.findById(invitationId);
    if (!invitation) throw new Error('Invitation not found');

    // Check if invitation can be cancelled
    const cancelCheck = canCancelInvitation(invitation);
    if (!cancelCheck.canCancel) {
      throw new Error(cancelCheck.reason || 'Cannot cancel this invitation');
    }

    // Verify user is the inviter
    const userObjectId = new Types.ObjectId(userId);
    if (invitation.invitedBy.toString() !== userObjectId.toString()) {
      throw new Error('Only the inviter can cancel this invitation');
    }

    // Update invitation status
    invitation.status = InvitationStatus.CANCELLED;
    await invitation.save();

    return invitation;
  }

  /**
   * Get invitations with filters
   */
  async getInvitations(filters: InvitationQueryFilters): Promise<{
    invitations: InvitationDTO[];
    pagination: { page: number; limit: number; total: number; pages: number };
  }> {
    const {
      tripId,
      invitedUserId,
      invitedEmail,
      invitedBy,
      status,
      includeExpired = false,
      page = 1,
      limit = 20
    } = filters;

    const query: any = {};

    if (tripId) query.tripId = new Types.ObjectId(tripId);
    if (invitedUserId) query.invitedUserId = new Types.ObjectId(invitedUserId);
    if (invitedEmail) query.invitedEmail = invitedEmail.toLowerCase();
    if (invitedBy) query.invitedBy = new Types.ObjectId(invitedBy);
    
    if (status) {
      query.status = Array.isArray(status) ? { $in: status } : status;
    }

    if (!includeExpired) {
      query.$or = [
        { status: { $ne: InvitationStatus.PENDING } },
        { status: InvitationStatus.PENDING, expiresAt: { $gt: new Date() } }
      ];
    }

    const total = await Invitation.countDocuments(query);
    const pages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;

    const invitations = await Invitation.find(query)
      .populate('tripId', 'tripName slug coverImageUrl startDate endDate')
      .populate('invitedBy', 'username name profilePicUrl')
      .populate('invitedUserId', 'username name profilePicUrl')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    return {
      invitations: invitations as any,
      pagination: { page, limit, total, pages }
    };
  }

  /**
   * Get invitation by ID with populated data
   */
  async getInvitationById(invitationId: string | Types.ObjectId): Promise<IInvitation | null> {
    const invitation = await Invitation.findById(invitationId)
      .populate('tripId', 'tripName slug coverImageUrl startDate endDate')
      .populate('invitedBy', 'username name profilePicUrl')
      .populate('invitedUserId', 'username name profilePicUrl');
    
    return invitation;
  }

  /**
   * Get pending invitations for a user (by userId or email)
   */
  async getPendingInvitationsForUser(userId: string | Types.ObjectId): Promise<InvitationDTO[]> {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const query: any = {
      status: InvitationStatus.PENDING,
      expiresAt: { $gt: new Date() },
      $or: [
        { invitedUserId: new Types.ObjectId(userId) }
      ]
    };

    if (user.email) {
      query.$or.push({ invitedEmail: user.email.toLowerCase() });
    }

    const invitations = await Invitation.find(query)
      .populate('tripId', 'tripName slug coverImageUrl startDate endDate')
      .populate('invitedBy', 'username name profilePicUrl')
      .sort({ createdAt: -1 })
      .lean();

    return invitations as any;
  }
}

export default new InvitationService();
