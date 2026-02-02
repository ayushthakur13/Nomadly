import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchTrips, fetchTripById } from '../../store';

/**
 * Hook to manage trips cache and refresh operations.
 * Provides access to trips state and functions to refresh data.
 */
export const useTripsCache = () => {
  const dispatch = useDispatch();
  const { trips, selectedTrip } = useSelector((state: any) => state.trips);

  const refreshTrips = useCallback(async (filters: any = {}) => {
    try {
      await dispatch<any>(fetchTrips(filters));
    } catch (error) {
      console.error('Failed to fetch trips:', error);
    }
  }, [dispatch]);

  const refreshTrip = useCallback(async (tripId?: string) => {
    if (!tripId) return;
    try {
      await dispatch<any>(fetchTripById(tripId));
    } catch (error) {
      console.error(`Failed to fetch trip ${tripId}:`, error);
    }
  }, [dispatch]);

  return { trips, selectedTrip, refreshTrips, refreshTrip };
};

export default useTripsCache;
