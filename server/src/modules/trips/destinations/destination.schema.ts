import { z } from 'zod';

const locationSchema = z.object({
  name: z.string().min(1, 'Location name is required'),
  address: z.string().optional(),
  placeId: z.string().optional(),
  point: z.object({
    type: z.literal('Point'),
    coordinates: z.tuple([z.number(), z.number()]),
  }).optional(),
});

export const createDestinationSchema = z.object({
  name: z.string().min(1, 'Destination name is required').max(100, 'Destination name too long'),
  arrivalDate: z.string().optional().nullable(),
  departureDate: z.string().optional().nullable(),
  notes: z.string().max(2000, 'Notes too long').optional().nullable(),
  location: locationSchema.optional().nullable(),
  order: z.number().int().nonnegative().optional(),
});

export const updateDestinationSchema = createDestinationSchema.partial();

export const reorderDestinationsSchema = z.object({
  orderedIds: z.array(z.string().min(1, 'Invalid destination ID')).min(1, 'orderedIds must not be empty'),
});
