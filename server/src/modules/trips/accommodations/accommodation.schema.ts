import { z } from 'zod';

export const createAccommodationSchema = z.object({
  name: z.string().min(1, 'Accommodation name is required').max(100, 'Accommodation name too long'),
  address: z.string().max(300, 'Address too long').optional().nullable(),
  bookingUrl: z.string().max(2000, 'Booking URL too long').optional().nullable(),
  checkIn: z.string().optional().nullable(),
  checkOut: z.string().optional().nullable(),
  pricePerNight: z.number().nonnegative('Price per night must be non-negative').optional().nullable(),
  notes: z.string().max(2000, 'Notes too long').optional().nullable(),
  destinationId: z.string().optional().nullable(),
  checkInInstructions: z.string().max(2000, 'Check-in instructions too long').optional().nullable(),
  hostContactName: z.string().max(100, 'Host contact name too long').optional().nullable(),
  hostContactPhone: z.string().max(50, 'Host contact phone too long').optional().nullable(),
  hostContactWhatsApp: z.string().max(50, 'Host contact WhatsApp too long').optional().nullable(),
  handoffNotes: z.string().max(2000, 'Handoff notes too long').optional().nullable(),
});

export const updateAccommodationSchema = createAccommodationSchema.partial();
