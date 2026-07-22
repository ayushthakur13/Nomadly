import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(200, 'Task title too long'),
  description: z.string().max(2000, 'Description too long').optional().nullable(),
  assignedTo: z.array(z.string()).optional().nullable(),
  dueDate: z.string().optional().nullable(),
});

export const updateTaskSchema = createTaskSchema.partial();
