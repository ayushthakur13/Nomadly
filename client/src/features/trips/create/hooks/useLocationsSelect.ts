import { useCallback } from 'react';

/**
 * Manages location selection for source and destination.
 * Single responsibility: location mapping and coordinate handling.
 */
export const useLocationsSelect = (onLocationSelect: (location: any, type: 'source' | 'destination') => void) => {
  const handleLocationSelect = useCallback(
    (location: any, type: 'source' | 'destination') => {
      const mappedLocation = {
        name: location.name,
        address: location.address,
        coordinates: { lat: location.lat, lng: location.lng },
        placeId: location.placeId,
      };
      onLocationSelect(mappedLocation, type);
    },
    [onLocationSelect]
  );

  return { handleLocationSelect };
};
