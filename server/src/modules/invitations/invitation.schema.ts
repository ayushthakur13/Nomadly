import { z } from 'zod';

export const createInvitationSchema = z.object({
  tripId: z.string().min(1, 'tripId is required'),
  invitedEmail: z.email({ message: 'Invalid email address' }).optional(),
  invitedUsername: z.string().min(1, 'Username must not be empty').optional(),
  invitedUserId: z.string().optional(),
  inviteeEmail: z.email({ message: 'Invalid email address' }).optional(),
  inviteeUsername: z.string().min(1, 'Username must not be empty').optional(),
  inviteeUserId: z.string().optional(),
  role: z.enum(['editor', 'viewer']).optional().default('editor'),
  message: z.string().max(500, 'Message too long').optional(),
  expiresInDays: z.number().int().positive().optional(),
}).refine(
  data =>
    data.invitedEmail ||
    data.invitedUsername ||
    data.invitedUserId ||
    data.inviteeEmail ||
    data.inviteeUsername ||
    data.inviteeUserId,
  {
    message: 'Must provide an email, username, or userId to create an invitation',
  }
);
