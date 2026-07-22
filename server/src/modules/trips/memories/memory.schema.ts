import { z } from 'zod';

export const updateMemorySchema = z.object({
  caption: z.string().trim().max(500, 'Caption is too long').optional(),
});
