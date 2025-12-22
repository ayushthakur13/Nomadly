import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import TripCard from '../../components/trips/TripCard';
import toast from 'react-hot-toast';
import Icon from '../../components/icon/Icon';
import useTripsCache from '../../hooks/useTripsCache';

const MyTrips = () => {
  const navigate = useNavigate();
  const { trips, loading, error } = useSelector((state: any) => state.trips);
  const { user } = useSelector((state: any) => state.auth);

  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState('startDate');
  const [selectedCategory, setSelectedCategory] = useState('');

  const { refreshTrips } = useTripsCache();
  
  useEffect(() => {
    const order = sortBy === 'startDate' ? 'asc' : 'desc';
    refreshTrips({ category: selectedCategory || undefined, sort: sortBy, order });
  }, [sortBy, selectedCategory]);

  // Initialize tab from query param (?tab=all|ongoing|upcoming|past)
  useEffect(() => {
    const tab = (searchParams.get('tab') || 'all').toLowerCase();
    const allowed = ['all','ongoing','upcoming','past'];
    if (allowed.includes(tab)) setActiveTab(tab);
  }, [searchParams]);

  useEffect(() => { if (error) toast.error(error); }, [error]);

  // Category options from backend TripCategory enum
  const categories = [
    { value: 'adventure', label: 'Adventure' },
    { value: 'leisure', label: 'Leisure' },
    { value: 'business', label: 'Business' },
    { value: 'family', label: 'Family' },
    { value: 'solo', label: 'Solo' },
    { value: 'couple', label: 'Couple' },
    { value: 'friends', label: 'Friends' },
    { value: 'backpacking', label: 'Backpacking' },
    { value: 'luxury', label: 'Luxury' },
    { value: 'budget', label: 'Budget' },
  ];

  // Smart sorting for All tab: priority-based (Ongoing > Upcoming > Past)
  const getTripsToDisplay = () => {
    if (activeTab === 'all') {
      const ongoing = trips.ongoing || [];
      const upcoming = trips.upcoming || [];
      const past = trips.past || [];
      return [...ongoing, ...upcoming, ...past];
    }
    return trips[activeTab] || [];
  };
  const displayTrips = getTripsToDisplay();
  const displayName = user?.firstName || user?.name || user?.email || 'Nomad';

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 1. Page Header */}
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

        {/* 2. Filters Row - Status Tabs + Sort */}
        <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200">
          {/* Status Tabs: All > Ongoing > Upcoming > Past */}
          <div className="flex gap-1 overflow-x-auto">
            <button
              onClick={() => { setActiveTab('all'); setSearchParams({ tab: 'all' }, { replace: true }); }}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors rounded-lg ${
                activeTab === 'all'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              All {!loading && `(${trips.all?.length || 0})`}
            </button>
            <button
              onClick={() => { setActiveTab('ongoing'); setSearchParams({ tab: 'ongoing' }, { replace: true }); }}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors rounded-lg ${
                activeTab === 'ongoing'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Ongoing {!loading && `(${trips.ongoing?.length || 0})`}
            </button>
            <button
              onClick={() => { setActiveTab('upcoming'); setSearchParams({ tab: 'upcoming' }, { replace: true }); }}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors rounded-lg ${
                activeTab === 'upcoming'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Upcoming {!loading && `(${trips.upcoming?.length || 0})`}
            </button>
            <button
              onClick={() => { setActiveTab('past'); setSearchParams({ tab: 'past' }, { replace: true }); }}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors rounded-lg ${
                activeTab === 'past'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Past {!loading && `(${trips.past?.length || 0})`}
            </button>
          </div>

          {/* Optional Sort + Category Filters */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Filter</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-sm px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-white text-gray-700"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Sort</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-white text-gray-700"
              >
                <option value="startDate">Start Date</option>
                <option value="createdAt">Date Created</option>
                <option value="tripName">Trip Name</option>
              </select>
            </div>
          </div>
        </div>

        {/* 5. Loading Skeleton State */}
        {loading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 animate-pulse">
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
        )}

        {/* 4. Empty State - Tab-specific messages */}
        {!loading && displayTrips.length === 0 && (() => {
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
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {state.title}
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                {state.message}
              </p>
              {activeTab === 'all' && (
                <button
                  onClick={() => navigate('/trips/new')}
                  className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm shadow-sm"
                >
                  Create your first trip
                </button>
              )}
            </div>
          );
        })()}

        {/* 3. Trips Grid - Responsive 3/2/1 columns */}
        {!loading && displayTrips.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayTrips.map((trip) => (
              <TripCard 
                key={trip._id} 
                trip={trip}
                onClick={() => navigate(`/trips/${trip._id}`)}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default MyTrips;
