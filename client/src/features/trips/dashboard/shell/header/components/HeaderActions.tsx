import Icon from '@/components/icon/Icon';
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

        <div className="relative">
          <button
            onClick={() => onMenuToggle(!isMenuOpen)}
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
                onClick={onDeleteConfirm}
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
