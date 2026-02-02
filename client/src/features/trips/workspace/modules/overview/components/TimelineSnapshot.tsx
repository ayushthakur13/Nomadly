import Icon from "@/ui/icon/Icon";
import type {} from "../hooks/useTimelineProgress";

interface TimelineSnapshotProps {
  model: {
    statusInfo: { badgeColor: string; icon: string; text: string };
    formattedDateRange: string;
    progressPct: number;
    todayPct: number;
    isUpcoming: boolean;
    isPast: boolean;
    startDisplay: string;
    endDisplay: string;
    journeyLabel: string;
    totalDays: number;
    currentDayNumber: number;
    daysUntilStart: number;
    todayDisplay: string;
    isEndToday: boolean;
  };
}

const TimelineSnapshot = ({ model }: TimelineSnapshotProps) => {
  const {
    statusInfo,
    formattedDateRange,
    progressPct,
    isUpcoming,
    isPast,
    startDisplay,
    endDisplay,
    totalDays,
    todayDisplay,
    isEndToday,
  } = model;

  // Accent colors for timeline (blue) and shared icon container style
  const accent = {
    bgTint: "bg-blue-50",
    text: "text-blue-600",
    // Brand color for progress fill (emerald)
    fill: isPast ? "bg-gray-400" : "bg-emerald-500",
    ring: "ring-emerald-500",
  };

  // Dynamic subtext by status
  // Subtext: total number of days (sentence for emotional trust)
  const subtext =
    totalDays === 1 ? "A single-day journey" : `A ${totalDays}-day journey`;

  // Edge handling for marker near start/end
  const markerPct = isPast ? 100 : model.todayPct;

  // Show marker unless today equals end date
  const showMarker = !isEndToday;
  const markerLabel = showMarker ? (isPast ? endDisplay : todayDisplay) : "";

  // Soft interpretation line
  const softLine = isUpcoming
    ? "Your trip starts soon."
    : isPast
    ? "Hope this trip left you with good memories."
    : "You're well into the journey.";

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      {/* Header mirrors Route card: colored icon, title, subtext, status badge */}
      <div className="flex items-start gap-3 justify-between">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          {/* Colored icon container */}
          <div
            className={`p-1.5 rounded-md ${accent.bgTint} ${accent.text} flex-shrink-0 mt-0.5`}
          >
            <Icon name="clock" />
          </div>
          <div className="flex-1 min-w-0">
            {/* Strong title: real dates (start → end) */}
            <p className="text-lg font-semibold text-gray-900 truncate">
              {formattedDateRange}
            </p>
            {/* Subtext explaining context */}
            <p className="text-xs text-gray-500 font-medium mt-1">{subtext}</p>
          </div>
        </div>
        {/* Status badge aligned to top-right */}
        <span
          className={`text-xs px-2 py-1 rounded-full ${statusInfo.badgeColor} flex items-center gap-0.5 flex-shrink-0`}
        >
          <Icon name={statusInfo.icon as any} size={12} />
          <span className="hidden sm:inline">
            {isUpcoming
              ? statusInfo.text
              : isPast
              ? "Completed"
              : statusInfo.text}
          </span>
        </span>
      </div>

      {/* Timeline track: anchors, progress fill and Today marker */}
      <div className="mt-4">
        {/* Start and end anchors above the bar */}
        <div className="mb-1.5 flex items-center justify-between text-[11px] text-gray-500">
          <span>{startDisplay}</span>
          <span>{endDisplay}</span>
        </div>

        <div className="relative h-2 bg-gray-100 rounded-full pointer-events-none cursor-default select-none">
          {/* Progress fill from start to today */}
          <div
            className={`absolute left-0 top-0 h-2 rounded-full transition-all ${accent.fill}`}
            style={{ width: `${progressPct}%` }}
          />
          {/* Today marker dot */}
          {showMarker && (
            <div
              className="absolute top-1/2 pointer-events-none"
              style={{
                left: `${markerPct}%`,
                transform: "translate(-50%, -50%)",
              }}
              aria-hidden="true"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            </div>
          )}
        </div>
        {/* Today label below the bar */}
        <div className="relative mt-1.5 h-4">
          {!!markerLabel && (
            <span
              className="absolute text-[11px] text-gray-500"
              style={{
                left: `${markerPct}%`,
                transform: "translateX(-50%)",
              }}
            >
              {markerLabel}
            </span>
          )}
        </div>
      </div>

      {/* Soft interpretation line */}
      <p className="text-xs text-gray-500 mt-3">{softLine}</p>
    </div>
  );
};

export default TimelineSnapshot;
