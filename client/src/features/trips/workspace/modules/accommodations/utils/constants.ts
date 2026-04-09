import type { CreateAccommodationDTO } from "@shared/types";

export const DEFAULT_ACCOMMODATION_FORM_VALUES: CreateAccommodationDTO = {
  name: "",
  address: "",
  bookingUrl: "",
  checkIn: "",
  checkOut: "",
  pricePerNight: undefined,
  notes: "",
};
