import { useEffect, useMemo, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { Trip } from '@shared/types';
import { useTripsCache } from '@/features/trips/_shared/hooks';
import { TripCard } from '@/ui/common/';
import {
  fetchExploreFeedAPI,
  fetchTripSocialStatusAPI,
  likeTripAPI,
  unlikeTripAPI,
  saveTripAPI,
  unsaveTripAPI
} from '@/services/explore.service';
import { cloneTripAPI } from '@/services/trips.service';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import ExploreGrid from '@/features/explore/components/ExploreGrid';
import toast from 'react-hot-toast';
import { Icon } from '@/ui';

const HomePage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state: any) => state.auth);
  const { trips, refreshTrips } = useTripsCache();
  const { loading } = useSelector((state: any) => state.trips);
  const [activeTab, setActiveTab] = useState<'ongoing' | 'upcoming' | 'past' | null>(null);
  const [hasRequested, setHasRequested] = useState(false);

  // Explore highlights state
  const [exploreTrips, setExploreTrips] = useState<any[]>([]);
  const [socialStatus, setSocialStatus] = useState<Record<string, { liked: boolean; saved: boolean }>>({});

  const { execute: loadExploreFeed, isLoading: loadingExplore } = useAsyncAction({
    showToast: false,
    errorMessage: 'Failed to fetch trending trips',
  });

  useEffect(() => {
    setHasRequested(true);
    refreshTrips({ sort: 'startDate', order: 'asc' });

    // Fetch Explore highlights (limit to 6, sortBy most-liked)
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
  }, [refreshTrips, isAuthenticated]);

  // Initial default selection on first load: prefer ongoing, else upcoming
  useEffect(() => {
    if (!hasRequested) return;
    if (loading) return;
    if (activeTab !== null) return;
    const hasOngoing = (trips.ongoing?.length || 0) > 0;
    const hasUpcoming = (trips.upcoming?.length || 0) > 0;
    setActiveTab(hasOngoing ? 'ongoing' : hasUpcoming ? 'upcoming' : 'upcoming');
  }, [hasRequested, loading, trips.ongoing, trips.upcoming, activeTab]);

  const displayName = user?.name?.trim().split(/\s+/)[0];
  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const counts = {
    upcoming: trips.upcoming?.length || 0,
    ongoing: trips.ongoing?.length || 0,
    past: trips.past?.length || 0,
  };
  const totalTrips = (trips.all?.length || 0);

  const tripsByTab = (tab: 'upcoming' | 'ongoing' | 'past') => trips[tab] || [];
  const currentTrips = activeTab ? tripsByTab(activeTab) : [];

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
    const ongoing = counts.ongoing;
    const upcoming = counts.upcoming;
    const attentionCount = attentionItems.length;
    const parts: string[] = [];
    if (ongoing > 0) parts.push(`${ongoing} ongoing trip${ongoing !== 1 ? 's' : ''}`);
    else if (upcoming > 0) parts.push(`${upcoming} upcoming trip${upcoming !== 1 ? 's' : ''}`);
    if (attentionCount > 0) {
      parts.push(`${attentionCount} thing${attentionCount !== 1 ? 's' : ''} to finish before your next journey`);
    }
    return parts.length > 0 ? `You have ${parts.join(' and ')}.` : 'All caught up! Time to plan your next adventure.';
  }, [totalTrips, counts.ongoing, counts.upcoming, attentionItems.length]);

  // Social Action Handlers (Like/Save/Clone)
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
        const newCount = await unlikeTripAPI(tripId);
        setExploreTrips(prev => prev.map(t => t._id === tripId ? { ...t, likeCount: newCount } : t));
        setSocialStatus(prev => ({
          ...prev,
          [tripId]: { ...currentStatus, liked: false }
        }));
        toast.success('Removed like');
      } else {
        const newCount = await likeTripAPI(tripId);
        setExploreTrips(prev => prev.map(t => t._id === tripId ? { ...t, likeCount: newCount } : t));
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
        toast.success('Removed from bookmarks');
      } else {
        await saveTripAPI(tripId);
        setSocialStatus(prev => ({
          ...prev,
          [tripId]: { ...currentStatus, saved: true }
        }));
        toast.success('Saved to bookmarks!');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to toggle bookmark');
    }
  }, [isAuthenticated, socialStatus, navigate]);

  const handleClone = useCallback(async (e: React.MouseEvent, tripId: string, tripName: string) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please login to clone trips');
      navigate('/auth/login');
      return;
    }
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
  }, [isAuthenticated, navigate]);

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

        {/* 3) Your Trips */}
        <section className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 text-left">Your Trips</h2>
            <div className="flex gap-2 self-start sm:self-auto">
              {(['ongoing', 'upcoming', 'past'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab ? 'bg-emerald-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)} ({tripsByTab(tab).length})
                </button>
              ))}
            </div>
          </div>

          {totalTrips > 0 && !loading && activeTab !== null && currentTrips.length === 0 && (
            <div className="bg-white rounded-xl border border-dashed border-gray-300 p-10 text-center">
              <p className="text-gray-700 font-medium mb-2">No {activeTab} trips</p>
              <p className="text-sm text-gray-500">Try switching tabs or create a new trip.</p>
            </div>
          )}

          {totalTrips === 0 && (
            <div className="bg-white rounded-xl shadow-sm p-10 text-center border border-gray-100">
              <div className="text-6xl mb-4">✈️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Welcome to Nomadly</h3>
              <p className="text-gray-600 mb-6 text-sm">Create your first trip and start planning your adventure.</p>
              <button
                onClick={() => navigate('/trips/new')}
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm shadow-sm"
              >
                Create Your First Trip
              </button>
            </div>
          )}

          {loading && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
                  <div className="h-40 bg-gray-200"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-5 w-2/3 bg-gray-200 rounded"></div>
                    <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                    <div className="h-4 w-full bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {!loading && activeTab !== null && currentTrips.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentTrips.map((trip: Trip) => (
                <TripCard
                  key={trip._id}
                  trip={trip}
                  onClick={() => navigate(`/trips/${trip._id}`)}
                />
              ))}
            </div>
          )}
        </section>

        {/* 4) Needs Your Attention (Remaining Items) */}
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

        {/* Explore Highlights */}
        <section className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 text-left">Trending Itineraries</h2>
            <button
              onClick={() => navigate('/explore')}
              className="text-emerald-700 hover:text-emerald-800 text-sm font-semibold flex items-center gap-1"
            >
              See more <Icon name="arrowRight" size={14} />
            </button>
          </div>

          {loadingExplore && exploreTrips.length === 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl h-72 animate-pulse border border-gray-100"></div>
              ))}
            </div>
          ) : exploreTrips.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-xl border border-gray-100">
              <p className="text-gray-500 text-sm">No trending itineraries found.</p>
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
        </section>
      </div>
    </div>
  );
};

export default HomePage;
