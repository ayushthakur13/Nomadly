import { format, differenceInCalendarDays } from 'date-fns';
import clsx from 'clsx';
import Icon from '@/components/icon/Icon';
import ImageButton from '@/components/common/ImageButton';
import { Destination } from '../hooks/useDestinations';

interface DestinationCardProps {
  destination: Destination;
  isActive: boolean;
  isHovered: boolean;
  onHover: (id: string | null) => void;
  onEdit: (destination: Destination) => void;
  onDelete: (destination: Destination) => void;
  onImage: (destination: Destination) => void;
  onOpenImage: (destination: Destination) => void;
  onRemoveImage: (destination: Destination) => void;
  onDragStart: (id: string) => void;
  onDragOver: (id: string) => void;
  onDrop: (id: string) => void;
  isUploadingImage?: boolean;
  isPickerOpen?: boolean;
  isDeletingImage?: boolean;
}

const formatRange = (start?: string, end?: string) => {
  if (!start && !end) return 'Dates not set';
  if (start && end) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const nights = Math.max(0, differenceInCalendarDays(endDate, startDate));
    const nightsLabel = nights > 0 ? `${nights} night${nights === 1 ? '' : 's'}` : 'Same day';
    return `${format(startDate, 'MMM d')} → ${format(endDate, 'MMM d')} • ${nightsLabel}`;
  }
  if (start) return `${format(new Date(start), 'MMM d')} • Arrival`;
  return `${format(new Date(end as string), 'MMM d')} • Departure`;
};

const DestinationCard = ({
  destination,
  isActive,
  isHovered,
  onHover,
  onEdit,
  onDelete,
  onImage,
  onOpenImage,
  onRemoveImage,
  onDragStart,
  onDragOver,
  onDrop,
  isUploadingImage = false,
  isPickerOpen = false,
  isDeletingImage = false,
}: DestinationCardProps) => {
  const hasNotes = Boolean(destination.notes && destination.notes.trim().length > 0);
  const hasImage = Boolean(destination.imageUrl);

  return (
    <div
      className={clsx(
        'group relative rounded-xl border border-gray-200 bg-white/90 backdrop-blur-sm shadow-sm transition-all duration-150',
        isActive ? 'ring-2 ring-emerald-500 shadow-lg' : 'hover:shadow-md'
      )}
      draggable
      onDragStart={() => onDragStart(destination._id)}
      onDragOver={(e) => { e.preventDefault(); onDragOver(destination._id); }}
      onDrop={(e) => { e.preventDefault(); onDrop(destination._id); }}
      onMouseEnter={() => onHover(destination._id)}
      onMouseLeave={() => onHover(null)}
    >
      <div className="flex items-start gap-3 p-4">
        {/* Drag handle */}
        <button
          className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-emerald-600 mt-1"
          title="Drag to reorder"
          onMouseDown={() => onDragStart(destination._id)}
        >
          <Icon name="grip" size={16} className="text-current" />
        </button>

        {/* Order indicator */}
        <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 font-semibold flex items-center justify-center shadow-inner">
          {destination.order + 1}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-wide text-gray-400">Stop</p>
              <h3 className="text-lg font-semibold text-gray-900 leading-tight line-clamp-1">{destination.name}</h3>
              {destination.location?.name && (
                <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                  <Icon name="mapPin" size={16} className="text-emerald-600" />
                  <span className="line-clamp-1">{destination.location.name}</span>
                </div>
              )}
            </div>

            {hasImage && (
              <ImageButton
                src={destination.imageUrl}
                alt={destination.name}
                onClick={() => onOpenImage(destination)}
                onDelete={() => onRemoveImage(destination)}
                isLoading={isUploadingImage}
                isDeletingImage={isDeletingImage}
                size="sm"
              />
            )}
          </div>

          <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
            <Icon name="calendar" size={16} className="text-emerald-600" />
            <span>{formatRange(destination.arrivalDate, destination.departureDate)}</span>
          </div>

          {hasNotes && (
            <div className="mt-2 rounded-lg border border-amber-100 bg-amber-50/70 px-3 py-2 text-sm text-amber-900 flex items-start gap-2">
              <Icon name="notes" size={16} className="mt-0.5 text-amber-700" />
              <p className="flex-1 leading-relaxed line-clamp-3">{destination.notes}</p>
            </div>
          )}
        </div>

        {/* Actions (hover) */}
        <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            className="p-2 rounded-lg bg-gray-50 hover:bg-emerald-50 text-gray-600 hover:text-emerald-700"
            title="Edit destination"
            onClick={() => onEdit(destination)}
          >
            <Icon name="pencil" size={16} className="text-current" />
          </button>
          <button
            className="p-2 rounded-lg bg-gray-50 hover:bg-indigo-50 text-gray-600 hover:text-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed relative"
            title={hasImage ? 'Change image' : 'Add image'}
            onClick={() => onImage(destination)}
            disabled={isUploadingImage || isPickerOpen}
          >
            {isUploadingImage ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-600 border-t-transparent" />
            ) : (
              <Icon name="image" size={16} className="text-current" />
            )}
          </button>
          <button
            className="p-2 rounded-lg bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-600"
            title="Delete destination"
            onClick={() => onDelete(destination)}
          >
            <Icon name="delete" size={16} className="text-current" />
          </button>
        </div>
      </div>

      {/* Hover accent */}
      <div
        className={clsx(
          'absolute inset-0 rounded-xl pointer-events-none transition ring-1',
          isHovered ? 'ring-emerald-200' : 'ring-transparent'
        )}
      />
    </div>
  );
};

export default DestinationCard;
