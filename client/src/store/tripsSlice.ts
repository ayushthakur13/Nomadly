import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

const initialState = {
  trips: { upcoming: [], ongoing: [], past: [], all: [] } as any,
  selectedTrip: null as any,
  loading: false,
  error: null as any,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
};

export const fetchTrips = createAsyncThunk(
  'trips/fetchTrips',
  async ({ status, category, sort = 'createdAt', order = 'desc' }: any = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (category) params.append('category', category);
      params.append('sort', sort);
      params.append('order', order);
      const response = await api.get(`/trips?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch trips');
    }
  }
);

export const fetchTripById = createAsyncThunk(
  'trips/fetchTripById',
  async (tripId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/trips/${tripId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch trip');
    }
  }
);

export const createTrip = createAsyncThunk(
  'trips/createTrip',
  async (tripData: any, { rejectWithValue }) => {
    try {
      const response = await api.post('/trips', tripData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create trip');
    }
  }
);

export const updateTrip = createAsyncThunk(
  'trips/updateTrip',
  async ({ tripId, updates }: { tripId: string; updates: any }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/trips/${tripId}`, updates);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update trip');
    }
  }
);

export const deleteTrip = createAsyncThunk(
  'trips/deleteTrip',
  async (tripId: string, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/trips/${tripId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete trip');
    }
  }
);

export const updateTripCover = createAsyncThunk(
  'trips/updateTripCover',
  async ({ tripId, formData }: { tripId: string; formData: FormData }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/trips/${tripId}/cover`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update trip cover');
    }
  }
);

export const deleteTripCover = createAsyncThunk(
  'trips/deleteTripCover',
  async (tripId: string, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/trips/${tripId}/cover`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete trip cover');
    }
  }
);

export const publishTrip = createAsyncThunk(
  'trips/publishTrip',
  async (tripId: string, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/trips/${tripId}/publish`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to publish trip');
    }
  }
);

export const unpublishTrip = createAsyncThunk(
  'trips/unpublishTrip',
  async (tripId: string, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/trips/${tripId}/unpublish`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to unpublish trip');
    }
  }
);

const tripsSlice = createSlice({
  name: 'trips',
  initialState,
  reducers: {
    clearSelectedTrip: (state) => { state.selectedTrip = null; },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTrips.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchTrips.fulfilled, (state, action) => {
        state.loading = false;
        const payload: any = action.payload || {};
        const rawTrips = (payload.data && payload.data.trips) || payload.trips || [];
        const isCategorized = rawTrips && !Array.isArray(rawTrips) && typeof rawTrips === 'object'
          && ('all' in rawTrips && 'upcoming' in rawTrips && 'ongoing' in rawTrips && 'past' in rawTrips);
        if (isCategorized) { state.trips = rawTrips; return; }
        const list = Array.isArray(rawTrips) ? rawTrips : [];
        const categorized: any = { upcoming: [], ongoing: [], past: [], all: list.slice() };
        const today = new Date(); today.setHours(0, 0, 0, 0);
        for (const trip of list) {
          const start = new Date(trip.startDate); const end = new Date(trip.endDate);
          start.setHours(0,0,0,0); end.setHours(0,0,0,0);
          if (start > today) categorized.upcoming.push(trip);
          else if (end < today) categorized.past.push(trip);
          else categorized.ongoing.push(trip);
        }
        state.trips = categorized;
      })
      .addCase(fetchTrips.rejected, (state, action: any) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchTripById.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchTripById.fulfilled, (state, action) => {
        state.loading = false;
        const payload: any = action.payload || {};
        state.selectedTrip = (payload.data && payload.data.trip) || payload.trip || null;
      })
      .addCase(fetchTripById.rejected, (state, action: any) => { state.loading = false; state.error = action.payload; })
      .addCase(createTrip.pending, (state) => { state.createLoading = true; state.error = null; })
      .addCase(createTrip.fulfilled, (state) => { state.createLoading = false; })
      .addCase(createTrip.rejected, (state, action: any) => { state.createLoading = false; state.error = action.payload; })
      .addCase(updateTrip.pending, (state) => { state.updateLoading = true; state.error = null; })
      .addCase(updateTrip.fulfilled, (state, action) => { 
        state.updateLoading = false; 
        const payload: any = action.payload || {};
        state.selectedTrip = (payload.data && payload.data.trip) || payload.trip || state.selectedTrip;
      })
      .addCase(updateTrip.rejected, (state, action: any) => { state.updateLoading = false; state.error = action.payload; })
      .addCase(deleteTrip.pending, (state) => { state.deleteLoading = true; state.error = null; })
      .addCase(deleteTrip.fulfilled, (state) => { state.deleteLoading = false; state.selectedTrip = null; })
      .addCase(deleteTrip.rejected, (state, action: any) => { state.deleteLoading = false; state.error = action.payload; })
      .addCase(updateTripCover.fulfilled, (state, action) => {
        if (state.selectedTrip) {
          const payload: any = action.payload || {};
          state.selectedTrip.imageUrl = (payload.data && payload.data.imageUrl) || payload.imageUrl || state.selectedTrip.imageUrl;
        }
      })
      .addCase(deleteTripCover.fulfilled, (state, action) => {
        if (state.selectedTrip) {
          const payload: any = action.payload || {};
          state.selectedTrip.imageUrl = (payload.data && payload.data.imageUrl) || payload.imageUrl || '/images/default-trip.jpg';
        }
      })
      .addCase(publishTrip.fulfilled, (state) => {
        if (state.selectedTrip) {
          state.selectedTrip.isPublic = true;
        }
      })
      .addCase(unpublishTrip.fulfilled, (state) => {
        if (state.selectedTrip) {
          state.selectedTrip.isPublic = false;
        }
      });
  }
});

export const { clearSelectedTrip, clearError } = tripsSlice.actions;
export default tripsSlice.reducer;
