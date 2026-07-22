import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { fetchTripByIdAPI, cloneTripAPI } from "../../services/trips.service";
import { extractApiError, type ApiError } from "../../utils/errorHandling";
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
import TripPreviewHero from "./components/TripPreviewHero";
import {
  OverviewPanel,
  ItineraryPanel,
  StaysPanel,
  MemoriesPanel,
  TasksPanel,
  BudgetPanel
} from "./components/TripPreviewPanels";
import type { Trip, Destination, Accommodation, Memory } from "@shared/types";
import type { RootState } from "../../store";

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

export default function TripPreviewPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<PopulatedTrip | null>(null);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [tasks, setTasks] = useState<PublicTask[]>([]);
  const [budget, setBudget] = useState<PublicBudgetSummary | null>(null);
  const [socialStatus, setSocialStatus] = useState<{ liked: boolean; saved: boolean }>({ liked: false, saved: false });
  const [isCloning, setIsCloning] = useState(false);

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
      setIsCloning(true);
      const response = await cloneTripAPI(tripId, {
        newTripName: `${trip.tripName} (Clone)`,
        includeBudget: true
      });
      toast.success("Trip cloned successfully!");
      navigate(`/trips/${response.data.trip._id}`);
    } catch (err) {
      toast.error(extractApiError(err as ApiError, "Failed to clone trip"));
    } finally {
      setIsCloning(false);
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = el.offsetTop - 130; // Account for sticky main nav + jump nav
      window.scrollTo({
        top: offset,
        behavior: "smooth"
      });
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



  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between [main_&]:-mx-4 sm:[main_&]:-mx-6 lg:[main_&]:-mx-8 [main_&]:-mt-6 [main_&]:-mb-6">
      <div>
        <TripPreviewHero
          trip={trip}
          socialStatus={socialStatus}
          durationDays={durationDays}
          handleLike={handleLike}
          handleSave={handleSave}
          handleClone={handleClone}
          isCloning={isCloning}
          handleShare={() => {
            navigator.clipboard.writeText(window.location.href);
            toast.success("Link copied to clipboard!");
          }}
          onAuthorClick={() => navigate(`/profile/${trip.createdBy.username}`)}
          destinations={destinations}
          accommodations={accommodations}
          tasks={tasks}
          budget={budget}
          memories={memories}
          onSectionClick={scrollToSection}
        />

        {/* Vertical Sections List */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">

          <section id="destinations" className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm scroll-mt-24">
            <ItineraryPanel destinations={destinations} />
          </section>

          <section id="stays" className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm scroll-mt-24">
            <StaysPanel accommodations={accommodations} />
          </section>

          <section id="budget" className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm scroll-mt-24">
            <BudgetPanel budget={budget} />
          </section>

          <section id="tasks" className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm scroll-mt-24">
            <TasksPanel tasks={tasks} />
          </section>

          {trip.memoriesPublic && (
            <section id="memories" className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm scroll-mt-24">
              <MemoriesPanel trip={trip} memories={memories} />
            </section>
          )}

        </div>
      </div>
      {!isAuthenticated && <Footer />}
    </div>
  );
}
