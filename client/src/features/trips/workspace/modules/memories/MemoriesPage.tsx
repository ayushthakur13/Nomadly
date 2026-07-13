import { useState } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { useMemories } from './hooks/useMemories';
import { useImageUpload } from '@/hooks/useImageUpload';
import { MemoryCard } from './components/MemoryCard';
import { MemoryLightbox } from './components/MemoryLightbox';
import { Icon } from '@/ui/icon';
import { PageHeader, ConfirmationModal } from '@/ui/common';

export const MemoriesPage = () => {
  const { user } = useSelector((state: any) => state.auth);
  const trip = useSelector((state: any) => state.trips.selectedTrip);
  
  const tripOwnerId = (trip?.createdBy as any)?._id ?? trip?.createdBy;
  const currentUserId = user?._id ?? user?.id;
  const isTripOwner = Boolean(tripOwnerId && currentUserId && tripOwnerId.toString() === currentUserId.toString());

  const {
    memories,
    loading,
    actionLoading,
    uploadMemory,
    deleteMemory,
    updateMemoryCaption,
  } = useMemories();

  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { fileInputRef, handleFileChange, openFilePicker, isUploading } = useImageUpload({
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxSize: 5 * 1024 * 1024, // 5MB limit
    onUploadSuccess: async (file) => {
      try {
        const formData = new FormData();
        formData.append('image', file);
        await uploadMemory(formData);
        toast.success('Photo uploaded successfully');
      } catch (err: any) {
        toast.error(err.message || 'Failed to upload photo');
      }
    },
  });

  const handleDeleteInitiated = (id: string) => {
    setDeleteTargetId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      await deleteMemory(deleteTargetId);
      toast.success('Photo deleted successfully');
      // If lightbox is open and we delete the current index, close it
      if (activeLightboxIndex !== null && memories[activeLightboxIndex]?._id === deleteTargetId) {
        setActiveLightboxIndex(null);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete photo');
    } finally {
      setDeleteTargetId(null);
      setIsDeleting(false);
    }
  };

  const handleEditCaption = async (id: string, caption: string) => {
    try {
      await updateMemoryCaption(id, caption);
      toast.success('Caption updated successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update caption');
    }
  };

  const showEmpty = !loading && memories.length === 0;

  const isBusy = isUploading || actionLoading || isDeleting;
  const loaderText = isUploading 
    ? 'Uploading...' 
    : isDeleting 
      ? 'Deleting...' 
      : 'Saving...';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        className="hidden"
        accept="image/jpeg,image/png,image/webp"
      />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-5">
        <PageHeader
          title="Photos & Memories"
          subtitle={
            memories.length === 1
              ? '1 shared memory'
              : `${memories.length} shared memories`
          }
        />
        
        {/* Upload Button */}
        <button
          onClick={openFilePicker}
          disabled={loading || isBusy}
          className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow active:scale-95 disabled:opacity-50"
        >
          {isBusy ? (
            <>
              <Icon name="loader" size={16} className="animate-spin" />
              <span>{loaderText}</span>
            </>
          ) : (
            <>
              <Icon name="upload" size={16} />
              <span>Upload Photo</span>
            </>
          )}
        </button>
      </div>

      {/* Grid gallery */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center gap-3">
            <Icon name="loader" className="animate-spin text-emerald-600" size={32} />
            <p className="text-sm text-gray-500 font-medium">Loading memories...</p>
          </div>
        </div>
      ) : showEmpty ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm flex flex-col items-center max-w-lg mx-auto mt-6">
          <div className="h-16 w-16 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4">
            <Icon name="image" size={28} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No memories shared yet</h2>
          <p className="text-gray-500 text-sm max-w-sm mb-6">
            Capture and share the best moments of the trip with your travel companions.
          </p>
          <button
            onClick={openFilePicker}
            className="rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 text-sm font-semibold transition-colors duration-200"
          >
            Upload the first photo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Virtual Loader Card when uploading */}
          {isUploading && (
            <div className="aspect-square overflow-hidden rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/20 flex flex-col items-center justify-center p-4 text-center">
              <Icon name="loader" className="animate-spin text-emerald-600 mb-2" size={24} />
              <span className="text-xs font-semibold text-emerald-800">Processing upload...</span>
            </div>
          )}

          {memories.map((memory, index) => (
            <MemoryCard
              key={memory._id}
              memory={memory}
              currentUserId={currentUserId || ''}
              isTripOwner={isTripOwner}
              onDelete={handleDeleteInitiated}
              onEditCaption={handleEditCaption}
              onSelect={() => setActiveLightboxIndex(index)}
            />
          ))}
        </div>
      )}

      {/* Lightbox Modal Carousel */}
      {activeLightboxIndex !== null && (
        <MemoryLightbox
          memories={memories}
          activeIndex={activeLightboxIndex}
          onClose={() => setActiveLightboxIndex(null)}
          onChangeIndex={setActiveLightboxIndex}
        />
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteTargetId !== null}
        title="Delete Photo"
        description="Are you sure you want to permanently delete this photo from the trip? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous={true}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};

export default MemoriesPage;

