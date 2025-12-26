import Icon from '@/components/icon/Icon';

interface TripTitleProps {
  tripName: string;
  statusText: string;
  statusBadgeColor: string;
  statusIcon: string;
  isPublic: boolean;
  destination?: string;
  dateRange: string;
  createdByUsername?: string;
  isOwner: boolean;
}

const TripTitle = ({
  tripName,
  statusText,
  statusBadgeColor,
  statusIcon,
  isPublic,
  destination,
  dateRange,
  createdByUsername,
  isOwner,
}: TripTitleProps) => {
  return (
    <div className="min-w-0 flex-1 space-y-2">
      <div className="flex items-center gap-2 min-w-0">
        <h1 className="text-2xl sm:text-[26px] font-bold text-gray-900 truncate">
          {tripName}
        </h1>
        <div
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold shadow-[0_1px_2px_rgba(16,24,40,0.05)] ${statusBadgeColor}`}
        >
          <Icon name={statusIcon as any} size={12} />
          <span className="leading-none">{statusText}</span>
        </div>
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-gray-200 bg-white text-gray-400">
          <Icon name={isPublic ? 'globe' : 'lock'} size={12} />
        </span>
      </div>

      <div className="flex items-center gap-3 text-gray-600 text-sm min-w-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <Icon name="mapPin" size={14} className="text-gray-400" />
          <span className="truncate">{destination || '—'}</span>
        </div>
        <span className="text-gray-300">•</span>
        <div className="flex items-center gap-1.5">
          <Icon name="calendar" size={14} className="text-gray-400" />
          <span>{dateRange}</span>
        </div>
      </div>

      {!isOwner && createdByUsername && (
        <div className="text-xs text-gray-500">Created by @{createdByUsername}</div>
      )}
    </div>
  );
};

export default TripTitle;
