import { ReactNode } from 'react';
import TripHeader from '@/features/trips/dashboard/shell/header/TripHeader';
import TripSidebar from '@/features/trips/dashboard/shell/sidebar/TripSidebar';

interface TripLayoutProps {
  trip: any;
  isOwner: boolean;
  onEditClick: () => void;
  onPublishToggle: () => void;
  onDeleteClick: () => void;
  children: ReactNode;
}

const TripLayout = ({
  trip,
  isOwner,
  onEditClick,
  onPublishToggle,
  onDeleteClick,
  children,
}: TripLayoutProps) => {
  return (
    <div className="TripWorkspace h-full flex-1 min-h-0 flex flex-col gap-6 overflow-hidden px-6 pt-6 pb-0">
      {/* Header: never scrolls */}
      <div className="flex-none">
        <TripHeader
          trip={trip}
          isOwner={isOwner}
          onEditClick={onEditClick}
          onPublishToggle={onPublishToggle}
          onDeleteClick={onDeleteClick}
        />
      </div>

      {/* Body: fills remaining space */}
      <div className="TripBody flex flex-1 min-h-0 gap-6 overflow-hidden items-stretch">
        {/* Sidebar: fixed inside workspace */}
        <TripSidebar />

        {/* Content area */}
        <section className="TripContent flex flex-col flex-1 min-w-0 min-h-0 overflow-hidden">
          {/* This is the ONLY scroll container */}
          <div className="flex-1 min-h-0 overflow-y-auto pr-6 pb-6">
            {children}
          </div>
        </section>
      </div>
    </div>
  );
};

export default TripLayout;
