import { Router } from 'express';
import authMiddleware from '../../shared/middlewares/auth.middleware';
import invitationController from './invitation.controller';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// POST /api/invitations - Create invitation
router.post('/', invitationController.createInvitation);

// GET /api/invitations - Get invitations with filters
router.get('/', invitationController.getInvitations);

// GET /api/invitations/me/pending - Get my pending invitations
router.get('/me/pending', invitationController.getMyPendingInvitations);

// GET /api/invitations/trips/:tripId - Get all invitations for a trip
router.get('/trips/:tripId', invitationController.getTripInvitations);

// GET /api/invitations/:invitationId - Get invitation by ID
router.get('/:invitationId', invitationController.getInvitationById);

// POST /api/invitations/:invitationId/accept - Accept invitation
router.post('/:invitationId/accept', invitationController.acceptInvitation);

// POST /api/invitations/:invitationId/reject - Reject invitation
router.post('/:invitationId/reject', invitationController.rejectInvitation);

// POST /api/invitations/:invitationId/cancel - Cancel invitation (inviter only)
router.post('/:invitationId/cancel', invitationController.cancelInvitation);

export default router;
