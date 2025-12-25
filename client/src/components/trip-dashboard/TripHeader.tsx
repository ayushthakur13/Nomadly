import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Icon from '../icon/Icon';
import tripCover from "../../assets/illustrations/default-trip-cover.webp"

interface TripHeaderProps {
  trip: {
    _id: string;
    tripName: string;
    coverImageUrl?: string;
    mainDestination: string;
    startDate: string;
    endDate: string;
    isPublic: boolean;
    createdBy: {
      _id: string;
      name?: string;
      username: string;
    };
  };
  isOwner: boolean;
  onEditClick: () => void;
  onPublishToggle: () => void;
  onDeleteClick: () => void;
}

const TripHeader = ({
  trip,
  isOwner,
  onEditClick,
  onPublishToggle,
  onDeleteClick,
}: TripHeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate trip status and smart text
  const statusInfo = useMemo(() => {
    const now = new Date();
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const daysToStart = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const daysSinceStart = Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    if (now < start) {
      return {
        status: 'Upcoming',
        text: daysToStart === 0 ? 'Starts tomorrow' : daysToStart === 1 ? '1 day to go' : `${daysToStart} days to go`,
        badgeColor: 'bg-blue-100 text-blue-700',
        icon: 'calendar',
      };
    } else if (now >= start && now <= end) {
      const currentDay = Math.min(daysSinceStart + 1, totalDays);
      return {
        status: 'Ongoing',
        text: `Day ${currentDay} of ${totalDays}`,
        badgeColor: 'bg-emerald-100 text-emerald-700',
        icon: 'zap',
      };
    } else {
      return {
        status: 'Past',
        text: 'Trip completed',
        badgeColor: 'bg-gray-100 text-gray-700',
        icon: 'checkCircle',
      };
    }
  }, [trip.startDate, trip.endDate]);

  const formattedDateRange = useMemo(() => {
    const start = new Date(trip.startDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    const end = new Date(trip.endDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    return `${start} – ${end}`;
  }, [trip.startDate, trip.endDate]);

  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/trips/${trip._id}`;
  }, [trip._id]);

  const handleShare = useCallback(async () => {
    if (!shareUrl) return;
    try {
      if (navigator.share) {
        await navigator.share({ title: trip.tripName, url: shareUrl });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      }
    } catch (error) {
      console.error('Failed to share trip', error);
    }
  }, [shareUrl, trip.tripName]);

  return (
    <div className="bg-white border rounded-xl shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-6 w-full">
          {/* Compact Cover Image */}
          <div className="flex-shrink-0">
            <div className="w-40 h-28 rounded-lg overflow-hidden shadow-sm border border-gray-100">
              <img
                src={trip.coverImageUrl || tripCover}
                alt={trip.tripName}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Trip Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-6">
              <div className="min-w-0 flex-1 space-y-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">
                  {trip.tripName}
                </h1>

                {/* Location and Date Summary */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-gray-600 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Icon name="mapPin" size={14} className="text-gray-400" />
                    <span className="truncate">{trip.mainDestination}</span>
                  </div>
                  <span className="hidden sm:inline text-gray-300">•</span>
                  <div className="flex items-center gap-1.5">
                    <Icon name="calendar" size={14} className="text-gray-400" />
                    <span>{formattedDateRange}</span>
                  </div>
                </div>

                {/* Status and Privacy Badges */}
                <div className="flex items-center gap-2.5 flex-wrap">
                  {/* Status Badge */}
                  <div className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-semibold shadow-[0_1px_2px_rgba(16,24,40,0.05)] ${statusInfo.badgeColor}`}>
                    <Icon name={statusInfo.icon as any} size={14} />
                    <span className="leading-none">{statusInfo.text}</span>
                  </div>

                  {/* Privacy Badge */}
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-gray-200 text-[11px] font-medium text-gray-500 bg-white">
                    <Icon name={trip.isPublic ? 'globe' : 'lock'} size={12} />
                    <span className="hidden sm:inline">{trip.isPublic ? 'Public' : 'Private'}</span>
                    <span className="sm:hidden">{trip.isPublic ? 'Public' : 'Private'}</span>
                  </div>

                  {/* Ownership context */}
                  {!isOwner && (
                    <div className="text-xs text-gray-500">
                      Created by @{trip.createdBy.username}
                    </div>
                  )}
                </div>
              </div>

              {/* Icon-only Quick Actions */}
              {isOwner && (
                <div className="flex items-center gap-1.5 flex-shrink-0" ref={menuRef}>
                  {/* Edit */}
                  <button
                    onClick={onEditClick}
                    className="p-2.5 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    title="Edit trip"
                  >
                    <Icon name="edit2" size={18} />
                  </button>

                  {/* Publish Toggle */}
                  <button
                    onClick={onPublishToggle}
                    className="p-2.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title={trip.isPublic ? 'Make private' : 'Publish trip'}
                  >
                    <Icon name={trip.isPublic ? 'lock' : 'globe'} size={18} />
                  </button>

                  {/* Share */}
                  <button
                    onClick={handleShare}
                    className="p-2.5 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    title="Share trip"
                  >
                    <Icon name="share" size={18} />
                  </button>

                  {/* More Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setIsMenuOpen((prev) => !prev)}
                      className="p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                      title="More options"
                      aria-haspopup="menu"
                      aria-expanded={isMenuOpen}
                    >
                      <Icon name="moreVertical" size={18} />
                    </button>
                    {isMenuOpen && (
                      <div className="absolute right-0 mt-2 w-40 rounded-lg border border-gray-200 bg-white shadow-lg py-1 z-20">
                        <button
                          onClick={() => { setIsMenuOpen(false); onDeleteClick(); }}
                          className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <Icon name="trash2" size={16} />
                          Delete trip
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripHeader;
