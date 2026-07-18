import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchSavedTripsAPI, unsaveTripAPI } from "../../../services/explore.service";
import { cloneTripAPI } from "../../../services/trips.service";
import { useAsyncAction } from "../../../hooks/useAsyncAction";
import toast from "react-hot-toast";
import { Icon } from "@/ui";
import defaultTripCardCover from "@/assets/illustrations/default-trip-cover.webp";

interface SavedTrip {
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
  };
}

export default function SavedTripsPage() {
  const [savedTrips, setSavedTrips] = useState<SavedTrip[]>([]);
  const navigate = useNavigate();

  const { execute: loadSavedTrips, isLoading: loading } = useAsyncAction({
    showToast: false,
    errorMessage: "Failed to fetch saved trips"
  });

  const fetchSaved = () => {
    loadSavedTrips(async () => {
      const trips = await fetchSavedTripsAPI();
      setSavedTrips(trips);
    });
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleUnsave = async (e: React.MouseEvent, tripId: string) => {
    e.stopPropagation();
    try {
      await unsaveTripAPI(tripId);
      setSavedTrips(prev => prev.filter(t => t._id !== tripId));
      toast.success("Removed from bookmarks");
    } catch (err: any) {
      toast.error(err.message || "Failed to remove bookmark");
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
      toast.success("Trip cloned successfully!");
      navigate(`/trips/${response.data.trip._id}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to clone trip");
    }
  };

  if (loading && savedTrips.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-bold text-sm">Loading bookmarks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-left">
          <h1 className="text-3xl font-black text-gray-900">Saved Trips</h1>
          <p className="text-gray-500 mt-2 text-sm">
            Access your private bookmarks, saved public itineraries, and travel references here.
          </p>
        </div>

        {savedTrips.length === 0 ? (
          <div className="text-center bg-white rounded-3xl border border-gray-200 py-20 px-6 shadow-sm">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
              🔖
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">Your bookmarks are empty</h3>
            <p className="text-gray-500 max-w-sm mx-auto text-sm leading-normal mb-8">
              Explore itineraries shared by other travelers in the explore feed and save them to build your bookmarks lists.
            </p>
            <button
              onClick={() => navigate("/explore")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/10 transition-all"
            >
              <Icon name="compass" size={16} /> Go to Explore Feed
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {savedTrips.map((trip) => (
              <div
                key={trip._id}
                onClick={() => navigate(`/explore/trips/${trip._id}`)}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:border-emerald-500/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden group flex flex-col h-full text-left"
              >
                <div className="relative h-48 bg-gray-100">
                  <img
                    src={trip.coverImageUrl || defaultTripCardCover}
                    alt={trip.tripName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>

                  {/* Bookmark Button */}
                  <button
                    onClick={(e) => handleUnsave(e, trip._id)}
                    className="absolute top-4 right-4 w-9 h-9 rounded-xl flex items-center justify-center bg-teal-600 text-white shadow-md hover:bg-teal-700 transition-all"
                    title="Remove from bookmarks"
                  >
                    <Icon name="bookmark" size={16} className="text-white" />
                  </button>
                </div>

                <div className="p-5 flex flex-col flex-grow text-left">
                  <h3 className="font-black text-gray-900 text-lg group-hover:text-emerald-600 transition-colors line-clamp-1 mb-2">
                    {trip.tripName}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-4">
                    {trip.description || "Explore this public travel blueprint itinerary."}
                  </p>

                  <div className="mt-auto space-y-2 text-xs text-gray-600 border-t pt-4">
                    <div className="flex items-center gap-2">
                      <Icon name="location" size={14} className="text-emerald-500" />
                      <span className="font-bold line-clamp-1">{trip.destinationLocation?.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="calendar" size={14} className="text-emerald-500" />
                      <span>
                        {new Date(trip.startDate).toLocaleDateString()} -{" "}
                        {new Date(trip.endDate).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-3 mt-1.5 border-t border-gray-100">
                      <span className="text-[10px] text-gray-400 font-medium">
                        By {trip.createdBy?.name || trip.createdBy?.username}
                      </span>
                      <button
                        onClick={(e) => handleClone(e, trip._id, trip.tripName)}
                        className="p-1.5 bg-emerald-50 hover:bg-emerald-600 hover:text-white rounded-lg text-emerald-600 transition-all flex items-center gap-1.5 text-[10px] font-bold"
                        title="Clone itinerary"
                      >
                        <Icon name="copy" size={12} /> Clone
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
