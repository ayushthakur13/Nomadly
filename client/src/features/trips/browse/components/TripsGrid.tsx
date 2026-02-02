import { TripCard } from '@/ui/common/';
import { Icon } from '@/ui/icon/';

interface TripsGridProps {
  trips: any[];
  loading: boolean;
  activeTab: string;
  onCreateClick: () => void;
  onTripClick: (tripId: string) => void;
}

const TripsGrid = ({ trips, loading, activeTab, onCreateClick, onTripClick }: TripsGridProps) => {
  if (loading) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 animate-pulse"
          >
            <div className="h-48 bg-gray-200"></div>
            <div className="p-4 space-y-3">
              <div className="h-5 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="flex gap-2">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (trips.length === 0) {
    const emptyStates: Record<string, { title: string; message: string }> = {
      all: { title: 'No trips yet', message: 'Start planning your first journey with Nomadly.' },
      ongoing: { title: 'No active trips', message: 'Ready to start one?' },
      upcoming: { title: 'Nothing planned yet', message: 'Time to plan your next adventure.' },
      past: { title: 'No completed trips', message: 'Your memories will live here.' },
    };
    const state = emptyStates[activeTab] || emptyStates.all;
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center max-w-md mx-auto">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="bookmark" size={32} className="text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{state.title}</h3>
        <p className="text-sm text-gray-500 mb-6">{state.message}</p>
        {activeTab === 'all' && (
          <button
            onClick={onCreateClick}
            className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm shadow-sm"
          >
            Create your first trip
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {trips.map((trip) => (
        <TripCard key={trip._id} trip={trip} onClick={() => onTripClick(trip._id)} />
      ))}
    </div>
  );
};

export default TripsGrid;
