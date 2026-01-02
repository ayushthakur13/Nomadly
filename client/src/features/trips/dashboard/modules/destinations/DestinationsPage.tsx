import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import DestinationFormModal from './components/DestinationFormModal';
import DestinationList from './components/DestinationList';
import ImageLightbox from './components/ImageLightbox';
import { LocationPreview } from '../../overview/components';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import ErrorAlert from '@/components/common/ErrorAlert';
import PageHeader from '@/components/common/PageHeader';
import Icon from '@/components/icon/Icon';
import { useDynamicForm } from '../../hooks/useDynamicForm';
import { useDestinations, Destination } from './hooks/useDestinations';
import { useImageUpload } from '@/hooks/useImageUpload';
import toast from 'react-hot-toast';

const DestinationsPage = () => {
  const { selectedTrip } = useSelector((state: any) => state.trips || {});
  const tripDestination = selectedTrip?.destinationLocation;
  const tripSource = selectedTrip?.sourceLocation;

  const {
    destinations,
    loading,
    error,
    stats,
    hoverId,
    setHoverId,
    activeId,
    createDestination,
    updateDestination,
    deleteDestination,
    reorder,
    changeImage,
    removeImage,
  } = useDestinations();

  const { isOpen: modalOpen, item: editing, openCreate, openEdit, close: closeModal } = useDynamicForm();
  const [lightbox, setLightbox] = useState<Destination | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Destination | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploadingDestId, setUploadingDestId] = useState<string | null>(null);
  const [pickerOpenForId, setPickerOpenForId] = useState<string | null>(null);
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);

  const { fileInputRef, handleFileChange, openFilePicker, isUploading } = useImageUpload({
    onUploadStart: () => {
      // When upload actually starts (after file is selected), set uploading state
      const destId = pickerOpenForId;
      setUploadingDestId(destId);
      setPickerOpenForId(null);
      return destId; // Return the ID to pass to onUploadSuccess
    },
    onUploadSuccess: async (file, destId) => {
      if (!destId) return;
      try {
        const formData = new FormData();
        formData.append('image', file);
        await changeImage(destId, formData);
        toast.success('Image uploaded successfully');
      } catch (err: any) {
        const errorMsg = err?.response?.data?.message || err?.message || 'Unable to update image';
        setActionError(errorMsg);
        throw err;
      } finally {
        setUploadingDestId(null);
      }
    },
    onUploadError: (message) => {
      setActionError(message);
      setUploadingDestId(null);
      setPickerOpenForId(null);
    },
  });

  const subtext = useMemo(() => {
    const parts: string[] = [];
    parts.push(`${stats.stops} ${stats.stops === 1 ? 'stop' : 'stops'}`);
    if (stats.days) parts.push(`${stats.days} ${stats.days === 1 ? 'day' : 'days'}`);
    return parts.join(' · ');
  }, [stats]);

  const stopMarkers = useMemo(
    () =>
      destinations
        .map((d) => {
          const coords = d.location?.point?.coordinates;
          if (!coords) return null;
          return { coordinates: coords as [number, number], order: d.order, name: d.name };
        })
        .filter(Boolean) as { coordinates: [number, number]; order: number; name?: string }[],
    [destinations]
  );

  const handleSubmit = async (payload: any) => {
    setActionError(null);
    try {
      if (editing) await updateDestination(editing._id, payload);
      else await createDestination(payload);
    } catch (err: any) {
      setActionError(err?.message || 'Unable to save stop');
      throw err;
    }
  };

  const handleDelete = (destination: Destination) => {
    setDeleteTarget(destination);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setActionError(null);
    setIsDeleting(true);
    try {
      await deleteDestination(deleteTarget._id);
      setDeleteTarget(null);
    } catch (err: any) {
      setActionError(err?.message || 'Unable to delete');
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    if (isDeleting) return;
    setDeleteTarget(null);
  };

  const handleImage = (destination: Destination) => {
    setPickerOpenForId(destination._id);
    openFilePicker();
  };

  const handleRemoveImage = async (destination: Destination) => {
    try {
      setDeletingImageId(destination._id);
      await removeImage(destination._id);
      toast.success('Image removed');
    } catch (err: any) {
      setActionError(err?.message || 'Unable to remove image');
    } finally {
      setDeletingImageId(null);
    }
  };

  const showEmpty = !loading && destinations.length === 0;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6 h-full">
      {/* Left pane */}
      <div className="flex flex-col gap-4">
        <PageHeader
          label="Stops"
          title="Itinerary"
          subtitle={subtext || 'Shape how this journey unfolds.'}
          action={{ label: 'Add stop', onClick: openCreate, icon: <Icon name="add" size={20} /> }}
        />

        <ErrorAlert error={error || actionError} />

        {loading && destinations.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-gray-600 flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600" />
            Loading your stops...
          </div>
        )}

        {showEmpty ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Icon name="mapPin" size={24} className="text-emerald-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Start shaping your journey</h3>
            <p className="text-gray-600 mb-6">Add your first stop to ground this trip on the map.</p>
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
            >
              <Icon name="add" size={16} /> Add first stop
            </button>
          </div>
        ) : (
          <DestinationList
            destinations={destinations}
            activeId={activeId}
            hoverId={hoverId}
            onHover={setHoverId}
            onEdit={openEdit}
            onDelete={handleDelete}
            onImage={handleImage}
            onOpenImage={(d) => setLightbox(d)}
            onRemoveImage={handleRemoveImage}
            onReorder={reorder}
            uploadingImageId={uploadingDestId}
            pickerOpenForId={pickerOpenForId}
            deletingImageId={deletingImageId}
          />
        )}
      </div>

      {/* Right pane - Map preview with header */}
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.12em] text-gray-500">Map</p>
          <h2 className="text-2xl font-semibold text-gray-900">Location Preview</h2>
          <p className="text-sm text-gray-500">Spatial context for your stops</p>
        </div>

        <LocationPreview
          destinationLocation={tripDestination}
          sourceLocation={tripSource}
          stops={stopMarkers}
          hasDestinations={destinations.length > 0}
          onAddStops={showEmpty ? openCreate : undefined}
        />
      </div>

      <DestinationFormModal
        open={modalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        initial={editing}
        tripDestination={tripDestination}
      />

      <ConfirmationModal
        isOpen={Boolean(deleteTarget)}
        title="Delete stop"
        description={`Are you sure you want to remove ${deleteTarget?.name || 'this stop'} from the itinerary? This cannot be undone.`}
        confirmText="Delete stop"
        cancelText="Keep stop"
        isDangerous
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      {lightbox?.imageUrl && (
        <ImageLightbox
          src={lightbox.imageUrl}
          title={lightbox.name}
          onClose={() => setLightbox(null)}
        />
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

    </div>
  );
};

export default DestinationsPage;

