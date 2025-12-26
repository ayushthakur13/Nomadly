import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTripById } from '@/store/tripsSlice';

/**
 * Orchestration hook: fetches trip data by ID on mount.
 * Replaces useEffect in TripDashboardPage. Single responsibility: fetch flow.
 */
export const useTripDashboardData = (tripId?: string) => {
  const dispatch = useDispatch<any>();
  const { selectedTrip: trip, loading, error } = useSelector((state: any) => state.trips);

  useEffect(() => {
    if (tripId) {
      dispatch(fetchTripById(tripId) as any);
    }
  }, [dispatch, tripId]);

  return { trip, loading, error };
};
