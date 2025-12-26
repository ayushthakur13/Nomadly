import defaultTripCardCover from "../../assets/illustrations/default-trip-cover.webp";
import Icon from "../icon/Icon";

type Trip = any;

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

type TripCardProps = {
  trip: Trip;
  onClick: () => void;
  isSaved?: boolean;
  onToggleSave?: () => void;
};

const TripCard = ({
  trip,
  onClick,
  isSaved = false,
  onToggleSave,
}: TripCardProps) => {
  const getTripStatus = () => {
    const today = new Date();
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    if (today < start) return "upcoming";
    if (today >= start && today <= end) return "ongoing";
    return "past";
  };

  const getStatusBadge = () => {
    const status = getTripStatus();
    const badges: any = {
      upcoming: { bg: "bg-blue-100", text: "text-blue-700", label: "Upcoming" },
      ongoing: {
        bg: "bg-emerald-100",
        text: "text-emerald-700",
        label: "Ongoing",
      },
      past: { bg: "bg-gray-100", text: "text-gray-700", label: "Past" },
    };
    const badge = badges[status];
    return (
      <span
        className={`${badge.bg} ${badge.text} px-2.5 py-1 rounded-full text-xs font-medium`}
      >
        {badge.label}
      </span>
    );
  };

  const getDaysInfo = () => {
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const status = getTripStatus();
    const diffTime = start.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (status === "ongoing") {
      const remainingTime = end.getTime() - today.getTime();
      const remainingDays = Math.ceil(remainingTime / (1000 * 60 * 60 * 24));
      return {
        type: "remaining",
        value: remainingDays,
        label: `${remainingDays}d left`,
      };
    }
    if (status === "upcoming" && diffDays <= 30) {
      return { type: "countdown", value: diffDays, label: `in ${diffDays}d` };
    }
    return null;
  };

  const getTripDuration = () => {
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const formatDateRange = () => {
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const startMonth = start.toLocaleDateString("en-US", { month: "short" });
    const endMonth = end.toLocaleDateString("en-US", { month: "short" });
    const startDay = start.getDate();
    const endDay = end.getDate();
    const year = start.getFullYear();

    if (startMonth === endMonth) {
      return `${startMonth} ${startDay}-${endDay}, ${year}`;
    }
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
  };

  const getMemberInfo = () => {
    const count = trip.membersCount || trip.members?.length || 1;
    return count;
  };

  const getProgressInfo = () => {
    // Calculate trip completion percentage based on status
    const status = getTripStatus();
    if (status === "past") return 100;
    if (status === "upcoming") return 0;

    // For ongoing trips, calculate based on days passed
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const today = new Date();
    const total = end.getTime() - start.getTime();
    const passed = today.getTime() - start.getTime();
    return Math.round((passed / total) * 100);
  };

  const daysInfo = getDaysInfo();
  const status = getTripStatus();
  const memberCount = getMemberInfo();
  const duration = getTripDuration();
  const progress = getProgressInfo();

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group relative border border-gray-100 hover:border-emerald-200 hover:-translate-y-1"
    >
      {/* Cover Image with gradient overlay */}
      <div className="relative h-48 w-full overflow-hidden">
        <img
          src={trip.coverImageUrl || defaultTripCardCover}
          alt={trip.tripName}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
          onError={(e: any) => {
            e.currentTarget.src = "/images/default-trip.jpg";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300"></div>

        {/* Status badge */}
        <div className="absolute top-3 left-3">{getStatusBadge()}</div>

        {/* Days info badge */}
        {daysInfo && (
          <div
            className={`absolute top-3 right-3 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1 ${
              daysInfo.type === "remaining"
                ? "bg-emerald-500 text-white"
                : "bg-blue-500 text-white"
            }`}
          >
            <Icon name="clock" size={14} />
            {daysInfo.label}
          </div>
        )}

        {/* Progress bar for ongoing trips */}
        {status === "ongoing" && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30">
            <div
              className="h-full bg-emerald-400 transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}

        {/* Save toggle */}
        {onToggleSave && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave();
            }}
            className={`absolute bottom-3 right-3 p-2.5 rounded-full backdrop-blur-md shadow-lg hover:scale-110 transition-all duration-200 ${
              isSaved
                ? "bg-emerald-500 text-white"
                : "bg-white/95 text-gray-700 hover:bg-white"
            }`}
            aria-label={isSaved ? "Unsave trip" : "Save trip"}
            title={isSaved ? "Unsave" : "Save"}
          >
            <Icon
              name="bookmark"
              size={16}
              className={isSaved ? "text-white" : "text-gray-700"}
            />
          </button>
        )}
      </div>

      {/* Content with better information architecture */}
      <div className="p-5">
        <div className="mb-3">
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-600 transition-colors duration-200 mb-1.5 line-clamp-1">
            {trip.tripName}
          </h3>
          <div className="flex items-center gap-1.5 text-gray-600 mb-2">
            <Icon
              name="location"
              size={16}
              className="text-emerald-500 flex-shrink-0"
            />
            <p className="text-sm font-medium truncate">
              {trip.destinationLocation?.name || trip.mainDestination || '—'}
            </p>
          </div>
          <p className="text-xs text-gray-500">{formatDateRange()}</p>
        </div>

        {/* Key info grid */}
        <div className="grid grid-cols-3 gap-3 py-3 border-y border-gray-100">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-gray-900 font-semibold text-sm mb-0.5">
              <Icon name="clock" size={14} className="text-gray-400" />
              {duration}
            </div>
            <div className="text-xs text-gray-500">days</div>
          </div>

          <div className="text-center border-x border-gray-100">
            <div className="flex items-center justify-center gap-1 text-gray-900 font-semibold text-sm mb-0.5">
              <Icon name="users" size={14} className="text-gray-400" />
              {memberCount}
            </div>
            <div className="text-xs text-gray-500">
              {memberCount === 1 ? "solo" : "members"}
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center text-gray-900 font-semibold text-sm mb-0.5">
              {trip.isPublic ? (
                <>
                  <Icon name="globe" size={14} className="text-emerald-500" />
                  <span className="text-emerald-600 ml-1">Public</span>
                </>
              ) : (
                <>
                  <Icon name="lock" size={14} className="text-gray-400" />
                  <span className="text-gray-500 ml-1 text-xs">Private</span>
                </>
              )}
            </div>
            <div className="text-xs text-gray-500">visibility</div>
          </div>
        </div>

        {/* Bottom row: Category + Arrow */}
        <div className="mt-3 flex items-center justify-between">
          {trip.category ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">
              <span>{CATEGORY_EMOJI[String(trip.category).toLowerCase()] ?? ""}</span>
              {String(trip.category).charAt(0).toUpperCase() + String(trip.category).slice(1)}
            </span>
          ) : (
            <div></div>
          )}

          {/* View details arrow */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Icon name="arrowRight" size={20} className="text-emerald-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripCard;
