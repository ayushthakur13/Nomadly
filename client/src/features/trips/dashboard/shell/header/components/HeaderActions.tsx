import Icon from '@/components/icon/Icon';
import ThreeDotMenu from '@/components/common/ThreeDotMenu';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import EditTripModal from '@/components/common/EditTripModal';

interface HeaderActionsProps {
  trip: {
    _id: string;
    tripName: string;
    isPublic: boolean;
    description?: string;
    category?: string;
    sourceLocation?: any;
    destinationLocation?: any;
    startDate: string;
    endDate: string;
  };
  isOwner: boolean;
  isMenuOpen: boolean;
  onMenuToggle: (open: boolean) => void;
  menuRef: React.RefObject<HTMLDivElement>;
  onEditClick: () => void;
  onPublishToggle: () => void;
  onShare: () => void;
  onDeleteConfirm: () => void;
  showDeleteConfirm: boolean;
  deleteLoading: boolean;
  onDeleteCancel: () => void;
  onDeleteConfirmed: () => void;
  showEditModal: boolean;
  onEditModalClose: () => void;
  updateLoading: boolean;
  onEditSave: (updates: any) => Promise<void>;
}

const HeaderActions = ({
  trip,
  isOwner,
  isMenuOpen,
  onMenuToggle,
  menuRef,
  onEditClick,
  onPublishToggle,
  onShare,
  onDeleteConfirm,
  showDeleteConfirm,
  deleteLoading,
  onDeleteCancel,
  onDeleteConfirmed,
  showEditModal,
  onEditModalClose,
  updateLoading,
  onEditSave,
}: HeaderActionsProps) => {
  if (!isOwner) return null;

  return (
    <>
      <div className="flex items-center gap-1.5 flex-shrink-0" ref={menuRef}>
        <button
          onClick={onEditClick}
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
          onClick={onShare}
          className="p-2.5 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
          title="Share trip"
        >
          <Icon name="share" size={18} />
        </button>

        <ThreeDotMenu
          isOpen={isMenuOpen}
          onOpenChange={onMenuToggle}
          actions={[{
            label: 'Delete trip',
            icon: 'delete',
            onClick: onDeleteConfirm,
            variant: 'danger',
            disabled: deleteLoading,
          }]}
        />
      </div>

      <EditTripModal
        isOpen={showEditModal}
        trip={trip}
        isLoading={updateLoading}
        onClose={onEditModalClose}
        onSave={onEditSave}
      />

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        title="Delete trip"
        description={`Are you sure you want to delete "${trip.tripName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous={true}
        isLoading={deleteLoading}
        onConfirm={onDeleteConfirmed}
        onCancel={() => !deleteLoading && onDeleteCancel()}
      />
    </>
  );
};

export default HeaderActions;
