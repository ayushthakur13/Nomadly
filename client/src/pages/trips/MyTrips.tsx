import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import TripCard from '../../components/trips/TripCard';
import toast from 'react-hot-toast';
import useTripsCache from '../../hooks/useTripsCache';

const MyTrips = () => {
  const navigate = useNavigate();
  const { trips, loading, error } = useSelector((state: any) => state.trips);
  const { user } = useSelector((state: any) => state.auth);

  const [activeTab, setActiveTab] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const { refreshTrips } = useTripsCache();
  
  useEffect(() => {
    refreshTrips({ category: selectedCategory || undefined, sort: sortBy, order: sortOrder });
  }, [selectedCategory, sortBy, sortOrder]);

  useEffect(() => { if (error) toast.error(error); }, [error]);

  const categories = [
    { value: 'adventure', label: '🗻 Adventure' },
    { value: 'leisure', label: '🏖️ Leisure' },
    { value: 'business', label: '💼 Business' },
    { value: 'family', label: '👨‍👩‍👧‍👦 Family' },
    { value: 'solo', label: '🧳 Solo' },
    { value: 'couple', label: '💑 Couple' },
    { value: 'friends', label: '👯 Friends' },
    { value: 'backpacking', label: '🎒 Backpacking' },
    { value: 'luxury', label: '✨ Luxury' },
    { value: 'budget', label: '💰 Budget' },
  ];

  const getTripsToDisplay = () => { if (activeTab === 'all') return trips.all || []; return trips[activeTab] || []; };
  const displayTrips = getTripsToDisplay();
  const displayName = user?.firstName || user?.name || user?.email || 'Nomad';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            My Trips
          </h1>
          <p className="text-gray-600">
            Welcome back, {displayName}! Plan, organize, and track all your adventures.
          </p>
        </div>

        {/* Filters and Sort */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="createdAt">Date Created</option>
                <option value="startDate">Start Date</option>
                <option value="tripName">Name</option>
              </select>
            </div>

            {/* Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order
              </label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeTab === 'all'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              All Trips ({trips.all?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('ongoing')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeTab === 'ongoing'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Ongoing ({trips.ongoing?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeTab === 'upcoming'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Upcoming ({trips.upcoming?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeTab === 'past'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Past ({trips.past?.length || 0})
            </button>
          </div>

          <button
            onClick={() => navigate('/trips/new')}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium whitespace-nowrap flex items-center gap-2"
          >
            <span className="text-lg">+</span>
            <span className="hidden sm:inline">Create Trip</span>
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && displayTrips.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">✈️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No trips yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start planning your next adventure by creating your first trip!
            </p>
            <button
              onClick={() => navigate('/trips/new')}
              className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
            >
              Create Your First Trip
            </button>
          </div>
        )}

        {/* Trips Grid */}
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

      <Footer />
    </div>
  );
};

export default MyTrips;
