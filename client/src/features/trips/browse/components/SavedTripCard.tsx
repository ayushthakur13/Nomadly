import defaultTripCardCover from "@/assets/illustrations/default-trip-cover.webp";
import { Icon } from "@/ui";
import { formatDateRange } from "@/utils/formatDateRange";

interface SavedTripCardProps {
  trip: {
    _id: string;
    tripName: string;
    description?: string;
    startDate: string;
    endDate: string;
    destinationLocation?: { name: string };
    coverImageUrl?: string;
    category?: string;
    createdBy: {
      username: string;
      name?: string;
    };
  };
  onUnsave: (e: React.MouseEvent, tripId: string) => void;
  onClone: (e: React.MouseEvent, tripId: string, tripName: string) => void;
  onClick: () => void;
  isCloning?: boolean;
}

const CATEGORY_EMOJI: Record<string, string> = {
  adventure: "🗻",
  leisure: "🏖️",
  business: "💼",
  family: "👨‍👩‍👧‍👦",
  solo: "🧳",
  couple: "💑",
  friends: "👯",
  backpacking: "🎒",
  luxury: "✨",
  budget: "💰",
};

export default function SavedTripCard({ trip, onUnsave, onClone, onClick, isCloning = false }: SavedTripCardProps) {
  const getTripDuration = () => {
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const duration = getTripDuration();

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group relative border border-gray-100 hover:border-emerald-200 hover:-translate-y-1 text-left flex flex-col h-full"
    >
      {/* Cover Image */}
      <div className="relative h-48 w-full overflow-hidden bg-gray-100 flex-shrink-0">
        <img
          src={trip.coverImageUrl || defaultTripCardCover}
          alt={trip.tripName}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
          onError={(e: any) => {
            e.currentTarget.src = defaultTripCardCover;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300"></div>

        {/* Bookmark Button (Unsave) */}
        <button
          type="button"
          onClick={(e) => onUnsave(e, trip._id)}
          className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center bg-teal-600 hover:bg-teal-700 text-white shadow-md hover:scale-110 transition-all duration-200"
          title="Remove from bookmarks"
        >
          <Icon name="bookmark" size={16} className="text-white" />
        </button>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow text-left">
        <div className="mb-3 flex items-start justify-between gap-3">
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-600 transition-colors duration-200 line-clamp-1 flex-1">
            {trip.tripName}
          </h3>
          {trip.category && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full flex-shrink-0">
              <span>{CATEGORY_EMOJI[trip.category.toLowerCase()] ?? ""}</span>
              {trip.category.charAt(0).toUpperCase() + trip.category.slice(1)}
            </span>
          )}
        </div>

        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-4">
          {trip.description || "Explore this public travel blueprint itinerary."}
        </p>

        <div className="mt-auto space-y-2.5 text-xs text-gray-600 border-t border-gray-100 pt-4">
          <div className="flex items-center gap-2">
            <Icon name="location" size={14} className="text-emerald-500" />
            <span className="font-semibold line-clamp-1">
              {trip.destinationLocation?.name || "Multiple Places"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="calendar" size={14} className="text-emerald-500" />
            <span>
              {formatDateRange(trip.startDate, trip.endDate)} • {duration} day{duration !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-gray-100">
            <span className="text-[10px] text-gray-400 font-medium truncate max-w-[120px]">
              By {trip.createdBy?.name || trip.createdBy?.username}
            </span>
            <button
              onClick={(e) => onClone(e, trip._id, trip.tripName)}
              disabled={isCloning}
              className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-600 hover:text-white disabled:opacity-60 disabled:cursor-not-allowed rounded-lg text-emerald-600 transition-all flex items-center gap-1 text-[10px] font-bold"
              title="Clone itinerary"
            >
              {isCloning ? (
                <>
                  <div className="w-3 h-3 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                  <span>Cloning...</span>
                </>
              ) : (
                <>
                  <Icon name="copy" size={12} /> Clone
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
