import { useEffect, useMemo, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { Trip } from '@shared/types';
import { useTripsCache } from '@/features/trips/_shared/hooks';
import { TripsFilters, TripsGrid, SavedTripCard } from '@/features/trips/browse/components';
import { useTripsFilters } from '@/features/trips/browse/hooks';
import { fetchTrips } from '@/features/trips/store/tripsThunks';
import {
  fetchExploreFeedAPI,
  fetchTripSocialStatusAPI,
  likeTripAPI,
  unlikeTripAPI,
  saveTripAPI,
  unsaveTripAPI,
  fetchSavedTripsAPI
} from '@/services/explore.service';
import { cloneTripAPI } from '@/services/trips.service';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import ExploreGrid from '@/features/explore/components/ExploreGrid';
import toast from 'react-hot-toast';
import { Icon } from '@/ui';
import { RootState, AppDispatch } from '@/store';
import { extractApiError, type ApiError } from '@/utils/errorHandling';

/**
 * Represents a populated public trip model returned by the explore feed and saved trips APIs.
 * Unlike the core database Trip model (which references createdBy as a plain string ID),
 * the explore service populates createdBy into a detailed object for UI cards and avatars.
 */
interface ExploreTrip {
  _id: string;
  tripName: string;
  description?: string;
  startDate: string;
  endDate: string;
  destinationLocation?: { name: string };
  coverImageUrl?: string;
  category?: string;
  likeCount?: number;
  createdBy: {
    username: string;
    name?: string;
    profilePicUrl?: string | null;
  };
}

const HomePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { trips } = useTripsCache();
  const { loading } = useSelector((state: RootState) => state.trips);

  const {
    activeTab,
    sortBy,
    selectedCategory,
    filteredTrips,
    loading: loadingFilters,
    handleTabChange,
    handleCategoryChange,
    handleSortChange,
  } = useTripsFilters();

  // Local state for saved trips
  const [savedTrips, setSavedTrips] = useState<ExploreTrip[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);

  // Local state for zero-trips curated explore feed
  const [exploreTrips, setExploreTrips] = useState<ExploreTrip[]>([]);
  const [socialStatus, setSocialStatus] = useState<Record<string, { liked: boolean; saved: boolean }>>({});

  const { execute: loadExploreFeed, isLoading: loadingExplore } = useAsyncAction({
    showToast: false,
    errorMessage: 'Failed to fetch trending trips',
  });

  // Fetch normal trips on mount
  useEffect(() => {
    dispatch(fetchTrips({ sort: 'createdAt', order: 'desc' }));
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
          toast.error(extractApiError(err as ApiError, 'Failed to fetch saved trips'));
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

        if (data.trips.length > 0) {
          data.trips.forEach(async (t: ExploreTrip) => {
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
  }, [loading, totalTrips]);

  const displayName = user?.name?.trim().split(/\s+/)[0] || user?.username || user?.email?.split('@')[0] || 'Traveler';
  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Attention items: trips starting within 7 days with severity, SORTED BY URGENCY
  const attentionItems = useMemo(() => {
    const now = new Date();
    const soon = new Date(); soon.setDate(soon.getDate() + 7);
    
    const upcomingSoon = (trips.upcoming || [])
      .filter((t: Trip) => {
        const s = new Date(t.startDate);
        return s >= now && s <= soon;
      })
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .slice(0, 5);

    return upcomingSoon.map((t: Trip) => {
      const diffDays = Math.ceil((new Date(t.startDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const severity = diffDays <= 3 ? 'urgent' : 'suggestion';
      return {
        type: 'startsSoon',
        text: `Trip '${t.tripName}' starts in ${diffDays} day${diffDays !== 1 ? 's' : ''}`,
        severity,
        tripId: t._id,
        tripName: t.tripName,
        actionLabel: 'View Trip'
      };
    });
  }, [trips.upcoming]);

  // Contextual subtext for header
  const contextualSubtext = useMemo(() => {
    if (totalTrips === 0) return 'Start planning your first adventure.';
    const ongoing = trips?.ongoing?.length || 0;
    const upcoming = trips?.upcoming?.length || 0;
    const attentionCount = attentionItems.length;
    const parts: string[] = [];
    if (ongoing > 0) parts.push(`${ongoing} ongoing trip${ongoing !== 1 ? 's' : ''}`);
    else if (upcoming > 0) parts.push(`${upcoming} upcoming trip${upcoming !== 1 ? 's' : ''}`);
    if (attentionCount > 0) {
      parts.push(`${attentionCount} thing${attentionCount !== 1 ? 's' : ''} to finish before your next journey`);
    }
    return parts.length > 0 ? `You have ${parts.join(' and ')}.` : 'All caught up! Time to plan your next adventure.';
  }, [totalTrips, trips.ongoing, trips.upcoming, attentionItems.length]);

  // Bookmarks/saved trips handlers
  const handleUnsave = async (e: React.MouseEvent, tripId: string) => {
    e.stopPropagation();
    try {
      await unsaveTripAPI(tripId);
      setSavedTrips(prev => prev.filter(t => t._id !== tripId));
      toast.success('Removed from bookmarks');
    } catch (err) {
      toast.error(extractApiError(err as ApiError, 'Failed to remove bookmark'));
    }
  };

  const handleClone = async (e: React.MouseEvent, tripId: string, tripName: string) => {
    e.stopPropagation();


    try {
      const response = await cloneTripAPI(tripId, {
        newTripName: `${tripName} (Clone)`,
        includeBudget: true
      });
      toast.success('Trip cloned successfully!');
      navigate(`/trips/${response.data.trip._id}`);
    } catch (err) {
      toast.error(extractApiError(err as ApiError, 'Failed to clone trip'));
    }
  };

  // Social feed handlers (for the zero-trips empty state curated feed)
  const handleLike = useCallback(async (e: React.MouseEvent, tripId: string) => {
    e.stopPropagation();
    const currentStatus = socialStatus[tripId] || { liked: false, saved: false };
    try {
      if (currentStatus.liked) {
        const count = await unlikeTripAPI(tripId);
        setExploreTrips(prev => prev.map(t => t._id === tripId ? { ...t, likeCount: count } : t));
        setSocialStatus(prev => ({
          ...prev,
          [tripId]: { ...currentStatus, liked: false }
        }));
        toast.success('Removed like');
      } else {
        const count = await likeTripAPI(tripId);
        setExploreTrips(prev => prev.map(t => t._id === tripId ? { ...t, likeCount: count } : t));
        setSocialStatus(prev => ({
          ...prev,
          [tripId]: { ...currentStatus, liked: true }
        }));
        toast.success('Trip liked!');
      }
    } catch (err) {
      toast.error(extractApiError(err as ApiError, 'Failed to toggle like'));
    }
  }, [socialStatus]);

  const handleSave = useCallback(async (e: React.MouseEvent, tripId: string) => {
    e.stopPropagation();
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
        const data = await fetchSavedTripsAPI();
        setSavedTrips(data);
        toast.success('Saved to bookmarks!');
      }
    } catch (err) {
      toast.error(extractApiError(err as ApiError, 'Failed to toggle bookmark'));
    }
  }, [socialStatus]);

  // Tab Empty States Parity Custom Component
  const renderTabEmptyState = () => {
    const configs: Record<string, { icon: string; title: string; desc: string; btnText: string; action: () => void }> = {
      upcoming: {
        icon: "calendar",
        title: "Nothing coming up",
        desc: "Plan your next big adventure and keep all your itineraries organized.",
        btnText: "Plan your next trip?",
        action: () => navigate("/trips/new"),
      },
      ongoing: {
        icon: "plane",
        title: "No active trips",
        desc: "Ready to start one of your plans? Set the dates and get going!",
        btnText: "Create a Trip",
        action: () => navigate("/trips/new"),
      },
      past: {
        icon: "clock",
        title: "No completed trips",
        desc: "Revisit your past travel memories and itineraries here later.",
        btnText: "Plan a Trip",
        action: () => navigate("/trips/new"),
      },
      saved: {
        icon: "bookmark",
        title: "Your bookmarks are empty",
        desc: "Explore public itineraries shared by other travelers in the community feed and save them.",
        btnText: "Explore Feed",
        action: () => navigate("/explore"),
      },
      all: {
        icon: "plane",
        title: "No trips found",
        desc: "You don't have any trips matching the selected filters.",
        btnText: "Create a Trip",
        action: () => navigate("/trips/new"),
      },
    };

    const config = configs[activeTab as string] || configs.all;

    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center max-w-md mx-auto my-6 text-left">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
          <Icon name={config.icon} size={32} className="text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">{config.title}</h3>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed text-center">{config.desc}</p>
        <div className="flex justify-center">
          <button
            onClick={config.action}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium text-sm shadow-sm inline-flex items-center gap-2"
          >
            <Icon name={config.icon === "bookmark" ? "compass" : "add"} size={16} />
            {config.btnText}
          </button>
        </div>
      </div>
    );
  };

  const counts = {
    all: trips?.all?.length || 0,
    ongoing: trips?.ongoing?.length || 0,
    upcoming: trips?.upcoming?.length || 0,
    past: trips?.past?.length || 0,
    saved: savedTrips.length,
  };

  // Hero Item / CTA (Most Urgent)
  const heroCTAItem = attentionItems[0];
  const secondaryAttentionItems = attentionItems.slice(1);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 1) Page Header */}
        <div className="mb-8 text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{greeting}, {displayName} 🙏🏻</h1>
          <p className="text-gray-600 mt-1 text-sm">{contextualSubtext}</p>
        </div>

        {totalTrips === 0 ? (
          /* True Zero Trips State */
          <div className="space-y-12">
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

            {/* Curated highlights fallback */}
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
        ) : (
          /* User has trips */
          <>
            {/* 2) Promoted Hero CTA (Resume Module) */}
            {!loading && heroCTAItem && (
              <div className="bg-white border border-emerald-100 rounded-xl p-6 shadow-sm mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4 text-left">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-2xl flex-shrink-0">
                    🏃‍♂️
                  </div>
                  <div className="text-left">
                    <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-700 uppercase tracking-wide">
                      Starts Soon
                    </span>
                    <h2 className="text-lg font-bold text-gray-900 mt-1">
                      Continue planning: <span className="text-emerald-600">{heroCTAItem.tripName}</span>
                    </h2>
                    <p className="text-sm text-gray-500 mt-0.5">{heroCTAItem.text}</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/trips/${heroCTAItem.tripId}`)}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-sm transition-colors shadow-sm self-start sm:self-auto"
                >
                  Open Workspace
                </button>
              </div>
            )}

            {/* 3) Needs Your Attention (Remaining Items) */}
            {!loading && secondaryAttentionItems.length > 0 && (
              <section className="mb-10">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 text-left">Needs Your Attention</h2>
                <div className="bg-white rounded-xl shadow-sm divide-y border border-gray-100">
                  {secondaryAttentionItems.map((i, idx) => (
                    <div key={idx} className="px-5 py-4 flex items-center justify-between gap-3 text-left">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          i.severity === 'urgent' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {i.severity === 'urgent' ? 'Urgent' : 'Suggestion'}
                        </span>
                        <p className="text-sm text-gray-800 truncate">{i.text}</p>
                      </div>
                      <button
                        onClick={() => navigate(`/trips/${i.tripId}`)}
                        className="px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors whitespace-nowrap"
                      >
                        {i.actionLabel}
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 4) Trips Tab Section */}
            <section className="mt-8">
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
                filteredTrips.length === 0 ? (
                  renderTabEmptyState()
                ) : (
                  <TripsGrid
                    trips={filteredTrips}
                    loading={loading || loadingFilters}
                    activeTab={activeTab}
                    onCreateClick={() => navigate('/trips/new')}
                    onTripClick={(id) => navigate(`/trips/${id}`)}
                  />
                )
              ) : loadingSaved && savedTrips.length === 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-xl h-72 border border-gray-100 animate-pulse"></div>
                  ))}
                </div>
              ) : savedTrips.length === 0 ? (
                renderTabEmptyState()
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
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default HomePage;
