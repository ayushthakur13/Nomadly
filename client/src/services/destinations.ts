import api from './api';

export interface DestinationLocation {
  name?: string;
  address?: string;
  placeId?: string;
  coordinates?: [number, number]; // [lng, lat] - optional for manual entry
}

export interface DestinationPayload {
  name: string;
  location?: DestinationLocation;
  arrivalDate?: string;
  departureDate?: string;
  notes?: string;
  imageUrl?: string;
}

export interface Destination extends DestinationPayload {
  _id: string;
  tripId: string;
  order: number;
  createdAt: string;
  updatedAt: string;
  location?: DestinationLocation & {
    point?: { type: 'Point'; coordinates: [number, number] };
  };
}

export async function fetchDestinations(tripId: string): Promise<Destination[]> {
  const res = await api.get(`/trips/${tripId}/destinations`);
  return res.data?.data?.destinations || [];
}

export async function createDestination(tripId: string, payload: DestinationPayload): Promise<Destination> {
  const res = await api.post(`/trips/${tripId}/destinations`, payload);
  return res.data?.data?.destination;
}

export async function updateDestination(destinationId: string, payload: Partial<DestinationPayload>): Promise<Destination> {
  const res = await api.patch(`/destinations/${destinationId}`, payload);
  return res.data?.data?.destination;
}

export async function deleteDestination(destinationId: string): Promise<void> {
  await api.delete(`/destinations/${destinationId}`);
}

export async function reorderDestinations(tripId: string, orderedIds: string[]): Promise<Destination[]> {
  const res = await api.patch(`/trips/${tripId}/destinations/reorder`, { orderedDestinationIds: orderedIds });
  return res.data?.data?.destinations || [];
}

export async function uploadDestinationImage(destinationId: string, formData: FormData): Promise<Destination> {
  const res = await api.post(`/destinations/${destinationId}/image`, formData);
  return res.data?.data?.destination;
}

export async function deleteDestinationImage(destinationId: string): Promise<Destination> {
  const res = await api.delete(`/destinations/${destinationId}/image`);
  return res.data?.data?.destination;
}

export default {
  fetchDestinations,
  createDestination,
  updateDestination,
  deleteDestination,
  reorderDestinations,
  uploadDestinationImage,
  deleteDestinationImage,
};
