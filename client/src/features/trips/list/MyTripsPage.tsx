import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import TripsFilters from './components/TripsFilters';
import TripsGrid from './components/TripsGrid';
import { useTripsFilters } from './hooks';

const MyTripsPage = () => {
  const navigate = useNavigate();
  const { trips, loading, error } = useSelector((state: any) => state.trips);

  const {
    activeTab,
    sortBy,
    selectedCategory,
    handleTabChange,
    handleCategoryChange,
    handleSortChange,
  } = useTripsFilters();

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const ongoingTrips = trips?.ongoing || [];
  const upcomingTrips = trips?.upcoming || [];
  const pastTrips = trips?.past || [];
  const allTrips = trips?.all || [...ongoingTrips, ...upcomingTrips, ...pastTrips];

  const counts = {
    all: allTrips.length,
    ongoing: ongoingTrips.length,
    upcoming: upcomingTrips.length,
    past: pastTrips.length,
  };

  const displayTrips = (() => {
    if (activeTab === 'ongoing') return ongoingTrips;
    if (activeTab === 'upcoming') return upcomingTrips;
    if (activeTab === 'past') return pastTrips;
    return allTrips;
  })();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
              My Trips
            </h1>
            <p className="text-sm text-gray-500">
              Manage and revisit all your journeys in one place.
            </p>
          </div>
        </div>

        <TripsFilters
          activeTab={activeTab}
          sortBy={sortBy}
          selectedCategory={selectedCategory}
          onTabChange={handleTabChange}
          onCategoryChange={handleCategoryChange}
          onSortChange={handleSortChange}
          counts={counts}
        />

        <TripsGrid
          trips={displayTrips}
          loading={loading}
          activeTab={activeTab}
          onCreateClick={() => navigate('/trips/new')}
          onTripClick={(id) => navigate(`/trips/${id}`)}
        />
      </div>
    </div>
  );
};

export default MyTripsPage;
