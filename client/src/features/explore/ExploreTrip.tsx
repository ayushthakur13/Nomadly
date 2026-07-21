import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { fetchTripByIdAPI, cloneTripAPI } from "../../services/trips.service";
import { fetchDestinations } from "../../services/destinations.service";
import { fetchAccommodations } from "../../services/accommodations.service";
import { fetchMemories } from "../../services/memories.service";
import { fetchPublicTasks } from "../../services/tasks.service";
import { fetchPublicBudgetSummary } from "../../services/budget.service";
import {
  likeTripAPI,
  unlikeTripAPI,
  saveTripAPI,
  unsaveTripAPI,
  fetchTripSocialStatusAPI
} from "../../services/explore.service";
import { useAsyncAction } from "../../hooks/useAsyncAction";
import Footer from "../../ui/common/Footer";
import toast from "react-hot-toast";
import { Icon } from "@/ui";
import ExploreTripHero from "./components/ExploreTripHero";
import {
  OverviewPanel,
  ItineraryPanel,
  StaysPanel,
  MemoriesPanel,
  TasksPanel,
  BudgetPanel
} from "./components/ExploreTripPanels";
import type { Trip, Destination, Accommodation, Memory } from "@shared/types";
import type { RootState } from "../../store";

export type TabId = "overview" | "destinations" | "stays" | "memories" | "tasks" | "budget";

export interface PublicTask {
  _id: string;
  title: string;
  description?: string;
  dueDate?: string;
  isCompleted: boolean;
}

export interface PublicBudgetSummary {
  totalPlanned: number;
  totalSpent: number;
  baseCurrency: string;
  categoryBreakdown: { category: string; amount: number }[];
}

export interface PopulatedTrip extends Omit<Trip, "createdBy"> {
  createdBy: {
    _id: string;
    username: string;
    name?: string;
    profilePicUrl?: string | null;
  };
}

export default function ExploreTrip() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<PopulatedTrip | null>(null);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [tasks, setTasks] = useState<PublicTask[]>([]);
  const [budget, setBudget] = useState<PublicBudgetSummary | null>(null);
  const [socialStatus, setSocialStatus] = useState<{ liked: boolean; saved: boolean }>({ liked: false, saved: false });
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const { execute: loadTripDetails, isLoading: loading, error } = useAsyncAction({
    showToast: false,
    errorMessage: "Failed to fetch trip details"
  });

  useEffect(() => {
    if (!tripId) return;

    loadTripDetails(async () => {
      // 1. Fetch Trip details
      const tripData = await fetchTripByIdAPI(tripId);
      setTrip(tripData as any as PopulatedTrip);

      // 2. Fetch Destinations (public)
      try {
        const dest = await fetchDestinations(tripId);
        setDestinations(dest);
      } catch (err) {
        console.warn("Failed to fetch destinations", err);
      }

      // 3. Fetch Accommodations (public)
      try {
        const stays = await fetchAccommodations(tripId);
        setAccommodations(stays);
      } catch (err) {
        console.warn("Failed to fetch accommodations", err);
      }

      // 4. Fetch Memories (public if trip.memoriesPublic is true)
      try {
        const memo = await fetchMemories(tripId);
        setMemories(memo);
      } catch (err) {
        setMemories([]);
      }

      // 5. Fetch Public Tasks
      try {
        const t = await fetchPublicTasks(tripId);
        setTasks(t);
      } catch (err) {
        console.warn("Failed to fetch public tasks", err);
      }

      // 6. Fetch Public Budget Summary
      try {
        const b = await fetchPublicBudgetSummary(tripId);
        setBudget(b);
      } catch (err) {
        console.warn("Failed to fetch public budget", err);
      }

      // 7. Fetch social status if authenticated
      if (isAuthenticated) {
        try {
          const status = await fetchTripSocialStatusAPI(tripId);
          setSocialStatus(status);
        } catch (err) {
          console.error("Failed to fetch social status", err);
        }
      }
    });
  }, [tripId, isAuthenticated, loadTripDetails]);

  const handleLike = async () => {
    if (!tripId) return;
    if (!isAuthenticated) {
      toast.error("Please login to like trips");
      navigate("/auth/login");
      return;
    }

    try {
      if (socialStatus.liked) {
        const newCount = await unlikeTripAPI(tripId);
        setTrip((prev: PopulatedTrip | null) => prev ? { ...prev, likeCount: newCount } : null);
        setSocialStatus(prev => ({ ...prev, liked: false }));
        toast.success("Removed like");
      } else {
        const newCount = await likeTripAPI(tripId);
        setTrip((prev: PopulatedTrip | null) => prev ? { ...prev, likeCount: newCount } : null);
        setSocialStatus(prev => ({ ...prev, liked: true }));
        toast.success("Trip liked!");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to toggle like");
    }
  };

  const handleSave = async () => {
    if (!tripId) return;
    if (!isAuthenticated) {
      toast.error("Please login to save trips");
      navigate("/auth/login");
      return;
    }

    try {
      if (socialStatus.saved) {
        await unsaveTripAPI(tripId);
        setSocialStatus(prev => ({ ...prev, saved: false }));
        toast.success("Removed from bookmarks");
      } else {
        await saveTripAPI(tripId);
        setSocialStatus(prev => ({ ...prev, saved: true }));
        toast.success("Saved to bookmarks!");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to toggle bookmark");
    }
  };

  const handleClone = async () => {
    if (!tripId || !trip) return;
    if (!isAuthenticated) {
      toast.error("Please login to clone trips");
      navigate("/auth/login");
      return;
    }

    try {
      const response = await cloneTripAPI(tripId, {
        newTripName: `${trip.tripName} (Clone)`,
        includeBudget: true
      });
      toast.success("Trip cloned successfully!");
      navigate(`/trips/${response.data.trip._id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to clone trip");
    }
  };

  if (loading || !trip) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-bold">Loading trip itinerary...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 p-8 shadow-sm text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Failed to load trip</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/explore")}
            className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-md"
          >
            Back to Explore
          </button>
        </div>
      </div>
    );
  }

  const durationDays = Math.ceil(
    (new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24)
  ) || 1;

  const tabs: { id: TabId; label: string; icon: string }[] = [
    { id: "overview", label: "Overview", icon: "fileText" },
    { id: "destinations", label: `Destinations (${destinations.length})`, icon: "mapPin" },
    { id: "stays", label: `Stays (${accommodations.length})`, icon: "bed" },
    { id: "budget", label: "Budget", icon: "dollarSign" },
    { id: "tasks", label: `Tasks (${tasks.length})`, icon: "tasks" },
    ...(trip.memoriesPublic ? [{ id: "memories" as TabId, label: `Memories (${memories.length})`, icon: "image" }] : [])
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between [main_&]:-mx-4 sm:[main_&]:-mx-6 lg:[main_&]:-mx-8 [main_&]:-mt-6 [main_&]:-mb-6">
      <div>
        <ExploreTripHero
          trip={trip}
          socialStatus={socialStatus}
          durationDays={durationDays}
          handleLike={handleLike}
          handleSave={handleSave}
          handleClone={handleClone}
          handleShare={() => {
            navigator.clipboard.writeText(window.location.href);
            toast.success("Link copied to clipboard!");
          }}
          onAuthorClick={() => navigate(`/profile/${trip.createdBy.username}`)}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex border-b border-gray-200 overflow-x-auto no-scrollbar gap-6 mb-8">
            {tabs.map(tab => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 pb-4 text-sm font-bold border-b-2 whitespace-nowrap transition-all duration-300 focus:outline-none ${active
                      ? "border-emerald-600 text-emerald-600"
                      : "border-transparent text-gray-500 hover:text-gray-800"
                    }`}
                >
                  <Icon name={tab.icon} size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
            {activeTab === "overview" && (
              <OverviewPanel
                trip={trip}
                destinations={destinations}
                accommodations={accommodations}
                memories={memories}
              />
            )}
            {activeTab === "destinations" && <ItineraryPanel destinations={destinations} />}
            {activeTab === "stays" && <StaysPanel accommodations={accommodations} />}
            {activeTab === "memories" && <MemoriesPanel trip={trip} memories={memories} />}
            {activeTab === "tasks" && <TasksPanel tasks={tasks} />}
            {activeTab === "budget" && <BudgetPanel budget={budget} />}
          </div>
        </div>
      </div>
      {!isAuthenticated && <Footer />}
    </div>
  );
}
