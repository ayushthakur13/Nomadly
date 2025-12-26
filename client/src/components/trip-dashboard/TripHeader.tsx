import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Icon from '../icon/Icon';
import ConfirmationModal from '../common/ConfirmationModal';
import EditTripModal from '../common/EditTripModal';
import tripCover from "../../assets/illustrations/default-trip-cover.webp"
import { deleteTripCover, updateTripCover, deleteTrip, updateTrip } from '../../store/tripsSlice';

interface TripHeaderProps {
  trip: {
    _id: string;
    tripName: string;
    coverImageUrl?: string;
    destinationLocation?: {
      name: string;
      coordinates: { lat: number; lng: number };
    };
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
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  const { deleteLoading, updateLoading } = useSelector((state: any) => state.trips);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [coverLoading, setCoverLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  const handleCoverFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Please upload a JPEG, PNG, or WebP image');
      return;
    }

    if (file.size > MAX_SIZE) {
      toast.error('Image must be less than 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      setCoverLoading(true);
      await dispatch(updateTripCover({ tripId: trip._id, formData })).unwrap();
      toast.success('Cover updated');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update cover');
    } finally {
      setCoverLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveCover = async () => {
    try {
      setCoverLoading(true);
      await dispatch(deleteTripCover(trip._id)).unwrap();
      toast.success('Cover removed');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to remove cover');
    } finally {
      setCoverLoading(false);
    }
  };

  const handleConfirmDelete = () => {
    setShowDeleteConfirm(true);
  };

  const handleEditSave = async (updates: any) => {
    try {
      await dispatch(updateTrip({ tripId: trip._id, updates })).unwrap();
      setShowEditModal(false);
    } catch (error: any) {
      throw error;
    }
  };

  const handleDeleteTrip = async () => {
    try {
      await dispatch(deleteTrip(trip._id)).unwrap();
      toast.success('Trip deleted');
      // Small delay to ensure Redux state updates before navigation
      setTimeout(() => {
        navigate('/trips', { replace: true });
      }, 100);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete trip');
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="bg-white border rounded-xl shadow-sm">
      {/* Full-page loader overlay during deletion */}
      {deleteLoading && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-emerald-600"></div>
            <p className="text-white font-medium">Deleting trip...</p>
          </div>
        </div>
      )}
      {!deleteLoading && (
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-start gap-5 w-full">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            {/* Compact Cover Image with overlay actions */}
            <div className="relative group flex-shrink-0">
              <div className="w-32 h-24 sm:w-36 sm:h-24 rounded-lg overflow-hidden border border-gray-100 shadow-sm relative">
                <img
                  src={trip.coverImageUrl || tripCover}
                  alt={trip.tripName}
                  className="w-full h-full object-cover"
                />
                {coverLoading && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                  </div>
                )}
                {isOwner && (
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end gap-2 p-2">
                    <button
                      type="button"
                      className="p-1.5 bg-white/80 border border-white/50 rounded-md shadow-sm text-gray-600 hover:bg-white/90 disabled:opacity-60"
                      title="Change cover"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={coverLoading}
                    >
                      <Icon name="edit2" size={14} />
                    </button>
                    <button
                      type="button"
                      className="p-1.5 bg-white/80 border border-white/50 rounded-md shadow-sm text-gray-600 hover:bg-white/90 disabled:opacity-60"
                      title="Remove cover"
                      onClick={handleRemoveCover}
                      disabled={coverLoading}
                    >
                      <Icon name="delete" size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Trip Info */}
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-center gap-2 min-w-0">
                <h1 className="text-2xl sm:text-[26px] font-bold text-gray-900 truncate">
                  {trip.tripName}
                </h1>
                <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold shadow-[0_1px_2px_rgba(16,24,40,0.05)] ${statusInfo.badgeColor}`}>
                  <Icon name={statusInfo.icon as any} size={12} />
                  <span className="leading-none">{statusInfo.text}</span>
                </div>
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-gray-200 bg-white text-gray-400">
                  <Icon name={trip.isPublic ? 'globe' : 'lock'} size={12} />
                </span>
              </div>

              <div className="flex items-center gap-3 text-gray-600 text-sm min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Icon name="mapPin" size={14} className="text-gray-400" />
                  <span className="truncate">{trip.destinationLocation?.name || '—'}</span>
                </div>
                <span className="text-gray-300">•</span>
                <div className="flex items-center gap-1.5">
                  <Icon name="calendar" size={14} className="text-gray-400" />
                  <span>{formattedDateRange}</span>
                </div>
              </div>

              {!isOwner && (
                <div className="text-xs text-gray-500">
                  Created by @{trip.createdBy.username}
                </div>
              )}
            </div>

            {/* Hidden file input for cover upload */}
            {isOwner && (
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleCoverFileChange}
              />
            )}
          </div>

          {/* Right: Quick actions (unchanged behavior) */}
          {isOwner && (
            <div className="flex items-center gap-1.5 flex-shrink-0" ref={menuRef}>
              <button
                onClick={() => setShowEditModal(true)}
                className="p-2.5 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                title="Edit trip"
              >
                <Icon name="edit2" size={18} />
              </button>

              <button
                onClick={onPublishToggle}
                className="p-2.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title={trip.isPublic ? 'Make private' : 'Publish trip'}
              >
                <Icon name={trip.isPublic ? 'lock' : 'globe'} size={18} />
              </button>

              <button
                onClick={handleShare}
                className="p-2.5 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                title="Share trip"
              >
                <Icon name="share" size={18} />
              </button>

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
                      onClick={handleConfirmDelete}
                      disabled={deleteLoading}
                      className="w-full text-left px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <Icon name="delete" size={16} className="text-red-600" />
                      Delete trip
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      )}

      {/* Edit Trip Modal */}
      <EditTripModal
        isOpen={showEditModal}
        trip={trip}
        isLoading={updateLoading}
        onClose={() => setShowEditModal(false)}
        onSave={handleEditSave}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        title="Delete trip"
        description={`Are you sure you want to delete "${trip.tripName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous={true}
        isLoading={deleteLoading}
        onConfirm={handleDeleteTrip}
        onCancel={() => !deleteLoading && setShowDeleteConfirm(false)}
      />
    </div>
  );
};

export default TripHeader;
