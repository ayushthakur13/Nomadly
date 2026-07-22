import { z } from 'zod';

export const createInvitationSchema = z.object({
  tripId: z.string().min(1, 'tripId is required'),
  inviteeEmail: z.string().email('Invalid invitee email').optional(),
  inviteeUsername: z.string().min(1, 'Username must not be empty').optional(),
  inviteeUserId: z.string().optional(),
  role: z.enum(['editor', 'viewer']).optional().default('editor'),
  message: z.string().max(500, 'Message too long').optional(),
}).refine(data => data.inviteeEmail || data.inviteeUsername || data.inviteeUserId, {
  message: 'Must provide inviteeEmail, inviteeUsername, or inviteeUserId to create an invitation',
});
