import type { Accommodation } from "@shared/types";
import AccommodationCard from "./AccommodationCard";

interface AccommodationListProps {
  accommodations: Accommodation[];
  canManageAccommodation: (accommodation: Accommodation) => boolean;
  onEdit: (accommodation: Accommodation) => void;
  onDelete: (accommodation: Accommodation) => void;
}

const AccommodationList = ({
  accommodations,
  canManageAccommodation,
  onEdit,
  onDelete,
}: AccommodationListProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {accommodations.map((accommodation) => (
        <AccommodationCard
          key={accommodation._id}
          accommodation={accommodation}
          canManage={canManageAccommodation(accommodation)}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default AccommodationList;
