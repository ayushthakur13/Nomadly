import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  fetchAccommodations as apiFetchAccommodations,
  createAccommodation as apiCreateAccommodation,
  updateAccommodation as apiUpdateAccommodation,
  deleteAccommodation as apiDeleteAccommodation,
} from "@/services/accommodations.service";
import type { Accommodation, CreateAccommodationDTO, UpdateAccommodationDTO } from "@shared/types";
import { extractApiError, type ApiError } from "@/utils/errorHandling";

export function useAccommodations() {
  const { tripId } = useParams<{ tripId: string }>();

  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!tripId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetchAccommodations(tripId);
      setAccommodations(data);
    } catch (err) {
      setError(extractApiError(err as ApiError, "Failed to load accommodations"));
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    load();
  }, [load]);

  const createAccommodation = useCallback(
    async (payload: CreateAccommodationDTO): Promise<Accommodation> => {
      if (!tripId) throw new Error("Trip ID is required");
      setActionLoading(true);
      setError(null);
      try {
        const created = await apiCreateAccommodation(tripId, payload);
        setAccommodations((prev) => [...prev, created]);
        return created;
      } catch (err) {
        const message = extractApiError(err as ApiError, "Failed to create accommodation");
        setError(message);
        throw new Error(message);
      } finally {
        setActionLoading(false);
      }
    },
    [tripId]
  );

  const updateAccommodation = useCallback(
    async (accommodationId: string, payload: UpdateAccommodationDTO): Promise<Accommodation> => {
      setActionLoading(true);
      setError(null);
      try {
        const updated = await apiUpdateAccommodation(accommodationId, payload);
        setAccommodations((prev) => prev.map((item) => (item._id === accommodationId ? updated : item)));
        return updated;
      } catch (err) {
        const message = extractApiError(err as ApiError, "Failed to update accommodation");
        setError(message);
        throw new Error(message);
      } finally {
        setActionLoading(false);
      }
    },
    []
  );

  const deleteAccommodation = useCallback(async (accommodationId: string): Promise<void> => {
    setActionLoading(true);
    setError(null);
    try {
      await apiDeleteAccommodation(accommodationId);
      setAccommodations((prev) => prev.filter((item) => item._id !== accommodationId));
    } catch (err) {
      const message = extractApiError(err as ApiError, "Failed to delete accommodation");
      setError(message);
      throw new Error(message);
    } finally {
      setActionLoading(false);
    }
  }, []);

  return {
    accommodations,
    loading,
    actionLoading,
    error,
    createAccommodation,
    updateAccommodation,
    deleteAccommodation,
    reload: load,
  };
}
