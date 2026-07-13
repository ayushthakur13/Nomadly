import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  fetchMemories as apiFetchMemories,
  uploadMemory as apiUploadMemory,
  deleteMemory as apiDeleteMemory,
  updateMemoryCaption as apiUpdateMemoryCaption,
} from "@/services/memories.service";
import type { Memory } from "@shared/types";
import { extractApiError, type ApiError } from "@/utils/errorHandling";

export function useMemories() {
  const { tripId } = useParams<{ tripId: string }>();

  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!tripId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetchMemories(tripId);
      setMemories(data);
    } catch (err) {
      setError(extractApiError(err as ApiError, "Failed to load memories"));
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    load();
  }, [load]);

  const uploadMemory = useCallback(
    async (formData: FormData): Promise<Memory> => {
      if (!tripId) throw new Error("Trip ID is required");
      setActionLoading(true);
      setError(null);
      try {
        const created = await apiUploadMemory(tripId, formData);
        setMemories((prev) => [created, ...prev]); // Add to the top of list since it's chronological descending
        return created;
      } catch (err) {
        const message = extractApiError(err as ApiError, "Failed to upload memory");
        setError(message);
        throw new Error(message);
      } finally {
        setActionLoading(false);
      }
    },
    [tripId]
  );

  const deleteMemory = useCallback(async (memoryId: string): Promise<void> => {
    setActionLoading(true);
    setError(null);
    try {
      await apiDeleteMemory(memoryId);
      setMemories((prev) => prev.filter((item) => item._id !== memoryId));
    } catch (err) {
      const message = extractApiError(err as ApiError, "Failed to delete memory");
      setError(message);
      throw new Error(message);
    } finally {
      setActionLoading(false);
    }
  }, []);

  const updateMemoryCaption = useCallback(
    async (memoryId: string, caption: string): Promise<Memory> => {
      setActionLoading(true);
      setError(null);
      try {
        const updated = await apiUpdateMemoryCaption(memoryId, caption);
        setMemories((prev) => prev.map((item) => (item._id === memoryId ? updated : item)));
        return updated;
      } catch (err) {
        const message = extractApiError(err as ApiError, "Failed to update caption");
        setError(message);
        throw new Error(message);
      } finally {
        setActionLoading(false);
      }
    },
    []
  );

  return {
    memories,
    loading,
    actionLoading,
    error,
    uploadMemory,
    deleteMemory,
    updateMemoryCaption,
    reload: load,
  };
}
export default useMemories;
