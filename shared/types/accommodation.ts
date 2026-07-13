/**
 * Accommodation domain types - API contract between client and server
 */

export interface Accommodation {
  _id: string;
  tripId: string;
  createdBy: string;
  createdByName?: string;
  destinationId?: string;
  name: string;
  address?: string;
  bookingUrl?: string;
  checkIn?: string;
  checkOut?: string;
  pricePerNight?: number;
  notes?: string;
  checkInInstructions?: string;
  hostContactName?: string;
  hostContactPhone?: string;
  hostContactWhatsApp?: string;
  handoffNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAccommodationDTO {
  name: string;
  address?: string;
  bookingUrl?: string;
  checkIn?: string | Date;
  checkOut?: string | Date;
  pricePerNight?: number;
  notes?: string;
  destinationId?: string;
  checkInInstructions?: string;
  hostContactName?: string;
  hostContactPhone?: string;
  hostContactWhatsApp?: string;
  handoffNotes?: string;
}

export interface UpdateAccommodationDTO {
  name?: string;
  address?: string;
  bookingUrl?: string;
  checkIn?: string | Date;
  checkOut?: string | Date;
  pricePerNight?: number;
  notes?: string;
  destinationId?: string;
  checkInInstructions?: string;
  hostContactName?: string;
  hostContactPhone?: string;
  hostContactWhatsApp?: string;
  handoffNotes?: string;
}

export interface AccommodationListResponse {
  accommodations: Accommodation[];
}
