import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

// Initial state
const initialState = {
  trips: {
    upcoming: [],
    ongoing: [],
    past: [],
    all: []
  },
  selectedTrip: null,
  loading: false,
  error: null,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
};

// ========================================
// Async Thunks
// ========================================

/**
 * Fetch all user trips
 */
export const fetchTrips = createAsyncThunk(
  'trips/fetchTrips',
  async ({ status, category, sort = 'createdAt', order = 'desc' } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (category) params.append('category', category);
      params.append('sort', sort);
      params.append('order', order);

      const response = await api.get(`/trips?${params.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch trips');
    }
  }
);

/**
 * Fetch single trip by ID
 */
export const fetchTripById = createAsyncThunk(
  'trips/fetchTripById',
  async (tripId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/trips/${tripId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch trip');
    }
  }
);

/**
 * Create new trip
 */
export const createTrip = createAsyncThunk(
  'trips/createTrip',
  async (tripData, { rejectWithValue }) => {
    try {
      const response = await api.post('/trips', tripData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create trip');
    }
  }
);

/**
 * Update trip
 */
export const updateTrip = createAsyncThunk(
  'trips/updateTrip',
  async ({ tripId, tripData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/trips/${tripId}`, tripData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update trip');
    }
  }
);

/**
 * Delete trip
 */
export const deleteTrip = createAsyncThunk(
  'trips/deleteTrip',
  async (tripId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/trips/${tripId}`);
      return { ...response.data, tripId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete trip');
    }
  }
);

/**
 * Update trip cover image
 */
export const updateTripCover = createAsyncThunk(
  'trips/updateTripCover',
  async ({ tripId, imageFile }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await api.post(`/trips/${tripId}/cover`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return { ...response.data, tripId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to upload cover image');
    }
  }
);

/**
 * Delete trip cover image
 */
export const deleteTripCover = createAsyncThunk(
  'trips/deleteTripCover',
  async (tripId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/trips/${tripId}/cover`);
      return { ...response.data, tripId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete cover image');
    }
  }
);

/**
 * Publish trip
 */
export const publishTrip = createAsyncThunk(
  'trips/publishTrip',
  async (tripId, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/trips/${tripId}/publish`);
      return { ...response.data, tripId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to publish trip');
    }
  }
);

/**
 * Unpublish trip
 */
export const unpublishTrip = createAsyncThunk(
  'trips/unpublishTrip',
  async (tripId, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/trips/${tripId}/unpublish`);
      return { ...response.data, tripId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to unpublish trip');
    }
  }
);

/**
 * Clone trip
 */
export const cloneTrip = createAsyncThunk(
  'trips/cloneTrip',
  async (tripId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/trips/${tripId}/clone`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to clone trip');
    }
  }
);

// ========================================
// Slice
// ========================================

const tripsSlice = createSlice({
  name: 'trips',
  initialState,
  reducers: {
    clearSelectedTrip: (state) => {
      state.selectedTrip = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    // Optimistic update for trip cover
    updateTripCoverOptimistic: (state, action) => {
      const { tripId, imageUrl } = action.payload;
      if (state.selectedTrip && state.selectedTrip._id === tripId) {
        state.selectedTrip.imageUrl = imageUrl;
      }
      // Update in trips list
      Object.keys(state.trips).forEach(category => {
        const trip = state.trips[category].find(t => t._id === tripId);
        if (trip) trip.imageUrl = imageUrl;
      });
    },
  },
  extraReducers: (builder) => {
    // Fetch Trips
    builder
      .addCase(fetchTrips.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTrips.fulfilled, (state, action) => {
        state.loading = false;
        state.trips = action.payload.trips;
      })
      .addCase(fetchTrips.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Trip By ID
    builder
      .addCase(fetchTripById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTripById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedTrip = action.payload.trip;
      })
      .addCase(fetchTripById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Create Trip
    builder
      .addCase(createTrip.pending, (state) => {
        state.createLoading = true;
        state.error = null;
      })
      .addCase(createTrip.fulfilled, (state, action) => {
        state.createLoading = false;
        const newTrip = action.payload.trip;
        
        // Add to appropriate category
        const today = new Date();
        const start = new Date(newTrip.startDate);
        
        if (start > today) {
          state.trips.upcoming.unshift(newTrip);
        } else {
          state.trips.ongoing.unshift(newTrip);
        }
        state.trips.all.unshift(newTrip);
      })
      .addCase(createTrip.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload;
      });

    // Update Trip
    builder
      .addCase(updateTrip.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateTrip.fulfilled, (state, action) => {
        state.updateLoading = false;
        const updatedTrip = action.payload.trip;
        
        // Update selected trip
        if (state.selectedTrip && state.selectedTrip._id === updatedTrip._id) {
          state.selectedTrip = updatedTrip;
        }
        
        // Update in all categories
        Object.keys(state.trips).forEach(category => {
          const index = state.trips[category].findIndex(t => t._id === updatedTrip._id);
          if (index !== -1) {
            state.trips[category][index] = updatedTrip;
          }
        });
      })
      .addCase(updateTrip.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
      });

    // Delete Trip
    builder
      .addCase(deleteTrip.pending, (state) => {
        state.deleteLoading = true;
        state.error = null;
      })
      .addCase(deleteTrip.fulfilled, (state, action) => {
        state.deleteLoading = false;
        const tripId = action.payload.tripId;
        
        // Remove from selected trip
        if (state.selectedTrip && state.selectedTrip._id === tripId) {
          state.selectedTrip = null;
        }
        
        // Remove from all categories
        Object.keys(state.trips).forEach(category => {
          state.trips[category] = state.trips[category].filter(t => t._id !== tripId);
        });
      })
      .addCase(deleteTrip.rejected, (state, action) => {
        state.deleteLoading = false;
        state.error = action.payload;
      });

    // Update Trip Cover
    builder
      .addCase(updateTripCover.fulfilled, (state, action) => {
        const { tripId, imageUrl } = action.payload;
        
        // Update selected trip
        if (state.selectedTrip && state.selectedTrip._id === tripId) {
          state.selectedTrip.imageUrl = imageUrl;
        }
        
        // Update in all categories
        Object.keys(state.trips).forEach(category => {
          const trip = state.trips[category].find(t => t._id === tripId);
          if (trip) trip.imageUrl = imageUrl;
        });
      });

    // Delete Trip Cover
    builder
      .addCase(deleteTripCover.fulfilled, (state, action) => {
        const { tripId, imageUrl } = action.payload;
        
        // Update selected trip
        if (state.selectedTrip && state.selectedTrip._id === tripId) {
          state.selectedTrip.imageUrl = imageUrl;
        }
        
        // Update in all categories
        Object.keys(state.trips).forEach(category => {
          const trip = state.trips[category].find(t => t._id === tripId);
          if (trip) trip.imageUrl = imageUrl;
        });
      });

    // Publish/Unpublish Trip
    builder
      .addCase(publishTrip.fulfilled, (state, action) => {
        const { tripId, isPublic } = action.payload;
        
        if (state.selectedTrip && state.selectedTrip._id === tripId) {
          state.selectedTrip.isPublic = isPublic;
        }
        
        Object.keys(state.trips).forEach(category => {
          const trip = state.trips[category].find(t => t._id === tripId);
          if (trip) trip.isPublic = isPublic;
        });
      })
      .addCase(unpublishTrip.fulfilled, (state, action) => {
        const { tripId, isPublic } = action.payload;
        
        if (state.selectedTrip && state.selectedTrip._id === tripId) {
          state.selectedTrip.isPublic = isPublic;
        }
        
        Object.keys(state.trips).forEach(category => {
          const trip = state.trips[category].find(t => t._id === tripId);
          if (trip) trip.isPublic = isPublic;
        });
      });

    // Clone Trip
    builder
      .addCase(cloneTrip.fulfilled, (state, action) => {
        const clonedTrip = action.payload.trip;
        
        // Add to upcoming trips (cloned trips are always upcoming)
        state.trips.upcoming.unshift(clonedTrip);
        state.trips.all.unshift(clonedTrip);
      });
  },
});

export const { clearSelectedTrip, clearError, updateTripCoverOptimistic } = tripsSlice.actions;
export default tripsSlice.reducer;