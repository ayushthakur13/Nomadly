import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchTrips, fetchTripById } from '../store/tripsSlice';

/**
 * Hook for managing trips data caching and refetching
 */
export const useTripsCache = () => {
  const dispatch = useDispatch();
  const { trips, selectedTrip } = useSelector((state) => state.trips);
  
  /**
     * Fetch trips with current filters
   */
  const refreshTrips = useCallback(async (filters = {}) => {
      try {
      await dispatch(fetchTrips(filters));
      } catch (error) {
        console.error('Failed to fetch trips:', error);
    }
  }, [dispatch]);

  /**
     * Fetch a single trip
   */
  const refreshTrip = useCallback(async (tripId) => {
      if (!tripId) return;
      try {
      await dispatch(fetchTripById(tripId));
      } catch (error) {
        console.error(`Failed to fetch trip ${tripId}:`, error);
    }
  }, [dispatch]);

  return {
    trips,
    selectedTrip,
    refreshTrips,
    refreshTrip
  };
};

export default useTripsCache;