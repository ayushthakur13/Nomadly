import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import User from '../users/user.model';
import invitationService from './invitation.service';
import { asyncHandler } from '../../shared';
import { InvitationStatus } from './invitation.model';

interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
    isAdmin: boolean;
  };
}

class InvitationController {
  /**
   * POST /api/invitations
   * Create a new invitation
   */
  createInvitation = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { tripId, invitedUserId, invitedEmail, invitedUsername, message, expiresInDays } = req.body;

    if (!tripId) {
      res.status(400).json({ success: false, message: 'Trip ID is required' });
      return;
    }

    if (!Types.ObjectId.isValid(tripId)) {
      res.status(400).json({ success: false, message: 'Invalid trip ID' });
      return;
    }

    if (!invitedUserId && !invitedEmail && !invitedUsername) {
      res.status(400).json({ 
        success: false, 
        message: 'Provide invitedUserId, invitedEmail, or invitedUsername' 
      });
      return;
    }

    let resolvedUserId = invitedUserId;

    // Resolve username to userId if provided
    if (!resolvedUserId && invitedUsername) {
      const targetUser = await User.findOne({ username: invitedUsername });
      if (!targetUser) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }
      resolvedUserId = (targetUser._id as any).toString();
    }

    if (resolvedUserId && !Types.ObjectId.isValid(resolvedUserId)) {
      res.status(400).json({ success: false, message: 'Invalid user ID' });
      return;
    }

    const invitation = await invitationService.createInvitation({
      tripId,
      invitedBy: userId,
      invitedUserId: resolvedUserId,
      invitedEmail,
      message,
      expiresInDays
    });

    res.status(201).json({
      success: true,
      message: 'Invitation created successfully',
      data: { invitation }
    });
  });

  /**
   * POST /api/invitations/:invitationId/accept
   * Accept an invitation
   */
  acceptInvitation = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { invitationId } = req.params;

    if (!invitationId || !Types.ObjectId.isValid(invitationId)) {
      res.status(400).json({ success: false, message: 'Invalid invitation ID' });
      return;
    }

    const result = await invitationService.acceptInvitation(invitationId, userId);

    res.status(200).json({
      success: true,
      message: 'Invitation accepted successfully. You are now a member of the trip!',
      data: result
    });
  });

  /**
   * POST /api/invitations/:invitationId/reject
   * Reject an invitation
   */
  rejectInvitation = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { invitationId } = req.params;

    if (!invitationId || !Types.ObjectId.isValid(invitationId)) {
      res.status(400).json({ success: false, message: 'Invalid invitation ID' });
      return;
    }

    const invitation = await invitationService.rejectInvitation(invitationId, userId);

    res.status(200).json({
      success: true,
      message: 'Invitation rejected',
      data: { invitation }
    });
  });

  /**
   * POST /api/invitations/:invitationId/cancel
   * Cancel an invitation (inviter only)
   */
  cancelInvitation = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { invitationId } = req.params;

    if (!invitationId || !Types.ObjectId.isValid(invitationId)) {
      res.status(400).json({ success: false, message: 'Invalid invitation ID' });
      return;
    }

    const invitation = await invitationService.cancelInvitation(invitationId, userId);

    res.status(200).json({
      success: true,
      message: 'Invitation cancelled',
      data: { invitation }
    });
  });

  /**
   * GET /api/invitations
   * Get invitations with filters
   */
  getInvitations = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const {
      tripId,
      invitedUserId,
      invitedEmail,
      invitedBy,
      status,
      includeExpired,
      page,
      limit
    } = req.query;

    const result = await invitationService.getInvitations({
      tripId: tripId as string,
      invitedUserId: invitedUserId as string,
      invitedEmail: invitedEmail as string,
      invitedBy: invitedBy as string,
      status: status as InvitationStatus,
      includeExpired: includeExpired === 'true',
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20
    });

    res.status(200).json({
      success: true,
      data: {
        invitations: result.invitations,
        pagination: result.pagination
      }
    });
  });

  /**
   * GET /api/invitations/me/pending
   * Get pending invitations for current user
   */
  getMyPendingInvitations = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const invitations = await invitationService.getPendingInvitationsForUser(userId);

    res.status(200).json({
      success: true,
      data: { invitations }
    });
  });

  /**
   * GET /api/invitations/:invitationId
   * Get invitation by ID
   */
  getInvitationById = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { invitationId } = req.params;

    if (!invitationId || !Types.ObjectId.isValid(invitationId)) {
      res.status(400).json({ success: false, message: 'Invalid invitation ID' });
      return;
    }

    const invitation = await invitationService.getInvitationById(invitationId);

    if (!invitation) {
      res.status(404).json({ success: false, message: 'Invitation not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: { invitation }
    });
  });

  /**
   * GET /api/invitations/trips/:tripId
   * Get all invitations for a trip (creator only)
   */
  getTripInvitations = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { tripId } = req.params;
    const { includeExpired, page, limit } = req.query;

    if (!tripId || !Types.ObjectId.isValid(tripId)) {
      res.status(400).json({ success: false, message: 'Invalid trip ID' });
      return;
    }

    const result = await invitationService.getInvitations({
      tripId,
      includeExpired: includeExpired === 'true',
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20
    });

    res.status(200).json({
      success: true,
      data: {
        invitations: result.invitations,
        pagination: result.pagination
      }
    });
  });
}

export default new InvitationController();
