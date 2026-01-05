import { createAsyncThunk } from '@reduxjs/toolkit';
import * as tripsService from '../../../services/trips.service';
import type {
  Trip,
  CategorizedTrips,
  CreateTripPayload,
  UpdateTripPayload,
  FetchTripsParams,
} from '../../../services/trips.service';

/**
 * Trip async thunks - Orchestration layer.
 * Calls service functions, handles async flow.
 * Service layer already normalizes responses and errors, so thunks are clean.
 */

export const fetchTrips = createAsyncThunk<
  Trip[] | CategorizedTrips,
  FetchTripsParams | undefined,
  { rejectValue: string }
>(
  'trips/fetchTrips',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await tripsService.fetchTripsAPI(params);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch trips');
    }
  }
);

export const fetchTripById = createAsyncThunk<
  Trip,
  string,
  { rejectValue: string }
>(
  'trips/fetchTripById',
  async (tripId, { rejectWithValue }) => {
    try {
      return await tripsService.fetchTripByIdAPI(tripId);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch trip');
    }
  }
);

export const createTrip = createAsyncThunk<
  Trip,
  CreateTripPayload,
  { rejectValue: string }
>(
  'trips/createTrip',
  async (tripData, { rejectWithValue }) => {
    try {
      return await tripsService.createTripAPI(tripData);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create trip');
    }
  }
);

export const updateTrip = createAsyncThunk<
  Trip,
  { tripId: string; updates: UpdateTripPayload },
  { rejectValue: string }
>(
  'trips/updateTrip',
  async ({ tripId, updates }, { rejectWithValue }) => {
    try {
      return await tripsService.updateTripAPI(tripId, updates);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update trip');
    }
  }
);

export const deleteTrip = createAsyncThunk<
  { success: boolean; message?: string },
  string,
  { rejectValue: string }
>(
  'trips/deleteTrip',
  async (tripId, { rejectWithValue }) => {
    try {
      return await tripsService.deleteTripAPI(tripId);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete trip');
    }
  }
);

export const updateTripCover = createAsyncThunk<
  Trip,
  { tripId: string; formData: FormData },
  { rejectValue: string }
>(
  'trips/updateTripCover',
  async ({ tripId, formData }, { rejectWithValue }) => {
    try {
      return await tripsService.updateTripCoverAPI(tripId, formData);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update trip cover');
    }
  }
);

export const deleteTripCover = createAsyncThunk<
  Trip,
  string,
  { rejectValue: string }
>(
  'trips/deleteTripCover',
  async (tripId, { rejectWithValue }) => {
    try {
      return await tripsService.deleteTripCoverAPI(tripId);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete trip cover');
    }
  }
);

export const publishTrip = createAsyncThunk<
  Trip,
  string,
  { rejectValue: string }
>(
  'trips/publishTrip',
  async (tripId, { rejectWithValue }) => {
    try {
      return await tripsService.publishTripAPI(tripId);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to publish trip');
    }
  }
);

export const unpublishTrip = createAsyncThunk<
  Trip,
  string,
  { rejectValue: string }
>(
  'trips/unpublishTrip',
  async (tripId, { rejectWithValue }) => {
    try {
      return await tripsService.unpublishTripAPI(tripId);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to unpublish trip');
    }
  }
);
