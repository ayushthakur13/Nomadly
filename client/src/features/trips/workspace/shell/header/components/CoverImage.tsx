import { Icon } from '@/ui/icon/';
import { ImageButton } from '@/ui/common/';
import tripCover from '@/assets/illustrations/default-trip-cover.webp';

interface CoverImageProps {
  coverImageUrl?: string;
  tripName: string;
  isOwner: boolean;
  coverLoading: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  onViewImage: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

const CoverImage = ({
  coverImageUrl,
  tripName,
  isOwner,
  coverLoading,
  onFileChange,
  onRemove,
  onViewImage,
  fileInputRef,
}: CoverImageProps) => {
  return (
    <div className="relative flex-shrink-0">
      {isOwner ? (
        <div className="relative group">
          <ImageButton
            src={coverImageUrl || tripCover}
            alt={tripName}
            onClick={onViewImage}
            onDelete={coverImageUrl ? onRemove : undefined}
            isLoading={coverLoading}
            size="md"
            showDeleteButton={!!coverImageUrl}
          />

          {/* Edit button overlay - always visible on hover */}
          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-end justify-end p-2 pointer-events-none">
            <button
              type="button"
              className="pointer-events-auto p-2 bg-white/90 hover:bg-white rounded-md shadow-sm text-emerald-600 transition-all disabled:opacity-60"
              title="Change cover"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              disabled={coverLoading}
            >
              <Icon name="edit2" size={16} />
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={onFileChange}
          />
        </div>
      ) : (
        <div className="w-32 h-24 sm:w-36 rounded-lg overflow-hidden border border-gray-200 shadow-sm cursor-pointer" onClick={onViewImage}>
          <img
            src={coverImageUrl || tripCover}
            alt={tripName}
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </div>
  );
};

export default CoverImage;
