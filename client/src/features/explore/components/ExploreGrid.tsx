import { Icon } from "@/ui";
import defaultTripCardCover from "@/assets/illustrations/default-trip-cover.webp";

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
            className="bg-white rounded-2xl shadow-sm border border-gray-200/80 hover:border-emerald-500/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden group flex flex-col h-full text-left"
          >
            {/* Card Cover Image */}
            <div className="relative h-56 overflow-hidden bg-gray-100">
              <img
                src={trip.coverImageUrl || defaultTripCardCover}
                alt={trip.tripName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

              {/* Quick Category Tag */}
              {trip.category && (
                <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-black uppercase px-3 py-1.5 rounded-lg shadow-sm border border-white/50">
                  {trip.category}
                </span>
              )}

              {/* Floating Social Action Buttons */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <button
                  onClick={(e) => handleLike(e, trip._id)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shadow-md ${
                    liked
                      ? "bg-rose-500 text-white"
                      : "bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white"
                  }`}
                >
                  <Icon name="heart" size={16} className={liked ? "text-white" : "text-gray-700"} />
                </button>
                <button
                  onClick={(e) => handleSave(e, trip._id)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shadow-md ${
                    saved
                      ? "bg-teal-600 text-white"
                      : "bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white"
                  }`}
                >
                  <Icon name="bookmark" size={16} className={saved ? "text-white" : "text-gray-700"} />
                </button>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-6 flex flex-col flex-grow">
              <h3 className="text-xl font-black text-gray-900 group-hover:text-emerald-600 transition-colors line-clamp-1 mb-2">
                {trip.tripName}
              </h3>
              <p className="text-gray-500 text-xs line-clamp-2 mb-4 leading-relaxed">
                {trip.description || "Explore this amazing custom itinerary."}
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
                    {new Date(trip.startDate).toLocaleDateString()} -{" "}
                    {new Date(trip.endDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="mt-auto border-t border-gray-100 pt-4 flex items-center justify-between">
                {/* Creator Profile Link */}
                <div
                  onClick={(e) => onCreatorClick(e, trip.createdBy.username)}
                  className="flex items-center gap-2.5 group/creator"
                >
                  {trip.createdBy.profilePicUrl ? (
                    <img
                      src={trip.createdBy.profilePicUrl}
                      alt={trip.createdBy.username}
                      className="w-8 h-8 rounded-full object-cover border border-emerald-500/20"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-700">
                      {trip.createdBy.name?.[0] || trip.createdBy.username[0].toUpperCase()}
                    </div>
                  )}
                  <div className="text-left">
                    <p className="text-xs font-black text-gray-800 group-hover/creator:text-emerald-600 transition-colors">
                      {trip.createdBy.name || trip.createdBy.username}
                    </p>
                    <p className="text-[10px] text-gray-400">@{trip.createdBy.username}</p>
                  </div>
                </div>

                {/* Right Section: Likes count & Clone trigger */}
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
                    <Icon name="heart" size={14} className="text-rose-500" />
                    {trip.likeCount || 0}
                  </span>

                  <button
                    onClick={(e) => handleClone(e, trip._id, trip.tripName)}
                    className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-lg transition-all"
                    title="Clone itinerary"
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
