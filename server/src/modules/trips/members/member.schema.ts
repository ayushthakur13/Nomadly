import { z } from 'zod';

export const addMemberSchema = z.object({
  email: z.string().email('Invalid email address').optional(),
  username: z.string().min(1, 'Username must not be empty').optional(),
  userId: z.string().optional(),
  role: z.enum(['editor', 'viewer']).optional().default('editor'),
}).refine(data => data.email || data.username || data.userId, {
  message: 'Must provide email, username, or userId to add a member',
});

export const updateMemberRoleSchema = z.object({
  role: z.enum(['editor', 'viewer'], {
    invalid_type_error: 'Role must be either editor or viewer',
    required_error: 'Role is required',
  }),
});
