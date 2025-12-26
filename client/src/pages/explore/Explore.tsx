import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import Footer from '../../components/common/Footer';
import toast from 'react-hot-toast';

const Explore = () => {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('');
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state: any) => state.auth);

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

  useEffect(() => {
    const fetchPublicTrips = async () => {
      try {
        setLoading(true);
        setError(null);
        const params = new URLSearchParams();
        if (activeCategory) params.append('category', activeCategory);
        const response = await api.get(`/trips/public?${params.toString()}`);
        setTrips(response.data.trips);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to fetch public trips');
        toast.error(err.response?.data?.error || 'Failed to fetch public trips');
      } finally {
        setLoading(false);
      }
    };
    fetchPublicTrips();
  }, [activeCategory]);

  const handleTripClick = (tripId: string) => { navigate(`/explore/trips/${tripId}`); };

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Explore Amazing Trips
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Discover and get inspired by amazing trips shared by our community of travelers.
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setActiveCategory('')}
              className={`px-4 py-2 rounded-full font-medium transition-colors ${
                activeCategory === ''
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setActiveCategory(category.value)}
                className={`px-4 py-2 rounded-full font-medium transition-colors ${
                  activeCategory === category.value
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-20">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => setActiveCategory('')}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && trips.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🌎</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No trips found
            </h3>
            <p className="text-gray-600">
              {activeCategory 
                ? `No trips found in ${activeCategory} category. Try another category!`
                : 'No public trips available at the moment. Check back later!'}
            </p>
          </div>
        )}

        {/* Trips Grid */}
        {!loading && !error && trips.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <div
                key={trip._id}
                onClick={() => handleTripClick(trip._id)}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden cursor-pointer group"
              >
                <div className="relative h-48">
                  <img
                    src={trip.imageUrl || '/images/default-trip.jpg'}
                    alt={trip.tripName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3">
                    <span className="bg-white/90 backdrop-blur-sm text-gray-700 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      <i className="fas fa-globe text-emerald-600"></i>
                      Public
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {trip.tripName}
                  </h3>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600 text-sm">
                      <i className="fas fa-map-marker-alt w-5 text-emerald-600"></i>
                      <span className="ml-2">{trip.destinationLocation?.name || trip.mainDestination || '—'}</span>
                    </div>

                    <div className="flex items-center text-gray-600 text-sm">
                      <i className="fas fa-calendar w-5 text-emerald-600"></i>
                      <span className="ml-2">
                        {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center text-gray-600 text-sm">
                      <i className="fas fa-user w-5 text-emerald-600"></i>
                      <span className="ml-2">
                        By {trip.createdBy.name || trip.createdBy.username}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                      {trip.category}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {!isAuthenticated && <Footer />}
    </div>
  );
};

export default Explore;
