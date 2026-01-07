import { Router } from 'express';
import { authMiddleware } from '@shared/middlewares';
import memberController from './member.controller';

const router = Router({ mergeParams: true }); // Enable access to parent route params

// All routes require authentication
router.use(authMiddleware);

// GET /api/trips/:tripId/members - Get all members
router.get('/', memberController.getTripMembers);

// POST /api/trips/:tripId/members - Add a member (creator only)
router.post('/', memberController.addMember);

// DELETE /api/trips/:tripId/members/:userId - Remove a member (creator only)
router.delete('/:userId', memberController.removeMember);

// PATCH /api/trips/:tripId/members/:userId/role - Update member role (creator only)
router.patch('/:userId/role', memberController.updateMemberRole);

// POST /api/trips/:tripId/members/leave - Leave a trip (self-removal)
router.post('/leave', memberController.leaveTrip);

export default router;
