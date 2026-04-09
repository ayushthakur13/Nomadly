import api from "./api";
import { extractApiError, type ApiError } from "../utils/errorHandling";
import type { Accommodation, CreateAccommodationDTO, UpdateAccommodationDTO } from "../../../shared/types";

export type { Accommodation };

const normalizeAccommodation = (item: any): Accommodation => {
  const createdBy = typeof item?.createdBy === "string" ? item.createdBy : item?.createdBy?._id;
  const createdByName =
    typeof item?.createdBy === "object"
      ? item.createdBy?.name || item.createdBy?.username || "Unknown member"
      : undefined;

  const normalized: any = {
    ...item,
    createdBy,
  };

  if (createdByName) {
    normalized.createdByName = createdByName;
  }

  return normalized;
};

const normalizeAccommodationResponse = (response: any): Accommodation => {
  if (response?.data?.accommodation) return normalizeAccommodation(response.data.accommodation);
  if (response?.accommodation) return normalizeAccommodation(response.accommodation);
  return normalizeAccommodation(response);
};

const normalizeAccommodationsResponse = (response: any): Accommodation[] => {
  const items = response?.data?.accommodations || response?.accommodations || response || [];
  return items.map(normalizeAccommodation);
};

export async function fetchAccommodations(tripId: string): Promise<Accommodation[]> {
  try {
    const res = await api.get(`/trips/${tripId}/accommodations`);
    return normalizeAccommodationsResponse(res.data);
  } catch (error) {
    throw new Error(extractApiError(error as ApiError, "Failed to fetch accommodations"));
  }
}

export async function createAccommodation(
  tripId: string,
  payload: CreateAccommodationDTO
): Promise<Accommodation> {
  try {
    const res = await api.post(`/trips/${tripId}/accommodations`, payload);
    return normalizeAccommodationResponse(res.data);
  } catch (error) {
    throw new Error(extractApiError(error as ApiError, "Failed to create accommodation"));
  }
}

export async function updateAccommodation(
  accommodationId: string,
  payload: UpdateAccommodationDTO
): Promise<Accommodation> {
  try {
    const res = await api.patch(`/accommodations/${accommodationId}`, payload);
    return normalizeAccommodationResponse(res.data);
  } catch (error) {
    throw new Error(extractApiError(error as ApiError, "Failed to update accommodation"));
  }
}

export async function deleteAccommodation(accommodationId: string): Promise<void> {
  try {
    await api.delete(`/accommodations/${accommodationId}`);
  } catch (error) {
    throw new Error(extractApiError(error as ApiError, "Failed to delete accommodation"));
  }
}

export default {
  fetchAccommodations,
  createAccommodation,
  updateAccommodation,
  deleteAccommodation,
};
