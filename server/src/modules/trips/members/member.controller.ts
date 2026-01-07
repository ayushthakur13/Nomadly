import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import memberService from './member.service';
import { asyncHandler } from '@shared/utils';

interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
    isAdmin: boolean;
  };
}

class MemberController {
  /**
   * GET /api/trips/:tripId/members
   * Get all members of a trip
   */
  getTripMembers = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { tripId } = req.params;
    const includeUserDetails = req.query.includeUserDetails === 'true';

    if (!tripId || !Types.ObjectId.isValid(tripId)) {
      res.status(400).json({ success: false, message: 'Invalid trip ID' });
      return;
    }

    const members = await memberService.getTripMembers(tripId, includeUserDetails);

    res.status(200).json({
      success: true,
      data: { members }
    });
  });

  /**
   * POST /api/trips/:tripId/members
   * Add a member to a trip (creator only)
   */
  addMember = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { tripId } = req.params;
    const { userId, email, username } = req.body;
    const requesterId = req.user?.id;

    if (!requesterId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (!tripId || !Types.ObjectId.isValid(tripId)) {
      res.status(400).json({ success: false, message: 'Invalid trip ID' });
      return;
    }

    if (!userId && !email && !username) {
      res.status(400).json({ success: false, message: 'User ID, email, or username is required' });
      return;
    }

    // Check if requester is the creator
    const permissionCheck = await memberService.checkMemberPermission(tripId, requesterId, 'creator');
    if (!permissionCheck.hasPermission) {
      res.status(403).json({ success: false, message: 'Only trip creator can add members' });
      return;
    }

    // Find user by userId, email, or username
    let targetUserId = userId;
    if (!targetUserId) {
      const User = (await import('../../users/user.model')).default;
      const user = email 
        ? await User.findOne({ email: email.toLowerCase() })
        : await User.findOne({ username });
      
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }
      targetUserId = (user._id as Types.ObjectId).toString();
    }

    if (!Types.ObjectId.isValid(targetUserId)) {
      res.status(400).json({ success: false, message: 'Invalid user ID' });
      return;
    }

    const trip = await memberService.addMemberToTrip(tripId, targetUserId, requesterId);

    res.status(200).json({
      success: true,
      message: 'Member added successfully',
      data: { trip }
    });
  });

  /**
   * DELETE /api/trips/:tripId/members/:userId
   * Remove a member from a trip (creator only)
   */
  removeMember = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { tripId, userId } = req.params;
    const requesterId = req.user?.id;

    if (!requesterId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (!tripId || !Types.ObjectId.isValid(tripId)) {
      res.status(400).json({ success: false, message: 'Invalid trip ID' });
      return;
    }

    if (!userId || !Types.ObjectId.isValid(userId)) {
      res.status(400).json({ success: false, message: 'Invalid user ID' });
      return;
    }

    const trip = await memberService.removeMemberFromTrip(tripId, userId, requesterId);

    res.status(200).json({
      success: true,
      message: 'Member removed successfully',
      data: { trip }
    });
  });

  /**
   * PATCH /api/trips/:tripId/members/:userId/role
   * Update member role (creator only)
   */
  updateMemberRole = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { tripId, userId } = req.params;
    const { role } = req.body;
    const requesterId = req.user?.id;

    if (!requesterId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (!tripId || !Types.ObjectId.isValid(tripId)) {
      res.status(400).json({ success: false, message: 'Invalid trip ID' });
      return;
    }

    if (!userId || !Types.ObjectId.isValid(userId)) {
      res.status(400).json({ success: false, message: 'Invalid user ID' });
      return;
    }

    if (role !== 'member') {
      res.status(400).json({ success: false, message: 'Invalid role. Only "member" is allowed' });
      return;
    }

    const trip = await memberService.updateMemberRole(tripId, userId, role, requesterId);

    res.status(200).json({
      success: true,
      message: 'Member role updated successfully',
      data: { trip }
    });
  });

  /**
   * POST /api/trips/:tripId/members/leave
   * Leave a trip (self-removal)
   */
  leaveTrip = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { tripId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (!tripId || !Types.ObjectId.isValid(tripId)) {
      res.status(400).json({ success: false, message: 'Invalid trip ID' });
      return;
    }

    const trip = await memberService.leaveTrip(tripId, userId);

    res.status(200).json({
      success: true,
      message: 'You have left the trip successfully',
      data: { trip }
    });
  });
}

export default new MemberController();
