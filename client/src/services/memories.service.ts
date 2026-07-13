import api from './api';
import { extractApiError, type ApiError } from '../utils/errorHandling';
import type { Memory } from '../../../shared/types';

export type { Memory };

/**
 * API Response normalization helper
 */
const normalizeMemoryResponse = (response: any): Memory => {
  if (response.data?.memory) return response.data.memory;
  if (response.memory) return response.memory;
  return response;
};

const normalizeMemoriesResponse = (response: any): Memory[] => {
  if (response.data?.memories) return response.data.memories;
  if (response.memories) return response.memories;
  return response;
};

export async function fetchMemories(tripId: string): Promise<Memory[]> {
  try {
    const res = await api.get(`/trips/${tripId}/memories`);
    return normalizeMemoriesResponse(res.data);
  } catch (error) {
    throw new Error(extractApiError(error as ApiError, 'Failed to fetch memories'));
  }
}

export async function uploadMemory(tripId: string, formData: FormData): Promise<Memory> {
  try {
    const res = await api.post(`/trips/${tripId}/memories`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return normalizeMemoryResponse(res.data);
  } catch (error) {
    throw new Error(extractApiError(error as ApiError, 'Failed to upload photo'));
  }
}

export async function deleteMemory(memoryId: string): Promise<void> {
  try {
    await api.delete(`/memories/${memoryId}`);
  } catch (error) {
    throw new Error(extractApiError(error as ApiError, 'Failed to delete photo'));
  }
}

export async function updateMemoryCaption(memoryId: string, caption: string): Promise<Memory> {
  try {
    const res = await api.patch(`/memories/${memoryId}`, { caption });
    return normalizeMemoryResponse(res.data);
  } catch (error) {
    throw new Error(extractApiError(error as ApiError, 'Failed to update caption'));
  }
}

export default {
  fetchMemories,
  uploadMemory,
  deleteMemory,
  updateMemoryCaption,
};
