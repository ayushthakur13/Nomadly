/**
 * Accommodation domain types - API contract between client and server
 */

export interface Accommodation {
  _id: string;
  tripId: string;
  createdBy: string;
  createdByName?: string;
  name: string;
  address?: string;
  bookingUrl?: string;
  checkIn?: string;
  checkOut?: string;
  pricePerNight?: number;
  notes?: string;
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
}

export interface UpdateAccommodationDTO {
  name?: string;
  address?: string;
  bookingUrl?: string;
  checkIn?: string | Date;
  checkOut?: string | Date;
  pricePerNight?: number;
  notes?: string;
}
