import { z } from 'zod';

const locationSchema = z.object({
  name: z.string().trim().min(1, 'Location name is required'),
  address: z.string().trim().optional(),
  placeId: z.string().trim().optional(),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number(),
  }).optional(),
});

const tripObjectSchema = z.object({
  tripName: z.string().trim().min(1, 'Trip name is required').max(100, 'Trip name is too long'),
  description: z.string().trim().max(500, 'Description is too long').optional(),
  startDate: z.string().date('Invalid start date format'),
  endDate: z.string().date('Invalid end date format'),
  sourceLocation: locationSchema.optional(),
  destinationLocation: locationSchema,
  category: z.string().trim().optional(),
  tags: z.array(z.string().trim()).optional(),
  isPublic: z.boolean().optional(),
  memoriesPublic: z.boolean().optional(),
  stayPermissions: z.object({
    allowMemberStayEdits: z.boolean()
  }).partial().optional(),
});

export const createTripSchema = tripObjectSchema.refine(
  data => new Date(data.endDate) >= new Date(data.startDate),
  {
    message: 'End date must be after start date',
    path: ['endDate']
  }
);

export const updateTripSchema = tripObjectSchema.partial().refine(
  data => {
    if (data.startDate && data.endDate) {
      return new Date(data.endDate) >= new Date(data.startDate);
    }
    return true;
  },
  {
    message: 'End date must be after start date',
    path: ['endDate']
  }
);

export const cloneTripSchema = z.object({
  name: z.string().trim().max(100, 'Trip name is too long').optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  mode: z.enum(['TEMPLATE', 'PLANNING', 'FULL_HISTORY']).optional().default('TEMPLATE'),
});
