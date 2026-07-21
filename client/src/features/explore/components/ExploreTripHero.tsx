import { Icon } from "@/ui";
import defaultTripCardCover from "@/assets/illustrations/default-trip-cover.webp";
import { formatDateRange } from "../../../utils/formatDateRange";
import type { PopulatedTrip } from "../ExploreTrip";

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

interface ExploreTripHeroProps {
  trip: PopulatedTrip;
  socialStatus: { liked: boolean; saved: boolean };
  durationDays: number;
  handleLike: () => void;
  handleSave: () => void;
  handleClone: () => void;
  handleShare: () => void;
  onAuthorClick: () => void;
}

export default function ExploreTripHero({
  trip,
  socialStatus,
  durationDays,
  handleLike,
  handleSave,
  handleClone,
  handleShare,
  onAuthorClick,
}: ExploreTripHeroProps) {
  return (
    <div className="bg-white border-b">
      {/* Action Bar */}
      <div className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-emerald-600 transition-colors"
          >
            <Icon name="arrowLeft" size={16} /> Back to Explore
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm border ${
                socialStatus.liked
                  ? "bg-rose-500 text-white border-rose-500"
                  : "bg-white text-gray-700 hover:bg-gray-50 border-gray-200"
              }`}
              aria-label={socialStatus.liked ? "Unlike trip" : "Like trip"}
            >
              <Icon name="heart" size={14} className={socialStatus.liked ? "text-white" : "text-gray-700"} />
              <span>{trip.likeCount || 0}</span>
            </button>
            <button
              onClick={handleSave}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm border ${
                socialStatus.saved
                  ? "bg-teal-600 text-white border-teal-600"
                  : "bg-white text-gray-700 hover:bg-gray-50 border-gray-200"
              }`}
              aria-label={socialStatus.saved ? "Unsave trip from bookmarks" : "Save trip to bookmarks"}
            >
              <Icon name="bookmark" size={14} className={socialStatus.saved ? "text-white" : "text-gray-700"} />
              <span>{socialStatus.saved ? "Saved" : "Save"}</span>
            </button>
            <button
              onClick={handleClone}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm border border-emerald-600"
              aria-label="Clone trip blueprint to your trips"
            >
              <Icon name="copy" size={14} />
              <span>Clone Plan</span>
            </button>
            <button
              onClick={handleShare}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-600 transition-all"
              title="Copy share link"
              aria-label="Copy share link to clipboard"
            >
              <Icon name="share" size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left">
        <div className="relative h-80 sm:h-[400px] rounded-2xl overflow-hidden shadow-md mb-8">
          <img
            src={trip.coverImageUrl || defaultTripCardCover}
            alt={trip.tripName}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>
          <div className="absolute bottom-6 left-6 right-6 text-white text-left">
            {trip.category && (
              <span className="inline-flex items-center gap-1.5 bg-white/90 text-gray-800 border border-white/50 backdrop-blur-sm shadow-sm rounded-lg text-xs font-semibold uppercase px-3 py-1 mb-3">
                <Icon
                  name={(CATEGORY_ICONS[trip.category.toLowerCase()] || "globe") as any}
                  size={12}
                  className="text-gray-600 flex-shrink-0"
                />
                {trip.category}
              </span>
            )}
            <h1 className="text-3xl sm:text-4xl font-bold mb-2 tracking-tight drop-shadow-md">
              {trip.tripName}
            </h1>
            <p className="text-emerald-100 font-semibold flex items-center gap-1.5 drop-shadow-sm">
              <Icon name="location" size={16} className="text-emerald-500" /> {trip.destinationLocation?.name}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">About this itinerary</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
              {trip.description || "No description provided for this trip itinerary."}
            </p>
          </div>

          {/* Quick Details Sidebar */}
          <div className="bg-gray-50 rounded-2xl border p-6 flex flex-col justify-between">
            <div className="space-y-4 text-left">
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Duration</p>
                <p className="font-semibold text-gray-900 text-lg">{durationDays} Days</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Dates</p>
                <p className="font-semibold text-gray-900 text-sm">
                  {formatDateRange(trip.startDate, trip.endDate)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Author</p>
                <div
                  onClick={onAuthorClick}
                  className="flex items-center gap-2 mt-1.5 cursor-pointer hover:opacity-85"
                >
                  {trip.createdBy.profilePicUrl ? (
                    <img
                      src={trip.createdBy.profilePicUrl}
                      alt={trip.createdBy.username}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center font-medium text-emerald-700 text-xs">
                      {trip.createdBy.username[0].toUpperCase()}
                    </div>
                  )}
                  <span className="font-semibold text-gray-950 text-sm hover:underline">
                    {trip.createdBy.name || `@${trip.createdBy.username}`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
