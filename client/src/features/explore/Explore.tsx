import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  fetchExploreFeedAPI,
  likeTripAPI,
  unlikeTripAPI,
  saveTripAPI,
  unsaveTripAPI,
  fetchTripSocialStatusAPI
} from "../../services/explore.service";
import { cloneTripAPI } from "../../services/trips.service";
import { extractApiError, type ApiError } from "../../utils/errorHandling";
import { useAsyncAction } from "../../hooks/useAsyncAction";
import Footer from "../../ui/common/Footer";
import toast from "react-hot-toast";
import { Icon } from "@/ui";
import { ExploreHero, ExploreFilters, ExploreGrid } from "./components";
import { debounce } from "../../utils/debounce";

interface Trip {
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

export default function Explore() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [searchDestination, setSearchDestination] = useState<string>("");
  const [searchInput, setSearchInput] = useState<string>("");
  const [sortBy, setSortBy] = useState<"recent" | "most-liked">("recent");
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [socialStatus, setSocialStatus] = useState<Record<string, { liked: boolean; saved: boolean }>>({});
  const [cloningTripId, setCloningTripId] = useState<string | null>(null);

  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state: any) => state.auth);

  const tripsSnapshotRef = useRef<Trip[]>([]);
  const socialStatusSnapshotRef = useRef<Record<string, { liked: boolean; saved: boolean }>>({});

  const debouncedSetDestination = useMemo(
    () => debounce((val: string) => setSearchDestination(val), 400),
    []
  );

  const handleSearchChange = useCallback(
    (val: string) => {
      setSearchInput(val);
      debouncedSetDestination(val);
    },
    [debouncedSetDestination]
  );

  const { execute: fetchTrips, isLoading: loading } = useAsyncAction({
    showToast: false,
    errorMessage: "Failed to fetch public trips"
  });

  const loadTrips = useCallback((cursor: string | null = null, append = false) => {
    fetchTrips(async () => {
      const data = await fetchExploreFeedAPI({
        limit: 12,
        sortBy,
        category: activeCategory || undefined,
        destination: searchDestination || undefined,
        nextCursor: cursor || undefined
      });

      const fetchedTrips = data.trips;
      const pagination = data.pagination;

      if (append) {
        setTrips(prev => [...prev, ...fetchedTrips]);
      } else {
        setTrips(fetchedTrips);
      }
      setNextCursor(pagination.nextCursor);

      // Fetch social status for loaded trips if authenticated
      if (isAuthenticated && fetchedTrips.length > 0) {
        fetchedTrips.forEach(async (trip: Trip) => {
          try {
            const status = await fetchTripSocialStatusAPI(trip._id);
            setSocialStatus(prev => ({
              ...prev,
              [trip._id]: status
            }));
          } catch (err) {
            console.error("Failed to fetch social status for trip:", trip._id, err);
          }
        });
      }
    });
  }, [fetchTrips, sortBy, activeCategory, searchDestination, isAuthenticated]);

  useEffect(() => {
    loadTrips(null, false);
  }, [loadTrips]);

  const handleLoadMore = () => {
    if (nextCursor) {
      loadTrips(nextCursor, true);
    }
  };

  const handleLike = async (e: React.MouseEvent, tripId: string) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error("Please login to like trips");
      navigate("/auth/login");
      return;
    }

    const currentStatus = socialStatus[tripId] || { liked: false, saved: false };
    const willLike = !currentStatus.liked;

    // Snapshot current state for rollback
    tripsSnapshotRef.current = trips;
    socialStatusSnapshotRef.current = socialStatus;

    // Optimistic Update
    setSocialStatus(prev => ({
      ...prev,
      [tripId]: { ...currentStatus, liked: willLike }
    }));
    setTrips(prev =>
      prev.map(t =>
        t._id === tripId
          ? {
              ...t,
              likeCount: willLike
                ? (t.likeCount || 0) + 1
                : Math.max(0, (t.likeCount || 0) - 1),
            }
          : t
      )
    );

    try {
      let newCount: number;
      if (currentStatus.liked) {
        newCount = await unlikeTripAPI(tripId);
        toast.success("Removed like");
      } else {
        newCount = await likeTripAPI(tripId);
        toast.success("Trip liked!");
      }
      // Reconcile likes count with backend response
      setTrips(prev => prev.map(t => t._id === tripId ? { ...t, likeCount: newCount } : t));
    } catch (err: any) {
      // Rollback to saved snapshots on failure
      setTrips(tripsSnapshotRef.current);
      setSocialStatus(socialStatusSnapshotRef.current);
      toast.error(err.message || "Failed to toggle like");
    }
  };

  const handleSave = async (e: React.MouseEvent, tripId: string) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error("Please login to save trips");
      navigate("/auth/login");
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
        toast.success("Removed from bookmarks");
      } else {
        await saveTripAPI(tripId);
        setSocialStatus(prev => ({
          ...prev,
          [tripId]: { ...currentStatus, saved: true }
        }));
        toast.success("Saved to bookmarks!");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to toggle bookmark");
    }
  };

  const handleClone = async (e: React.MouseEvent, tripId: string, tripName: string) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error("Please login to clone trips");
      navigate("/auth/login");
      return;
    }



    try {
      setCloningTripId(tripId);
      const response = await cloneTripAPI(tripId, {
        newTripName: `${tripName} (Clone)`,
        includeBudget: true
      });
      toast.success("Trip cloned successfully!");
      navigate(`/trips/${response.data.trip._id}`);
    } catch (err) {
      toast.error(extractApiError(err as ApiError, "Failed to clone trip"));
    } finally {
      setCloningTripId(null);
    }
  };

  const getEmptyMessage = () => {
    if (searchDestination && activeCategory) {
      return `We couldn't find any public itineraries in category "${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}" matching "${searchDestination}".`;
    }
    if (searchDestination) {
      return `We couldn't find any public itineraries matching "${searchDestination}".`;
    }
    if (activeCategory) {
      return `We couldn't find any public itineraries in the "${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}" category.`;
    }
    return "We couldn't find any public itineraries right now.";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className={`max-w-7xl mx-auto ${isAuthenticated ? "px-0" : "px-4"} sm:px-6 lg:px-8 py-6 sm:py-10 md:py-12`}>
        <ExploreHero searchDestination={searchInput} setSearchDestination={handleSearchChange} />

        <ExploreFilters
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />

        {loading && trips.length === 0 && (
          <div className="flex justify-center items-center py-24">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-emerald-200"></div>
              <div className="absolute inset-0 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin"></div>
            </div>
          </div>
        )}

        {!loading && trips.length === 0 && (
          <div className="text-center bg-white rounded-2xl border border-gray-200 p-16 shadow-sm">
            <div className="w-16 h-16 bg-emerald-50 rounded-xl flex items-center justify-center mx-auto mb-6 text-emerald-600">
              <Icon name="compass" size={28} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No itineraries found</h3>
            <p className="text-gray-600 max-w-md mx-auto mb-8 text-sm leading-relaxed">
              {getEmptyMessage()} Try resetting the filters or modifying your search query to explore other journeys.
            </p>
            <button
              onClick={() => {
                setActiveCategory("");
                setSearchInput("");
                setSearchDestination("");
              }}
              className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
            >
              Reset All Filters
            </button>
          </div>
        )}

        {trips.length > 0 && (
          <ExploreGrid
            trips={trips}
            socialStatus={socialStatus}
            handleLike={handleLike}
            handleSave={handleSave}
            handleClone={handleClone}
            cloningTripId={cloningTripId}
            onCardClick={(id) => navigate(`/explore/trips/${id}`)}
            onCreatorClick={(e, username) => {
              e.stopPropagation();
              navigate(`/user/${username}`);
            }}
          />
        )}

        {nextCursor && !loading && (
          <div className="text-center mt-12">
            <button
              onClick={handleLoadMore}
              className="inline-flex items-center gap-2 px-8 py-3 bg-white text-gray-800 border border-gray-200 rounded-2xl font-bold shadow-sm hover:bg-gray-50 hover:shadow-md transition-all duration-300"
            >
              Load More Itineraries
              <Icon name="arrowRight" size={16} />
            </button>
          </div>
        )}

        {loading && trips.length > 0 && (
          <div className="text-center py-8">
            <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        )}
      </div>

      {!isAuthenticated && <Footer />}
    </div>
  );
}
