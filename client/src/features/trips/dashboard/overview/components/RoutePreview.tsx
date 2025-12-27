import Icon from '@/components/icon/Icon';

interface RoutePreviewProps {
  sourceLocation?: string;
  destinationName?: string;
  onAddStops?: () => void;
}

const RoutePreview = ({ sourceLocation, destinationName, onAddStops }: RoutePreviewProps) => {
  const hasSource = !!sourceLocation && sourceLocation !== destinationName; // Only treat as source if different from destination
  const hasDestination = !!destinationName;

  // Format route text: "Source → Destination" only if source is different and exists
  const routeText = hasSource ? `${sourceLocation} → ${destinationName}` : destinationName || '—';
  
  // Conditional subtext
  const subtextLabel = hasSource ? 'Your route' : 'Primary destination';

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      {/* Header with destination route and CTA */}
      <div className="flex items-start gap-3 justify-between">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          {/* Map icon - colored (teal/green accent) */}
          <div className="p-1.5 rounded-md bg-teal-50 text-teal-600 flex-shrink-0 mt-0.5">
            <Icon name="map" />
          </div>
          <div className="flex-1 min-w-0">
            {/* Route text: stronger hierarchy */}
            <p className="text-lg font-semibold text-gray-900 truncate">
              {routeText}
            </p>
            {/* Conditional subtext */}
            <p className="text-xs text-gray-500 font-medium mt-1">{subtextLabel}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onAddStops}
          className="text-xs font-medium text-emerald-700 hover:text-emerald-800 flex items-center gap-1 ml-2 flex-shrink-0"
        >
          Add stops <Icon name="arrowRight" size={14} />
        </button>
      </div>

      {/* Map placeholder with reassuring text */}
      <div className="rounded-md border border-gray-100 bg-gradient-to-br from-gray-50 to-gray-100 h-40 flex items-center justify-center mt-4">
        <div className="flex flex-col items-center gap-2 text-gray-500">
          <Icon name="mapPin" size={24} className="text-gray-400" />
          <span className="text-sm">Route will appear here</span>
        </div>
      </div>
    </div>
  );
};

export default RoutePreview;
