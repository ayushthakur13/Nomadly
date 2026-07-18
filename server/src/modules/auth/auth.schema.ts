import { z } from 'zod';

export const registerSchema = z.object({
  username: z.string().trim().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/, 'Username must only contain alphanumeric characters and underscores'),
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().trim().optional(),
});

export const loginSchema = z.object({
  usernameOrEmail: z.string().trim().min(1, 'Username or Email is required'),
  password: z.string().min(1, 'Password is required'),
});
