import clsx from 'clsx';
import Icon from '@/components/icon/Icon';

interface ImageButtonProps {
  src?: string;
  alt: string;
  onClick: () => void;
  onDelete?: () => void;
  isLoading?: boolean;
  isDeletingImage?: boolean;
  size?: 'sm' | 'md' | 'lg'; // sm: 56px, md: 120px, lg: custom
  className?: string;
  showDeleteButton?: boolean;
}

const ImageButton = ({
  src,
  alt,
  onClick,
  onDelete,
  isLoading = false,
  isDeletingImage = false,
  size = 'md',
  className,
  showDeleteButton = true,
}: ImageButtonProps) => {
  const sizeClasses = {
    sm: 'w-14 h-14',
    md: 'w-32 h-24 sm:w-36',
    lg: '',
  };

  return (
    <div className={clsx('relative group/image', size === 'lg' && className)}>
      <button
        type="button"
        onClick={onClick}
        disabled={isLoading || isDeletingImage}
        className={clsx(
          'rounded-lg overflow-hidden shadow-sm border border-gray-200 bg-gray-50',
          'focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all',
          'disabled:opacity-60 disabled:cursor-not-allowed',
          sizeClasses[size],
          size === 'lg' && className
        )}
      >
        {src ? (
          <img src={src} alt={alt} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
            <Icon name="image" size={size === 'sm' ? 20 : 32} className="text-gray-300" />
          </div>
        )}

        {(isLoading || isDeletingImage) && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
          </div>
        )}
      </button>

      {/* Delete button - appears on hover */}
      {showDeleteButton && onDelete && src && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          disabled={isDeletingImage}
          className={clsx(
            'absolute rounded-lg text-current transition-all duration-150',
            'opacity-0 group-hover/image:opacity-100',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'focus:outline-none',
            size === 'sm' && 'p-1.5 bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-600 top-1 right-1',
            size === 'md' && 'p-2 bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-600 top-2 right-2',
            size === 'lg' && 'p-2 bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-600 top-2 right-2'
          )}
          title="Remove image"
        >
          {isDeletingImage ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-600 border-t-transparent" />
          ) : (
            <Icon name="delete" size={size === 'sm' ? 14 : size === 'md' ? 16 : 18} className="text-current" />
          )}
        </button>
      )}
    </div>
  );
};

export default ImageButton;
