import { useState } from 'react';
import type { Memory } from '@/services/memories.service';
import { Icon } from '@/ui/icon';

interface MemoryCardProps {
  memory: Memory;
  currentUserId: string;
  isTripOwner: boolean;
  onDelete: (id: string) => void;

  onEditCaption: (id: string, caption: string) => Promise<void>;
  onSelect: () => void;
}

export const MemoryCard = ({
  memory,
  currentUserId,
  isTripOwner,
  onDelete,
  onEditCaption,
  onSelect,
}: MemoryCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [captionText, setCaptionText] = useState(memory.caption || '');
  const [isSaving, setIsSaving] = useState(false);

  const uploaderId = memory.uploadedBy?._id || (memory.uploadedBy as any);
  const isUploader = uploaderId && currentUserId && uploaderId.toString() === currentUserId.toString();
  const canDelete = isUploader || isTripOwner;
  const canEdit = isUploader || isTripOwner;

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleSaveCaption = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSaving(true);
    try {
      await onEditCaption(memory._id, captionText);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCaptionText(memory.caption || '');
    setIsEditing(false);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(memory._id);
  };


  return (
    <div
      onClick={onSelect}
      className="group relative aspect-square overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 shadow-sm cursor-pointer hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5"
    >
      {/* Image rendering */}
      <img
        src={memory.url}
        alt={memory.caption || 'Trip photo'}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4 text-white">
        {/* Top bar: Uploaded user info & actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {memory.uploadedBy?.profilePicUrl ? (
              <img
                src={memory.uploadedBy.profilePicUrl}
                alt={memory.uploadedBy.username}
                className="h-6 w-6 rounded-full object-cover border border-white/20"
              />
            ) : (
              <div className="h-6 w-6 rounded-full bg-emerald-600 flex items-center justify-center text-[10px] font-bold border border-white/20">
                {memory.uploadedBy?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            <span className="text-xs font-medium truncate max-w-[120px]">
              {memory.uploadedBy?.username || 'Uploader'}
            </span>
          </div>

          <div className="flex gap-1.5">
            {canEdit && !isEditing && (
              <button
                onClick={handleEditClick}
                className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white/90 hover:text-white transition-colors"
                title="Edit caption"
              >
                <Icon name="edit" size={14} />
              </button>
            )}
            {canDelete && (
              <button
                onClick={handleDeleteClick}
                className="p-1.5 rounded-full bg-red-600/60 hover:bg-red-600 text-white transition-colors"
                title="Delete photo"
              >
                <Icon name="delete" size={14} />
              </button>
            )}

          </div>
        </div>

        {/* Bottom bar: Caption form or display */}
        <div onClick={(e) => e.stopPropagation()} className="mt-auto">
          {isEditing ? (
            <form onSubmit={handleSaveCaption} className="flex flex-col gap-2">
              <input
                type="text"
                value={captionText}
                onChange={(e) => setCaptionText(e.target.value)}
                className="w-full bg-black/40 border border-white/20 rounded px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="Write a caption..."
                autoFocus
                disabled={isSaving}
              />
              <div className="flex justify-end gap-1.5">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-2 py-0.5 rounded text-[10px] bg-black/40 hover:bg-black/60 text-white"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-2 py-0.5 rounded text-[10px] bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          ) : (
            memory.caption && (
              <p className="text-sm font-medium line-clamp-2 drop-shadow-sm text-gray-100">
                {memory.caption}
              </p>
            )
          )}
        </div>
      </div>
    </div>
  );
};
export default MemoryCard;
