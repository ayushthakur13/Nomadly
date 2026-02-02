import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { Trip } from '@shared/types';
import { useTripsCache } from '@/features/trips/_shared/hooks';
import { TripCard } from '@/ui/common/';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: any) => state.auth);
  const { trips, refreshTrips } = useTripsCache();
  const { loading } = useSelector((state: any) => state.trips);
  const [activeTab, setActiveTab] = useState<'ongoing' | 'upcoming' | 'past' | null>(null);
  const [hasRequested, setHasRequested] = useState(false);

  useEffect(() => {
    setHasRequested(true);
    refreshTrips({ sort: 'startDate', order: 'asc' });
  }, []);
  // Initial default selection on first load: prefer ongoing, else upcoming
  useEffect(() => {
    if (!hasRequested) return; // wait until we actually requested data
    if (loading) return; // wait for first fetch to complete
    if (activeTab !== null) return; // don't override user choice
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
    saved: 0,
  };
  const totalTrips = (trips.all?.length || 0);

  const statCards = [
    { key: 'upcoming', label: 'Upcoming Trips', value: counts.upcoming, color: 'text-blue-600', bg: 'bg-blue-50' },
    { key: 'ongoing', label: 'Ongoing Trips', value: counts.ongoing, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { key: 'past', label: 'Completed Trips', value: counts.past, color: 'text-gray-700', bg: 'bg-gray-100' },
    { key: 'saved', label: 'Saved Trips', value: counts.saved, color: 'text-purple-600', bg: 'bg-purple-50' },
  ] as const;

  const tripsByTab = (tab: 'upcoming' | 'ongoing' | 'past') => trips[tab] || [];
  const currentTrips = activeTab ? tripsByTab(activeTab) : [];

  // Attention items: trips starting within 7 days with severity
  const attentionItems = useMemo(() => {
    const now = new Date();
    const soon = new Date(); soon.setDate(soon.getDate() + 7);
    const upcomingSoon = (trips.upcoming || []).filter((t: Trip) => {
      const s = new Date(t.startDate);
      return s >= now && s <= soon;
    }).slice(0, 5);
    return upcomingSoon.map((t: Trip) => {
      const diffDays = Math.ceil((new Date(t.startDate).getTime() - now.getTime()) / (1000*60*60*24));
      const severity = diffDays <= 3 ? 'urgent' : 'suggestion';
      return {
        type: 'startsSoon',
        text: `Trip '${t.tripName}' starts in ${diffDays} day${diffDays !== 1 ? 's' : ''}`,
        severity,
        tripId: t._id,
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 1) Page Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{greeting}, {displayName} 🙏🏻</h1>
              <p className="text-gray-600 mt-1">{contextualSubtext}</p>
            </div>
          </div>
        </div>

        {/* 2) Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 animate-pulse">
                  <div className="h-6 w-12 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                </div>
              ))
            : statCards.map((c) => (
                <button
                  key={c.key}
                  onClick={() => navigate(`/trips?tab=${c.key === 'saved' ? 'all' : c.key}`)}
                  className="bg-white rounded-xl shadow-sm p-5 text-left hover:shadow-md transition-shadow border border-gray-100"
                >
                  <div className={`text-2xl font-bold ${c.color}`}>{c.value}</div>
                  <div className="text-sm text-gray-600 mt-1">{c.label}</div>
                </button>
              ))}
        </div>

        {/* 3) Your Trips */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Your Trips</h2>
            <div className="flex gap-2">
              {(['ongoing','upcoming','past'] as const).map((tab) => (
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

          {/* Empty state inside section when user has trips but none in tab */}
          {totalTrips > 0 && !loading && activeTab !== null && currentTrips.length === 0 && (
            <div className="bg-white rounded-xl border border-dashed border-gray-300 p-10 text-center">
              <p className="text-gray-700 font-medium mb-2">No {activeTab} trips</p>
              <p className="text-sm text-gray-500">Try switching tabs or create a new trip.</p>
            </div>
          )}

          {/* Full empty state when brand new user */}
          {totalTrips === 0 && (
            <div className="bg-white rounded-xl shadow-sm p-10 text-center">
              <div className="text-6xl mb-4">✈️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Welcome to Nomadly</h3>
              <p className="text-gray-600 mb-6">Create your first trip and start planning your adventure.</p>
              <button
                onClick={() => navigate('/trips/new')}
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
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
                />)
              )}
            </div>
          )}
        </section>

        {/* 4) Needs Your Attention */}
        {loading && (
          <section className="mb-10">
            <div className="h-6 w-40 bg-gray-200 rounded mb-4 animate-pulse"></div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y animate-pulse">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="px-5 py-4">
                  <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </section>
        )}
        {!loading && attentionItems.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Needs Your Attention</h2>
            </div>
            <div className="bg-white rounded-xl shadow-sm divide-y border border-gray-100">
              {attentionItems.map((i, idx) => (
                <div key={idx} className="px-5 py-4 flex items-center justify-between gap-3">
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

        {/* Planning Suggestions (alive, actionable) */}
        {!loading && totalTrips > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Planning Suggestions</h2>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              {(trips.all || []).slice(0, 6).map((t: any, idx: number) => {
                const suggestions: Array<{text: string; action: string; handler: () => void}> = [];
                if (!t.coverImageUrl) suggestions.push({
                  text: `Add a cover image to '${t.tripName}'`,
                  action: '+ Add',
                  handler: () => navigate(`/trips/${t._id}`)
                });
                if (!t.description) suggestions.push({
                  text: `Add a brief description to '${t.tripName}'`,
                  action: '+ Add',
                  handler: () => navigate(`/trips/${t._id}`)
                });
                if (!t.category) suggestions.push({
                  text: `Pick a category for '${t.tripName}'`,
                  action: 'Set Now',
                  handler: () => navigate(`/trips/${t._id}`)
                });
                const budget = t.budgetSummary || { total: 0, spent: 0 };
                if (!budget.total) suggestions.push({
                  text: `Set a budget for '${t.tripName}'`,
                  action: 'Set Now',
                  handler: () => navigate(`/trips/${t._id}`)
                });
                if (!t.isPublic) suggestions.push({
                  text: `Publish '${t.tripName}' to share with friends`,
                  action: 'Publish',
                  handler: () => navigate(`/trips/${t._id}`)
                });
                if (t.tasksCount > 0) suggestions.push({
                  text: `Review ${t.tasksCount} task${t.tasksCount !== 1 ? 's' : ''} for '${t.tripName}'`,
                  action: 'Review',
                  handler: () => navigate(`/trips/${t._id}`)
                });
                const items = suggestions.slice(0, 2);
                if (items.length === 0) return null;
                return (
                  <div key={idx} className="px-5 py-4 border-t first:border-t-0 space-y-2">
                    {items.map((s, i) => (
                      <div key={i} className="flex items-center justify-between gap-3">
                        <p className="text-sm text-gray-800 flex items-center gap-2 flex-1 min-w-0">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0"></span>
                          <span className="truncate">{s.text}</span>
                        </p>
                        <button
                          onClick={s.handler}
                          className="px-3 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors whitespace-nowrap"
                        >
                          {s.action}
                        </button>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 5) Get Inspired */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Get Inspired</h2>
            <button
              onClick={() => navigate('/explore')}
              className="text-emerald-700 hover:text-emerald-800 text-sm font-medium"
            >
              Explore more trips →
            </button>
          </div>
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
                  <div className="h-28 bg-gray-200"></div>
                  <div className="p-4 space-y-2">
                    <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
                    <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="h-28 bg-gradient-to-r from-emerald-50 to-blue-50"></div>
                  <div className="p-4">
                    <p className="text-sm text-gray-700 font-medium">Inspiration #{i}</p>
                    <p className="text-xs text-gray-500">Discover curated itineraries and destinations</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
