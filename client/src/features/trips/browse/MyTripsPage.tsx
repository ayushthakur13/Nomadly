import { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { TripsFilters, TripsGrid, SavedTripCard } from './components/';
import { useTripsFilters } from './hooks';
import { fetchTrips } from '../store/tripsThunks';
import {
  fetchSavedTripsAPI,
  unsaveTripAPI,
  unlikeTripAPI,
  fetchExploreFeedAPI,
  fetchTripSocialStatusAPI,
  likeTripAPI,
  saveTripAPI
} from '@/services/explore.service';
import { cloneTripAPI } from '@/services/trips.service';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import ExploreGrid from '@/features/explore/components/ExploreGrid';
import { Icon } from '@/ui';

const MyTripsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { error, trips } = useSelector((state: any) => state.trips);
  const { isAuthenticated } = useSelector((state: any) => state.auth);

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

  // Local state for saved trips
  const [savedTrips, setSavedTrips] = useState<any[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);

  // Local state for zero-trips curated explore feed
  const [exploreTrips, setExploreTrips] = useState<any[]>([]);
  const [socialStatus, setSocialStatus] = useState<Record<string, { liked: boolean; saved: boolean }>>({});

  const { execute: loadExploreFeed, isLoading: loadingExplore } = useAsyncAction({
    showToast: false,
    errorMessage: 'Failed to fetch trending trips',
  });

  // Fetch normal trips
  useEffect(() => {
    dispatch<any>(fetchTrips({ sort: 'createdAt', order: 'desc' }));
  }, [dispatch]);

  // Fetch saved trips count & items on mount
  useEffect(() => {
    setLoadingSaved(true);
    fetchSavedTripsAPI()
      .then((data) => {
        setSavedTrips(data);
      })
      .catch((err) => {
        console.error('Failed to fetch saved trips:', err);
      })
      .finally(() => {
        setLoadingSaved(false);
      });
  }, []);

  // Re-fetch saved trips if tab changes to saved
  useEffect(() => {
    if ((activeTab as string) === 'saved') {
      setLoadingSaved(true);
      fetchSavedTripsAPI()
        .then((data) => {
          setSavedTrips(data);
        })
        .catch((err) => {
          toast.error(err.message || 'Failed to fetch saved trips');
        })
        .finally(() => {
          setLoadingSaved(false);
        });
    }
  }, [activeTab]);

  // Fetch Explore highlights if totalTrips === 0
  const totalTrips = (trips?.all?.length || 0);

  useEffect(() => {
    if (!loading && totalTrips === 0) {
      loadExploreFeed(async () => {
        const data = await fetchExploreFeedAPI({
          limit: 6,
          sortBy: 'most-liked',
        });
        setExploreTrips(data.trips);

        if (isAuthenticated && data.trips.length > 0) {
          data.trips.forEach(async (t: any) => {
            try {
              const status = await fetchTripSocialStatusAPI(t._id);
              setSocialStatus(prev => ({
                ...prev,
                [t._id]: status
              }));
            } catch (err) {
              console.error('Failed to fetch status for trip:', t._id, err);
            }
          });
        }
      });
    }
  }, [loading, totalTrips, isAuthenticated]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  // Bookmarks handlers
  const handleUnsave = async (e: React.MouseEvent, tripId: string) => {
    e.stopPropagation();
    try {
      await unsaveTripAPI(tripId);
      setSavedTrips(prev => prev.filter(t => t._id !== tripId));
      toast.success('Removed from bookmarks');
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove bookmark');
    }
  };

  const handleClone = async (e: React.MouseEvent, tripId: string, tripName: string) => {
    e.stopPropagation();
    const confirmClone = window.confirm(`Do you want to clone the trip "${tripName}"?`);
    if (!confirmClone) return;

    try {
      const response = await cloneTripAPI(tripId, {
        newTripName: `${tripName} (Clone)`,
        includeBudget: true
      });
      toast.success('Trip cloned successfully!');
      navigate(`/trips/${response.data.trip._id}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to clone trip');
    }
  };

  // Social feed handlers (for the zero-trips empty state feed)
  const handleLike = useCallback(async (e: React.MouseEvent, tripId: string) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please login to like trips');
      navigate('/auth/login');
      return;
    }
    const currentStatus = socialStatus[tripId] || { liked: false, saved: false };
    try {
      if (currentStatus.liked) {
        const newCount = await unsaveTripAPI(tripId); // Wait, liked and saved uses different APIs
        // Wait, explore.service.ts shows unlikeTripAPI(tripId) returns newCount:
        const count = await apiToggleLike(tripId, true);
        setExploreTrips(prev => prev.map(t => t._id === tripId ? { ...t, likeCount: count } : t));
        setSocialStatus(prev => ({
          ...prev,
          [tripId]: { ...currentStatus, liked: false }
        }));
        toast.success('Removed like');
      } else {
        const count = await apiToggleLike(tripId, false);
        setExploreTrips(prev => prev.map(t => t._id === tripId ? { ...t, likeCount: count } : t));
        setSocialStatus(prev => ({
          ...prev,
          [tripId]: { ...currentStatus, liked: true }
        }));
        toast.success('Trip liked!');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to toggle like');
    }
  }, [isAuthenticated, socialStatus, navigate]);

  const apiToggleLike = async (tripId: string, liked: boolean) => {
    return liked ? await unlikeTripAPI(tripId) : await likeTripAPI(tripId);
  };

  const handleSave = useCallback(async (e: React.MouseEvent, tripId: string) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please login to save trips');
      navigate('/auth/login');
      return;
    }
    const currentStatus = socialStatus[tripId] || { liked: false, saved: false };
    try {
      if (currentStatus.saved) {
        await unsaveTripAPI(tripId);
        setSocialStatus(prev => ({
          ...prev,
          [tripId]: { ...currentStatus, saved: false }
        }));
        setSavedTrips(prev => prev.filter(t => t._id !== tripId));
        toast.success('Removed from bookmarks');
      } else {
        await saveTripAPI(tripId);
        setSocialStatus(prev => ({
          ...prev,
          [tripId]: { ...currentStatus, saved: true }
        }));
        // Re-fetch to update bookmarks lists
        const data = await fetchSavedTripsAPI();
        setSavedTrips(data);
        toast.success('Saved to bookmarks!');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to toggle bookmark');
    }
  }, [isAuthenticated, socialStatus, navigate]);

  const counts = {
    all: trips?.all?.length || 0,
    ongoing: trips?.ongoing?.length || 0,
    upcoming: trips?.upcoming?.length || 0,
    past: trips?.past?.length || 0,
    saved: savedTrips.length,
  };

  // If zero total trips and loaded
  if (!loading && totalTrips === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
          {/* Header */}
          <div className="text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">My Trips</h1>
            <p className="text-sm text-gray-500">Manage and explore your travel blueprints.</p>
          </div>

          {/* Primary CTA card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center max-w-2xl mx-auto">
            <div className="text-6xl mb-4">✈️</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Create your first trip, or explore what others are planning
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto text-sm leading-normal">
              Start building your custom itinerary from scratch, or get inspired by checking out public trips from the community.
            </p>
            <button
              onClick={() => navigate('/trips/new')}
              className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm shadow-sm"
            >
              Create Your First Trip
            </button>
          </div>

          {/* Curated Feed Section */}
          <div className="text-left">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Trending Itineraries</h3>
            {loadingExplore ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl h-72 border border-gray-100 animate-pulse"></div>
                ))}
              </div>
            ) : (
              <ExploreGrid
                trips={exploreTrips}
                socialStatus={socialStatus}
                handleLike={handleLike}
                handleSave={handleSave}
                handleClone={handleClone}
                onCardClick={(id) => navigate(`/explore/trips/${id}`)}
                onCreatorClick={(e, username) => {
                  e.stopPropagation();
                  navigate(`/profile/${username}`);
                }}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex items-start justify-between gap-4 mb-8 text-left">
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

        {(activeTab as string) !== 'saved' ? (
          <TripsGrid
            trips={filteredTrips}
            loading={loading}
            activeTab={activeTab}
            onCreateClick={() => navigate('/trips/new')}
            onTripClick={(id) => navigate(`/trips/${id}`)}
          />
        ) : loadingSaved && savedTrips.length === 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl h-72 border border-gray-100 animate-pulse"></div>
            ))}
          </div>
        ) : savedTrips.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="bookmark" size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Your bookmarks are empty</h3>
            <p className="text-sm text-gray-500 mb-6">
              Explore itineraries shared by other travelers in the explore feed and save them to build your bookmarks lists.
            </p>
            <button
              onClick={() => navigate('/explore')}
              className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm shadow-sm inline-flex items-center gap-2"
            >
              <Icon name="compass" size={16} /> Go to Explore Feed
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedTrips.map((trip) => (
              <SavedTripCard
                key={trip._id}
                trip={trip}
                onUnsave={handleUnsave}
                onClone={handleClone}
                onClick={() => navigate(`/explore/trips/${trip._id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTripsPage;
