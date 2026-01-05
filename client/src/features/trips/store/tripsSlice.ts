import { createSlice } from '@reduxjs/toolkit';
import {
  fetchTrips,
  fetchTripById,
  createTrip,
  updateTrip,
  deleteTrip,
  updateTripCover,
  deleteTripCover,
  publishTrip,
  unpublishTrip,
} from './tripsThunks';
import { processFetchedTrips } from '../utils/tripCategorization';
import type { Trip } from '../../../services/trips.service';

interface TripsState {
  trips: {
    upcoming: Trip[];
    ongoing: Trip[];
    past: Trip[];
    all: Trip[];
  };
  selectedTrip: Trip | null;
  loading: boolean;
  error: string | null;
  createLoading: boolean;
  updateLoading: boolean;
  deleteLoading: boolean;
}

const initialState: TripsState = {
  trips: { upcoming: [], ongoing: [], past: [], all: [] },
  selectedTrip: null,
  loading: false,
  error: null,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
};

const tripsSlice = createSlice({
  name: 'trips',
  initialState,
  reducers: {
    clearSelectedTrip: (state) => { state.selectedTrip = null; },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTrips.pending, (state) => { 
        state.loading = true; 
        state.error = null; 
      })
      .addCase(fetchTrips.fulfilled, (state, action) => {
        state.loading = false;
        state.trips = processFetchedTrips(action.payload);
      })
      .addCase(fetchTrips.rejected, (state, action) => { 
        state.loading = false; 
        state.error = action.payload ?? 'Failed to fetch trips'; 
      })
      
      .addCase(fetchTripById.pending, (state) => { 
        state.loading = true; 
        state.error = null; 
      })
      .addCase(fetchTripById.fulfilled, (state, action) => {
        state.loading = false;
        // Clean: action.payload is already a Trip, no need to extract
        state.selectedTrip = action.payload;
      })
      .addCase(fetchTripById.rejected, (state, action) => { 
        state.loading = false; 
        state.error = action.payload ?? 'Failed to fetch trip'; 
      })
      
      .addCase(createTrip.pending, (state) => { 
        state.createLoading = true; 
        state.error = null; 
      })
      .addCase(createTrip.fulfilled, (state, action) => { 
        state.createLoading = false;
        // Clean: action.payload is already a Trip
        state.selectedTrip = action.payload;
      })
      .addCase(createTrip.rejected, (state, action) => { 
        state.createLoading = false; 
        state.error = action.payload ?? 'Failed to create trip'; 
      })
      
      .addCase(updateTrip.pending, (state) => { 
        state.updateLoading = true; 
        state.error = null; 
      })
      .addCase(updateTrip.fulfilled, (state, action) => { 
        state.updateLoading = false;
        // Clean: action.payload is already a Trip
        if (state.selectedTrip) {
          // Merge to preserve fields not returned by update (e.g., createdBy)
          state.selectedTrip = { ...state.selectedTrip, ...action.payload };
        } else {
          state.selectedTrip = action.payload;
        }
      })
      .addCase(updateTrip.rejected, (state, action) => { 
        state.updateLoading = false; 
        state.error = action.payload ?? 'Failed to update trip'; 
      })
      
      .addCase(deleteTrip.pending, (state) => { 
        state.deleteLoading = true; 
        state.error = null; 
      })
      .addCase(deleteTrip.fulfilled, (state) => { 
        state.deleteLoading = false; 
        state.selectedTrip = null; 
      })
      .addCase(deleteTrip.rejected, (state, action) => { 
        state.deleteLoading = false; 
        state.error = action.payload ?? 'Failed to delete trip'; 
      })
      
      .addCase(updateTripCover.fulfilled, (state, action) => {
        // Clean: action.payload is already a Trip with updated cover fields
        if (state.selectedTrip) {
          state.selectedTrip.coverImageUrl = action.payload.coverImageUrl;
          state.selectedTrip.coverImagePublicId = action.payload.coverImagePublicId;
        }
      })
      
      .addCase(deleteTripCover.fulfilled, (state, action) => {
        // Clean: action.payload is already a Trip with cleared cover fields
        if (state.selectedTrip) {
          state.selectedTrip.coverImageUrl = action.payload.coverImageUrl || '';
          state.selectedTrip.coverImagePublicId = action.payload.coverImagePublicId || '';
        }
      })
      
      .addCase(publishTrip.fulfilled, (state, action) => {
        // Clean: action.payload is already a Trip with isPublic updated
        if (state.selectedTrip) {
          state.selectedTrip.isPublic = action.payload.isPublic;
        }
      })
      
      .addCase(unpublishTrip.fulfilled, (state, action) => {
        // Clean: action.payload is already a Trip with isPublic updated
        if (state.selectedTrip) {
          state.selectedTrip.isPublic = action.payload.isPublic;
        }
      });
  }
});

export const { clearSelectedTrip, clearError } = tripsSlice.actions;
export default tripsSlice.reducer;
