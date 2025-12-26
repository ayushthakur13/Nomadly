import { useState } from 'react';
import Icon from '@/components/icon/Icon';
import tripCover from '@/assets/illustrations/default-trip-cover.webp';

interface CoverImageProps {
  coverImageUrl?: string;
  tripName: string;
  isOwner: boolean;
  coverLoading: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

const CoverImage = ({
  coverImageUrl,
  tripName,
  isOwner,
  coverLoading,
  onFileChange,
  onRemove,
  fileInputRef,
}: CoverImageProps) => {
  return (
    <div className="relative group flex-shrink-0">
      <div className="w-32 h-24 sm:w-36 sm:h-24 rounded-lg overflow-hidden border border-gray-100 shadow-sm relative">
        <img
          src={coverImageUrl || tripCover}
          alt={tripName}
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
              onClick={onRemove}
              disabled={coverLoading}
            >
              <Icon name="delete" size={14} />
            </button>
          </div>
        )}
      </div>

      {isOwner && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={onFileChange}
        />
      )}
    </div>
  );
};

export default CoverImage;
