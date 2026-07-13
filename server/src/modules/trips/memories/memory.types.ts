import { Types } from 'mongoose';

export interface MemoryQueryFilters {
  tripId: string;
  uploadedBy?: string;
  page?: number;
  limit?: number;
}
