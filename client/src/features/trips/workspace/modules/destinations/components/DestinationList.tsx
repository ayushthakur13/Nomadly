import { useState } from 'react';
import { Destination } from '@/services/destinations.service';
import DestinationCard from './DestinationCard';

interface DestinationListProps {
  destinations: Destination[];
  activeId: string | null;
  hoverId: string | null;
  onHover: (id: string | null) => void;
  onEdit: (destination: Destination) => void;
  onDelete: (destination: Destination) => void;
  onImage: (destination: Destination) => void;
  onOpenImage: (destination: Destination) => void;
  onRemoveImage: (destination: Destination) => void;
  onReorder: (fromId: string, toId: string) => void;
  uploadingImageId?: string | null;
  pickerOpenForId?: string | null;
  deletingImageId?: string | null;
}

const DestinationList = ({
  destinations,
  activeId,
  hoverId,
  onHover,
  onEdit,
  onDelete,
  onImage,
  onOpenImage,
  onRemoveImage,
  onReorder,
  uploadingImageId,
  pickerOpenForId,
  deletingImageId,
}: DestinationListProps) => {
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const handleDragStart = (id: string) => {
    setDraggingId(id);
  };

  const handleDragOver = (id: string) => {
    if (!draggingId || draggingId === id) return;
    onReorder(draggingId, id);
  };

  const handleDrop = () => {
    setDraggingId(null);
  };

  return (
    <div className="space-y-3">
      {destinations.map((destination) => (
        <DestinationCard
          key={destination._id}
          destination={destination}
          isActive={activeId === destination._id}
          isHovered={hoverId === destination._id}
          onHover={onHover}
          onEdit={onEdit}
          onDelete={onDelete}
          onImage={onImage}
          onOpenImage={onOpenImage}
          onRemoveImage={onRemoveImage}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          isUploadingImage={uploadingImageId === destination._id}
          isPickerOpen={pickerOpenForId === destination._id}
          isDeletingImage={deletingImageId === destination._id}
        />
      ))}
    </div>
  );
};

export default DestinationList;
