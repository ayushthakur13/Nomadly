import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { TripsFilters, TripsGrid } from './components/';
import { useTripsFilters } from './hooks';
import { fetchTrips } from '../store/tripsThunks';

const MyTripsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { error } = useSelector((state: any) => state.trips);

  const {
    activeTab,
    sortBy,
    selectedCategory,
    filteredTrips,
    loading,
    handleTabChange,
    handleCategoryChange,
    handleSortChange,
  } = useTripsFilters();

  // Fetch all trips on mount (no filters - load everything)
  useEffect(() => {
    dispatch<any>(fetchTrips({ sort: 'createdAt', order: 'desc' }));
  }, [dispatch]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  // Compute counts from Redux categorized trips
  const { trips } = useSelector((state: any) => state.trips);
  const counts = {
    all: trips?.all?.length || 0,
    ongoing: trips?.ongoing?.length || 0,
    upcoming: trips?.upcoming?.length || 0,
    past: trips?.past?.length || 0,
  };

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
          trips={filteredTrips}
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
