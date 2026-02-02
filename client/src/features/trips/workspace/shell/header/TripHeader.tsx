import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { Trip } from '@shared/types';
import { updateTrip } from '@/features/trips/store';
import { useTripHeaderMenu, useTripCoverUpload, useTripShare, useTripDelete } from './hooks';
import { CoverImage, HeaderActions, TripTitle } from './components';
import ImageLightbox from '@/features/trips/workspace/modules/destinations/components/ImageLightbox';
import { useTripStatus, useTripDateRange } from '@/features/trips/_shared/hooks';

interface TripHeaderProps {
  trip: Trip;
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
  const { deleteLoading, updateLoading } = useSelector((state: any) => state.trips);

  // Compose hooks
  const { isMenuOpen, setIsMenuOpen, menuRef } = useTripHeaderMenu();
  const { coverLoading, fileInputRef, handleCoverFileChange, handleRemoveCover } =
    useTripCoverUpload(trip._id);
  const { shareUrl, handleShare } = useTripShare(trip._id, trip.tripName);
  const { showDeleteConfirm, setShowDeleteConfirm, handleConfirmDelete, handleDeleteTrip } =
    useTripDelete(trip._id);

  // Domain hooks for status and dates
  const { statusInfo } = useTripStatus(trip.startDate, trip.endDate);
  const { formattedDateRange } = useTripDateRange(trip.startDate, trip.endDate);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showCoverLightbox, setShowCoverLightbox] = useState(false);

  const handleEditSave = async (updates: any) => {
    try {
      await dispatch(updateTrip({ tripId: trip._id, updates })).unwrap();
      setShowEditModal(false);
    } catch (error: any) {
      throw error;
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
            <CoverImage
              coverImageUrl={trip.coverImageUrl}
              tripName={trip.tripName}
              isOwner={isOwner}
              coverLoading={coverLoading}
              onFileChange={handleCoverFileChange}
              onRemove={handleRemoveCover}
              onViewImage={() => setShowCoverLightbox(true)}
              fileInputRef={fileInputRef}
            />

            <TripTitle
              tripName={trip.tripName}
              statusText={statusInfo.text}
              statusBadgeColor={statusInfo.badgeColor}
              statusIcon={statusInfo.icon}
              isPublic={trip.isPublic}
              destination={trip.destinationLocation?.name}
              dateRange={formattedDateRange}
              isOwner={isOwner}
            />

            <HeaderActions
              trip={trip}
              isOwner={isOwner}
              isMenuOpen={isMenuOpen}
              onMenuToggle={setIsMenuOpen}
              menuRef={menuRef}
              onEditClick={() => setShowEditModal(true)}
              onPublishToggle={onPublishToggle}
              onShare={handleShare}
              onDeleteConfirm={handleConfirmDelete}
              showDeleteConfirm={showDeleteConfirm}
              deleteLoading={deleteLoading}
              onDeleteCancel={() => !deleteLoading && setShowDeleteConfirm(false)}
              onDeleteConfirmed={handleDeleteTrip}
              showEditModal={showEditModal}
              onEditModalClose={() => setShowEditModal(false)}
              updateLoading={updateLoading}
              onEditSave={handleEditSave}
            />
          </div>
        </div>
      )}

      {showCoverLightbox && trip.coverImageUrl && (
        <ImageLightbox
          src={trip.coverImageUrl}
          title={trip.tripName}
          onClose={() => setShowCoverLightbox(false)}
        />
      )}
    </div>
  );
};

export default TripHeader;
