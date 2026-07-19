import { useState, useEffect, useCallback } from "react";
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
import { useAsyncAction } from "../../hooks/useAsyncAction";
import Footer from "../../ui/common/Footer";
import toast from "react-hot-toast";
import { Icon } from "@/ui";
import ExploreHero from "./components/ExploreHero";
import ExploreFilters from "./components/ExploreFilters";
import ExploreGrid from "./components/ExploreGrid";

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
  const [sortBy, setSortBy] = useState<"recent" | "most-liked">("recent");
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [socialStatus, setSocialStatus] = useState<Record<string, { liked: boolean; saved: boolean }>>({});

  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state: any) => state.auth);

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
    try {
      if (currentStatus.liked) {
        const newCount = await unlikeTripAPI(tripId);
        setTrips(prev => prev.map(t => t._id === tripId ? { ...t, likeCount: newCount } : t));
        setSocialStatus(prev => ({
          ...prev,
          [tripId]: { ...currentStatus, liked: false }
        }));
        toast.success("Removed like");
      } else {
        const newCount = await likeTripAPI(tripId);
        setTrips(prev => prev.map(t => t._id === tripId ? { ...t, likeCount: newCount } : t));
        setSocialStatus(prev => ({
          ...prev,
          [tripId]: { ...currentStatus, liked: true }
        }));
        toast.success("Trip liked!");
      }
    } catch (err: any) {
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

    const confirmClone = window.confirm(`Do you want to clone the trip "${tripName}"?`);
    if (!confirmClone) return;

    try {
      const response = await cloneTripAPI(tripId, {
        newTripName: `${tripName} (Clone)`,
        includeBudget: true
      });
      toast.success("Trip cloned successfully!");
      navigate(`/trips/${response.data.trip._id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to clone trip");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-emerald-50/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ExploreHero searchDestination={searchDestination} setSearchDestination={setSearchDestination} />

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
          <div className="text-center bg-white rounded-xl border border-gray-200 p-16 shadow-sm">
            <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl">
              🗺️
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No itineraries found</h3>
            <p className="text-gray-600 max-w-md mx-auto mb-8">
              We couldn't find any public trips matching your filters. Try selecting another category or typing a different search query.
            </p>
            <button
              onClick={() => {
                setActiveCategory("");
                setSearchDestination("");
              }}
              className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
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
            onCardClick={(id) => navigate(`/explore/trips/${id}`)}
            onCreatorClick={(e, username) => {
              e.stopPropagation();
              navigate(`/profile/${username}`);
            }}
          />
        )}

        {nextCursor && !loading && (
          <div className="text-center mt-12">
            <button
              onClick={handleLoadMore}
              className="inline-flex items-center gap-2 px-8 py-3 bg-white text-gray-800 border border-gray-200 rounded-xl font-bold shadow-sm hover:bg-gray-50 hover:shadow-md transition-all duration-300"
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
