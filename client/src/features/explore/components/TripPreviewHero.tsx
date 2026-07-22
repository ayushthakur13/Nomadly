import { Icon } from "@/ui";
import defaultTripCardCover from "@/assets/illustrations/default-trip-cover.webp";
import { formatDateRange } from "../../../utils/formatDateRange";
import { formatCurrency } from "../../trips/workspace/modules/budget/utils/formatting";
import { useMapboxStatic } from "@/features/trips/_shared/hooks";

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

interface TripPreviewHeroProps {
  trip: any;
  socialStatus: { liked: boolean; saved: boolean };
  durationDays: number;
  handleLike: () => void;
  handleSave: () => void;
  handleClone: () => void;
  handleShare: () => void;
  onAuthorClick: () => void;
  isCloning?: boolean;

  // Overview metrics & data props
  destinations: any[];
  accommodations: any[];
  tasks: any[];
  budget: any | null;
  memories: any[];
  onSectionClick: (id: string) => void;
}

export default function TripPreviewHero({
  trip,
  socialStatus,
  durationDays,
  handleLike,
  handleSave,
  handleClone,
  handleShare,
  onAuthorClick,
  isCloning = false,
  destinations = [],
  accommodations = [],
  tasks = [],
  budget = null,
  memories = [],
  onSectionClick
}: TripPreviewHeroProps) {
  // Map markers logic via shared hook
  const { state: mapState, mapUrl, coordinates } = useMapboxStatic({
    sourceLocation: trip.sourceLocation,
    destinationLocation: trip.destinationLocation,
    stops: (destinations || []).map((d, idx) => ({
      coordinates: d.location?.point?.coordinates,
      order: idx,
      name: d.name,
    })),
  });

  return (
    <div className="bg-white border-b py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
        
        {/* Row 1: Three-Column Hero Grid */}
        <div className="grid md:grid-cols-12 gap-8 items-stretch">
          
          {/* Column 1 (md:col-span-4): Cover Image Card */}
          <div className="md:col-span-4 relative h-64 sm:h-80 md:h-auto rounded-2xl overflow-hidden shadow-md min-h-[300px]">
            <img
              src={trip.coverImageUrl || defaultTripCardCover}
              alt={trip.tripName}
              className="w-full h-full object-cover"
            />
            {trip.category && (
              <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 bg-white/90 text-gray-800 border border-white/50 backdrop-blur-sm shadow-sm rounded-lg text-xs font-semibold uppercase px-3 py-1">
                <Icon
                  name={(CATEGORY_ICONS[trip.category.toLowerCase()] || "globe") as any}
                  size={12}
                  className="text-gray-600 flex-shrink-0"
                />
                {trip.category}
              </span>
            )}
          </div>

          {/* Column 2 (md:col-span-4): Metadata, Description, & Actions */}
          <div className="md:col-span-4 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-gray-950 tracking-tight leading-tight">
                {trip.tripName}
              </h1>

              {/* Start Location → Destination Location */}
              <div className="flex flex-col gap-1.5 text-sm bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div className="flex items-center gap-1.5 text-gray-600 font-medium">
                  <Icon name="arrowRight" size={14} className="text-gray-400" />
                  <span>Start: <span className="font-bold text-gray-900">{trip.sourceLocation?.name || "Not set"}</span></span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                  <Icon name="mapPin" size={14} className="text-emerald-500" />
                  <span>Destination: <span className="font-bold text-emerald-900">{trip.destinationLocation?.name}</span></span>
                </div>
              </div>

              {/* Dates & Duration */}
              <p className="text-gray-500 text-sm font-semibold flex items-center gap-1.5">
                <Icon name="calendar" size={16} className="text-gray-400" />
                {formatDateRange(trip.startDate, trip.endDate)} ({durationDays} Days)
              </p>

              {/* Author Info */}
              <div className="flex items-center gap-2 pt-1">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Curated by:</p>
                <div
                  onClick={onAuthorClick}
                  className="flex items-center gap-2 cursor-pointer hover:opacity-85"
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

              {/* About description directly in Hero */}
              <div className="pt-1">
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {trip.description || "No description provided for this trip itinerary."}
                </p>
              </div>
            </div>

            {/* Action buttons row */}
            <div className="flex flex-wrap items-center gap-2.5 pt-4 border-t border-gray-100">
              <button
                onClick={handleLike}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm border ${
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
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm border ${
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
                disabled={isCloning}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition-all shadow-sm border border-emerald-600"
                aria-label="Clone trip blueprint to your trips"
              >
                {isCloning ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin flex-shrink-0" />
                    <span>Cloning...</span>
                  </>
                ) : (
                  <>
                    <Icon name="copy" size={14} />
                    <span>Clone Plan</span>
                  </>
                )}
              </button>

              <button
                onClick={handleShare}
                className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-600 transition-all"
                title="Copy share link"
                aria-label="Copy share link to clipboard"
              >
                <Icon name="share" size={16} />
              </button>
            </div>

          </div>

          {/* Column 3 (md:col-span-4): Route Map Preview Card */}
          <div className="md:col-span-4 bg-gray-50 rounded-2xl border border-gray-200 p-4 flex flex-col justify-between shadow-sm min-h-[300px]">
            <div className="flex flex-col justify-between items-start gap-1 mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-1 rounded-md bg-emerald-50 text-emerald-600 flex-shrink-0">
                  <Icon name="map" size={14} />
                </div>
                <div className="min-w-0">
                  <p className="text-m font-bold text-gray-900 truncate">
                    {trip.destinationLocation?.name || "Route Preview"}
                  </p>
                  <p className="text-xs text-gray-400 font-medium mt-0.5">Route overview map</p>
                </div>
              </div>
            </div>

            {/* Static Map Container */}
            <div className="rounded-xl overflow-hidden border border-gray-200 bg-white flex-1 relative min-h-[180px]">
              {mapState === "with-coordinates" && mapUrl ? (
                <img
                  src={mapUrl}
                  alt={`Static route map of ${trip.destinationLocation?.name}`}
                  className="w-full h-full object-cover"
                />
              ) : mapState === "manual-location" ? (
                <div className="w-full h-full flex items-center justify-center p-4 bg-amber-50/50">
                  <div className="text-center space-y-1.5">
                    <Icon name="info" size={18} className="text-amber-600 mx-auto" />
                    <p className="text-[11px] font-bold text-amber-900">Manual Location coordinates</p>
                    <p className="text-[9px] text-amber-700 max-w-xs mx-auto">
                      Map coordinates are missing. Static map renders automatically when search geometry is indexed.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400 text-[10px]">
                  No spatial coordinates defined for this itinerary.
                </div>
              )}
            </div>

            {coordinates && (
              <p className="text-[9px] text-gray-400 text-center mt-2">
                {coordinates[1].toFixed(4)}°, {coordinates[0].toFixed(4)}°
              </p>
            )}
          </div>

        </div>

        {/* Row 2: Full-Width Horizontal Clickable Itinerary Summary Stats */}
        <div className="border-t border-gray-200 mt-8 pt-8 text-left">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4">
            <span className="p-1 rounded-md bg-emerald-50 text-emerald-600">
              <Icon name="fileText" size={12} />
            </span>
            Itinerary Summary
          </h3>
          
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-6 ${trip.memoriesPublic ? "lg:grid-cols-5" : ""}`}>
            
            {/* Destinations Stop Card */}
            <div 
              onClick={() => onSectionClick("destinations")}
              className="bg-gray-50 border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/20 rounded-2xl p-4 flex items-center gap-3 cursor-pointer transition-all duration-200"
            >
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 flex-shrink-0">
                <Icon name="mapPin" size={18} />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{destinations.length}</p>
                <p className="text-xs text-gray-500 font-semibold mt-0.5">Destinations</p>
              </div>
            </div>

            {/* Lodging Stay Card */}
            <div 
              onClick={() => onSectionClick("stays")}
              className="bg-gray-50 border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/20 rounded-2xl p-4 flex items-center gap-3 cursor-pointer transition-all duration-200"
            >
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 flex-shrink-0">
                <Icon name="bed" size={18} />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{accommodations.length}</p>
                <p className="text-xs text-gray-500 font-semibold mt-0.5">Stays Mapped</p>
              </div>
            </div>

            {/* Checklist Tasks Card */}
            <div 
              onClick={() => onSectionClick("tasks")}
              className="bg-gray-50 border border-gray-100 hover:border-amber-200 hover:bg-amber-50/20 rounded-2xl p-4 flex items-center gap-3 cursor-pointer transition-all duration-200"
            >
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 flex-shrink-0">
                <Icon name="tasks" size={18} />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{tasks.length}</p>
                <p className="text-xs text-gray-500 font-semibold mt-0.5">Tasks Defined</p>
              </div>
            </div>

            {/* Budget Total Card */}
            <div 
              onClick={() => onSectionClick("budget")}
              className="bg-gray-50 border border-gray-100 hover:border-sky-200 hover:bg-sky-50/20 rounded-2xl p-4 flex items-center gap-3 cursor-pointer transition-all duration-200"
            >
              <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600 flex-shrink-0">
                <Icon name="wallet" size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">
                  {budget ? formatCurrency(budget.totalPlanned, budget.baseCurrency) : "Not configured"}
                </p>
                <p className="text-xs text-gray-500 font-semibold mt-0.5">Planned Budget</p>
              </div>
            </div>

            {/* Memories Card (if public) */}
            {trip.memoriesPublic && (
              <div 
                onClick={() => onSectionClick("memories")}
                className="bg-gray-50 border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/20 rounded-2xl p-4 flex items-center gap-3 cursor-pointer transition-all duration-200"
              >
                <div className="p-2.5 rounded-xl bg-teal-50 text-teal-600 flex-shrink-0">
                  <Icon name="image" size={18} />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{memories.length}</p>
                  <p className="text-xs text-gray-500 font-semibold mt-0.5">Memories</p>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
