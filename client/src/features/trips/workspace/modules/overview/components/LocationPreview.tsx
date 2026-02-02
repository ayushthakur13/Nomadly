import Icon from '@/ui/icon/Icon';
import { useLocationPreviewLogic } from '../hooks/useLocationPreviewLogic';

interface LocationPreviewProps {
  destinationLocation?: {
    name?: string;
    address?: string;
    point?: {
      type: 'Point';
      coordinates: [number, number];
    };
  };
  sourceLocation?: {
    name?: string;
    point?: {
      type: 'Point';
      coordinates: [number, number];
    };
  };
  stops?: Array<{
    coordinates: [number, number];
    order: number;
    name?: string;
  }>;
  hasDestinations?: boolean;
  onAddStops?: () => void;
  onEditLocation?: () => void;
}

const LocationPreview = ({
  destinationLocation,
  sourceLocation,
  stops,
  hasDestinations,
  onAddStops,
  onEditLocation,
}: LocationPreviewProps) => {
  const { state, mapUrl, coordinates } = useLocationPreviewLogic(destinationLocation, stops);

  // STATE 1: Static Map Available (Ideal)
  if (state === 'with-coordinates' && coordinates) {
    const [lng, lat] = coordinates;

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        {/* Header */}
        <div className="flex items-start gap-3 justify-between mb-4">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            {/* Colored icon container */}
            <div className="p-1.5 rounded-md bg-emerald-50 text-emerald-600 flex-shrink-0 mt-0.5">
              <Icon name="map" />
            </div>
            <div className="flex-1 min-w-0">
              {/* Destination name */}
              <p className="text-lg font-semibold text-gray-900 truncate">
                {destinationLocation?.name || 'Destination'}
              </p>
              {/* Subtext */}
              <p className="text-xs text-gray-500 font-medium mt-1">Where this trip lives</p>
            </div>
          </div>
          {sourceLocation?.name && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded flex-shrink-0">
              Starting from {sourceLocation.name}
            </span>
          )}
        </div>

        {/* Static Map - Calm, non-interactive */}
        <div className="rounded-md overflow-hidden border border-gray-200 bg-gray-100 h-48">
          {mapUrl ? (
            <img
              src={mapUrl}
              alt={`Map of ${destinationLocation?.name}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">Map preview unavailable (token missing)</div>
          )}
        </div>

        {/* Subtle coordinates */}
        <div className="text-xs text-gray-400 mt-3 text-center">
          {lat.toFixed(4)}°, {lng.toFixed(4)}°
        </div>
      </div>
    );
  }


  // STATE 2: Manual Location (No Coordinates)
  if (state === 'manual-location') {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        {/* Header */}
        <div className="flex items-start gap-2 mb-4">
          {/* Location icon - not a map, but a location marker */}
          <div className="p-2 rounded-md bg-amber-50 text-amber-600 flex-shrink-0">
            <Icon name="mapPin" size={20} />
          </div>
          <div className="flex-1 min-w-0">
            {/* Destination name */}
            <p className="text-lg font-semibold text-gray-900">
              {destinationLocation?.name}
            </p>
            <p className="text-xs text-gray-500 font-medium mt-1">Destination</p>
          </div>
        </div>

        {/* Manual Entry Message - No error, no warning, just honest */}
        <div className="rounded-md border border-amber-100 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <Icon name="info" size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-amber-900 font-medium">
                This location was added manually
              </p>
              <p className="text-xs text-amber-700 mt-1">
                Map data isn't available yet. Maps appear automatically when coordinates are available.
              </p>
            </div>
          </div>
        </div>

        {/* Optional soft CTA to search again */}
        {onEditLocation && (
          <button
            type="button"
            onClick={onEditLocation}
            className="mt-4 w-full px-3 py-2 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-md border border-gray-200 transition-colors"
          >
            Search location again
          </button>
        )}
      </div>
    );
  }

  // STATE 3: Empty (Early Trip)
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      {/* Header */}
      <div className="flex items-start gap-2 mb-4">
        <div className="p-1.5 rounded-md bg-gray-50 text-gray-600 flex-shrink-0 mt-0.5">
          <Icon name="map" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-lg font-semibold text-gray-900">Location</p>
          <p className="text-xs text-gray-500 font-medium mt-1">Spatial preview</p>
        </div>
      </div>

      {/* Empty State - Spatial placeholder */}
      <div className="rounded-md border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 h-48 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-gray-400">
          <Icon name="mapPin" size={24} />
          <p className="text-sm font-medium text-gray-500">Your route will appear here</p>
          <p className="text-xs text-gray-400">once locations are added.</p>
        </div>
      </div>

      {/* CTA */}
      {onAddStops && (
        <button
          type="button"
          onClick={onAddStops}
          className="mt-4 w-full px-3 py-2 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md border border-emerald-200 transition-colors"
        >
          Add first stop
        </button>
      )}
    </div>
  );
};

export default LocationPreview;
