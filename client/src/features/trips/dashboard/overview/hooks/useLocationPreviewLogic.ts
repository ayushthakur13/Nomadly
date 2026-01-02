import { useMemo } from 'react';

interface LocationData {
  name?: string;
  address?: string;
  point?: {
    type: 'Point';
    coordinates: [number, number];
  };
}

interface StopMarker {
  coordinates: [number, number];
  order: number;
  name?: string;
}

interface UseLocationPreviewLogicReturn {
  state: 'with-coordinates' | 'manual-location' | 'empty';
  mapUrl: string | null;
  coordinates: [number, number] | null;
  overlays: string[];
}

/**
 * Custom hook to handle LocationPreview logic
 * - Determines which state to display (with coords, manual, empty)
 * - Builds Mapbox static map URL with markers
 * - Generates overlays for main destination and stops
 */
export function useLocationPreviewLogic(
  destinationLocation?: LocationData,
  stops?: StopMarker[]
): UseLocationPreviewLogicReturn {
  // Determine state
  const hasCoordinates = !!destinationLocation?.point?.coordinates;
  const hasDestinationName = !!destinationLocation?.name;

  const state: 'with-coordinates' | 'manual-location' | 'empty' = hasCoordinates
    ? 'with-coordinates'
    : hasDestinationName
      ? 'manual-location'
      : 'empty';

  // Build map URL and overlays
  const { mapUrl, coordinates, overlays } = useMemo(() => {
    if (!hasCoordinates || !destinationLocation?.point?.coordinates) {
      return { mapUrl: null, coordinates: null, overlays: [] };
    }

    const [lng, lat] = destinationLocation.point.coordinates;
    const token = import.meta.env.VITE_MAPBOX_TOKEN;

    // Build marker overlays: main destination marker + optional numbered stops
    const markerOverlays: string[] = [];
    markerOverlays.push(`pin-l-d+14b8a6(${lng},${lat})`);

    (stops || [])
      .filter((stop) => Array.isArray(stop.coordinates) && stop.coordinates.length === 2)
      .forEach((stop) => {
        const [sLng, sLat] = stop.coordinates;
        const label = Math.min(99, Math.max(1, stop.order + 1)); // clamp labels to 1-99
        markerOverlays.push(`pin-l-${label}+0f766e(${sLng},${sLat})`);
      });

    const overlayString = markerOverlays.join(',');
    const url = token
      ? `https://api.mapbox.com/styles/v1/mapbox/light-v11/static/${overlayString}/${lng},${lat},9,0,0/600x300@2x?access_token=${token}`
      : null;

    return {
      mapUrl: url,
      coordinates: [lng, lat] as [number, number],
      overlays: markerOverlays,
    };
  }, [destinationLocation, stops, hasCoordinates]);

  return {
    state,
    mapUrl,
    coordinates,
    overlays,
  };
}
