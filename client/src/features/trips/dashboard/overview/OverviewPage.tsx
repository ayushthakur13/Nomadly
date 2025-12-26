import { OverviewStats, QuickStartCard, NextSteps } from './components';
import { useOverviewMetrics } from './hooks';

interface OverviewPageProps {
  trip: {
    tripName: string;
    destinationLocation?: {
      name: string;
    };
    mainDestination?: string;
    startDate: string;
    endDate: string;
    category: string;
    description?: string;
    isPublic: boolean;
    participants?: any[];
    coverImageUrl?: string;
    createdBy: {
      _id: string;
      name?: string;
      username: string;
    };
  };
}

const OverviewPage = ({ trip }: OverviewPageProps) => {
  const metrics = useOverviewMetrics(trip);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <OverviewStats
        duration={metrics.duration}
        participants={metrics.participants}
        category={trip.category}
        isPublic={trip.isPublic}
      />

      {/* Trip Description */}
      {trip.description && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">About this trip</h2>
          <p className="text-gray-600 whitespace-pre-line">{trip.description}</p>
        </div>
      )}

      {/* Quick Start Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <QuickStartCard
          icon="map"
          iconColor="text-blue-600"
          title="Plan your route"
          description="Add stops and destinations to map out your journey"
          actionText="View Route"
          actionColor="text-blue-600"
        />
        <QuickStartCard
          icon="checkSquare"
          iconColor="text-emerald-600"
          title="Create tasks"
          description="Keep everyone aligned on what needs to happen"
          actionText="View Tasks"
          actionColor="text-emerald-600"
        />
        <QuickStartCard
          icon="dollarSign"
          iconColor="text-amber-600"
          title="Track budget"
          description="Plan expenses and keep spending on track"
          actionText="View Budget"
          actionColor="text-amber-600"
        />
      </div>

      <NextSteps />
    </div>
  );
};

export default OverviewPage;
