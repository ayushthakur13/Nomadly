import { useMemo } from 'react';

export interface LocationPoint {
  name?: string;
  address?: string;
  point?: {
    type: 'Point';
    coordinates: [number, number];
  };
}

export interface StopPoint {
  coordinates?: [number, number];
  order?: number;
  name?: string;
  location?: {
    point?: {
      coordinates: [number, number];
    };
  };
}

export interface UseMapboxStaticOptions {
  sourceLocation?: LocationPoint | null;
  destinationLocation?: LocationPoint | null;
  stops?: StopPoint[] | null;
}

export interface UseMapboxStaticReturn {
  state: 'with-coordinates' | 'manual-location' | 'empty';
  mapUrl: string | null;
  coordinates: [number, number] | null;
  overlays: string[];
}

/**
 * Custom hook to generate a Mapbox static map URL with origin ('s'), intermediate stops (1..99), and destination ('d') pins.
 */
export function useMapboxStatic({
  sourceLocation,
  destinationLocation,
  stops,
}: UseMapboxStaticOptions): UseMapboxStaticReturn {
  const hasCoordinates = !!destinationLocation?.point?.coordinates;
  const hasDestinationName = !!destinationLocation?.name;

  const state: 'with-coordinates' | 'manual-location' | 'empty' = hasCoordinates
    ? 'with-coordinates'
    : hasDestinationName
      ? 'manual-location'
      : 'empty';

  const { mapUrl, coordinates, overlays } = useMemo(() => {
    if (!hasCoordinates || !destinationLocation?.point?.coordinates) {
      return { mapUrl: null, coordinates: null, overlays: [] };
    }

    const [destLng, destLat] = destinationLocation.point.coordinates;
    const token = import.meta.env.VITE_MAPBOX_TOKEN;

    const markerOverlays: string[] = [];

    // 1. Add Start Location marker (label 's', gray)
    if (sourceLocation?.point?.coordinates) {
      const [srcLng, srcLat] = sourceLocation.point.coordinates;
      markerOverlays.push(`pin-l-s+6b7280(${srcLng},${srcLat})`);
    }

    // 2. Add Intermediate Stop markers (numbered 1..99, teal)
    if (stops && stops.length > 0) {
      stops.forEach((stop, idx) => {
        const coords = stop.coordinates || stop.location?.point?.coordinates;
        if (Array.isArray(coords) && coords.length === 2) {
          const [sLng, sLat] = coords;
          const orderNum = typeof stop.order === 'number' ? stop.order + 1 : idx + 1;
          const label = Math.min(99, Math.max(1, orderNum));
          markerOverlays.push(`pin-l-${label}+0f766e(${sLng},${sLat})`);
        }
      });
    }

    // 3. Add Destination Location marker (label 'd', emerald)
    markerOverlays.push(`pin-l-d+10b981(${destLng},${destLat})`);

    const overlayString = markerOverlays.join(',');
    const url = token
      ? `https://api.mapbox.com/styles/v1/mapbox/light-v11/static/${overlayString}/${destLng},${destLat},9,0,0/600x300@2x?access_token=${token}`
      : null;

    return {
      mapUrl: url,
      coordinates: [destLng, destLat] as [number, number],
      overlays: markerOverlays,
    };
  }, [sourceLocation, destinationLocation, stops, hasCoordinates]);

  return {
    state,
    mapUrl,
    coordinates,
    overlays,
  };
}
