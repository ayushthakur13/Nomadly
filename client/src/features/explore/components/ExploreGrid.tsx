import { Icon } from "@/ui";
import defaultTripCardCover from "@/assets/illustrations/default-trip-cover.webp";
import { formatDateRange } from "@/utils/formatDateRange";

const CATEGORY_ICONS: Record<string, string> = {
  adventure: "compass",
  leisure: "coffee",
  business: "briefcase",
  family: "smile",
  solo: "user",
  couple: "users2",
  friends: "users",
  backpacking: "backpack",
  luxury: "gem",
  budget: "wallet"
};

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

interface ExploreGridProps {
  trips: Trip[];
  socialStatus: Record<string, { liked: boolean; saved: boolean }>;
  handleLike: (e: React.MouseEvent, tripId: string) => void;
  handleSave: (e: React.MouseEvent, tripId: string) => void;
  handleClone: (e: React.MouseEvent, tripId: string, tripName: string) => void;
  onCardClick: (tripId: string) => void;
  onCreatorClick: (e: React.MouseEvent, username: string) => void;
}

export default function ExploreGrid({
  trips,
  socialStatus,
  handleLike,
  handleSave,
  handleClone,
  onCardClick,
  onCreatorClick,
}: ExploreGridProps) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
      {trips.map((trip) => {
        const liked = socialStatus[trip._id]?.liked || false;
        const saved = socialStatus[trip._id]?.saved || false;

        return (
          <div
            key={trip._id}
            onClick={() => onCardClick(trip._id)}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-emerald-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden group flex flex-col h-full text-left"
          >
            {/* Card Cover Image - taller proportion (h-64) */}
            <div className="relative h-64 overflow-hidden bg-gray-100 flex-shrink-0">
              <img
                src={trip.coverImageUrl || defaultTripCardCover}
                alt={trip.tripName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

              {/* Standardized Overlay Category Tag */}
              {trip.category && (
                <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold uppercase shadow-sm border backdrop-blur-sm bg-white/90 text-gray-800 border-white/50">
                  <Icon
                    name={(CATEGORY_ICONS[trip.category.toLowerCase()] || "globe") as any}
                    size={12}
                    className="text-gray-600 flex-shrink-0"
                  />
                  {trip.category}
                </span>
              )}

              {/* Circular Action Buttons */}
              <button
                onClick={(e) => handleSave(e, trip._id)}
                className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-md hover:scale-110 duration-200 ${saved
                    ? "bg-teal-600 text-white border-teal-600"
                    : "bg-white/80 backdrop-blur-sm text-gray-700 border border-white/20 hover:bg-white"
                  }`}
                aria-label={saved ? "Unsave trip from bookmarks" : "Save trip to bookmarks"}
              >
                <Icon name="bookmark" size={16} className={saved ? "text-white" : "text-gray-700"} />
              </button>
            </div>

            {/* Card Content */}
            <div className="p-6 flex flex-col flex-grow">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-600 transition-colors line-clamp-1 mb-1">
                {trip.tripName}
              </h3>
              {/* One-line description/hook beneath the title */}
              <p className="text-gray-500 text-xs line-clamp-1 mb-4 leading-relaxed">
                {trip.description || "Explore this public travel blueprint itinerary."}
              </p>

              {/* Metadata Items */}
              <div className="space-y-2 mb-6 text-sm text-gray-600">
                <div className="flex items-center gap-2.5">
                  <Icon name="location" size={16} className="text-emerald-500" />
                  <span className="font-semibold line-clamp-1 text-xs">
                    {trip.destinationLocation?.name || "Multiple Places"}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Icon name="calendar" size={16} className="text-emerald-500" />
                  <span className="text-xs">
                    {formatDateRange(trip.startDate, trip.endDate)}
                  </span>
                </div>
              </div>

              <div className="mt-auto border-t border-gray-100 pt-4 flex items-center justify-between gap-2">
                {/* Creator Profile Link */}
                <div
                  onClick={(e) => onCreatorClick(e, trip.createdBy.username)}
                  className="flex items-center gap-2.5 group/creator min-w-0"
                >
                  {trip.createdBy.profilePicUrl ? (
                    <img
                      src={trip.createdBy.profilePicUrl}
                      alt={trip.createdBy.username}
                      className="w-8 h-8 rounded-full object-cover border border-emerald-500/20 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-700 flex-shrink-0">
                      {trip.createdBy.name?.[0] || trip.createdBy.username[0].toUpperCase()}
                    </div>
                  )}
                  <div className="text-left min-w-0">
                    <p className="text-xs font-semibold text-gray-800 group-hover/creator:text-emerald-600 transition-colors truncate">
                      {trip.createdBy.name || trip.createdBy.username}
                    </p>
                    <p className="text-[10px] text-gray-400 truncate">@{trip.createdBy.username}</p>
                  </div>
                </div>

                {/* Right Section: Likes count & Clone trigger */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <button
                    onClick={(e) => handleLike(e, trip._id)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all duration-200 ${
                      liked
                        ? "bg-rose-500 text-white border-rose-500 shadow-sm"
                        : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                    }`}
                    aria-label={liked ? "Unlike trip" : "Like trip"}
                  >
                    <Icon
                      name="heart"
                      size={14}
                      className={liked ? "text-white fill-white" : "text-gray-400"}
                    />
                    <span>{trip.likeCount || 0}</span>
                  </button>

                  <button
                    onClick={(e) => handleClone(e, trip._id, trip.tripName)}
                    className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-lg transition-all"
                    title="Clone to your trips"
                    aria-label="Clone trip blueprint to your trips"
                  >
                    <Icon name="copy" size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
