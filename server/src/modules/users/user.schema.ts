import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().trim().max(50, 'Name must be 50 characters or less').optional(),
  bio: z.string().trim().max(300, 'Bio must be 300 characters or less').optional(),
  isPublic: z.boolean().optional(),
}).refine(data => data.name !== undefined || data.bio !== undefined || data.isPublic !== undefined, {
  message: 'At least one field (name, bio, isPublic) must be provided'
});

export const changeUsernameSchema = z.object({
  username: z.string().trim().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/, 'Invalid username format'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().trim().optional(),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});
