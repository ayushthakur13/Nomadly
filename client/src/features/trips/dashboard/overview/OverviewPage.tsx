import { QuickInfoStrip, TimelineSnapshot, RoutePreview, NeedsAttention, PlanningStatus, QuickAccessCards } from './components';
import { useOverviewMetrics, useQuickInfo, useTimelineProgress, useNeedsAttention, usePlanningStatus, useQuickAccessCards } from './hooks';
import { useTripStatus } from '@/features/trips/dashboard/domain/hooks/useTripStatus';
import { useNavigate } from 'react-router-dom';

interface OverviewPageProps {
  trip: {
    _id: string;
    tripName: string;
    sourceLocation?: {
      name: string;
    };
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
  const { statusInfo } = useTripStatus(trip.startDate, trip.endDate);
  const stage = statusInfo.status as 'Upcoming' | 'Ongoing' | 'Past';
  const navigate = useNavigate();

  const { items: quickInfoItems } = useQuickInfo(trip, metrics);
  const { model: timelineModel } = useTimelineProgress(trip.startDate, trip.endDate);
  const { items: attentionItems } = useNeedsAttention(trip, stage);
  const { rows, states } = usePlanningStatus(trip);
  const { cards } = useQuickAccessCards(trip._id, stage, states);

  return (
    <div className="max-w-5xl mx-auto py-1">
      {/* Section 1: Quick Info Strip (context) */}
      <QuickInfoStrip items={quickInfoItems} />

      {/* Section 2 & 3: Timeline Snapshot (left) + Route Preview (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <TimelineSnapshot model={timelineModel} />
        <RoutePreview
          sourceLocation={trip.sourceLocation?.name}
          destinationName={trip.destinationLocation?.name || trip.mainDestination}
          onAddStops={() => navigate(`/trips/${trip._id}/destinations`)}
        />
      </div>

      {/* Section 4: Needs Attention */}
      {stage !== 'Past' && <NeedsAttention items={attentionItems} />}

      {/* Section 5: Planning Progress (compact) */}
      <div className="mb-6">
        <PlanningStatus rows={rows} />
      </div>

      {/* Section 6: Quick Access Cards (contextual) */}
      <QuickAccessCards cards={cards} />
    </div>
  );
};

export default OverviewPage;
