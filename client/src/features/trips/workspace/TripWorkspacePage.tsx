import { useParams, Routes, Route } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { AppLayout } from '@/ui/layout/';
import { TripLayout } from '@/features/trips/workspace/shell';
import { OverviewPage } from '@/features/trips/workspace/modules/overview';
import { useTripWorkspaceData, usePublishToggle } from '@/features/trips/_shared/hooks';
import TasksPage from '@/features/trips/workspace/modules/tasks/TasksPage';
import BudgetPage from '@/features/trips/workspace/modules/budget/BudgetPage';
import AccommodationsPage from '@/features/trips/workspace/modules/accommodations/AccommodationsPage';
import MembersPage from '@/features/trips/workspace/modules/members/MembersPage';
import MemoriesPage from '@/features/trips/workspace/modules/memories/MemoriesPage';
import ChatPage from '@/features/trips/workspace/modules/chat/ChatPage';
import DestinationsPage from '@/features/trips/workspace/modules/destinations/DestinationsPage';

const TripWorkspacePage = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const { user } = useSelector((state: any) => state.auth);

  // Fetch trip data
  const { trip, loading, error } = useTripWorkspaceData(tripId);

  // Publish toggle handler
  const { handlePublishToggle } = usePublishToggle(tripId || '', trip?.isPublic || false);

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-[calc(100vh-4rem)] bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading trip workspace...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!trip) {
    return (
      <AppLayout>
        <div className="min-h-[calc(100vh-4rem)] bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Trip not found</h2>
            <p className="text-gray-600 mb-6">{error || 'The trip you are looking for does not exist.'}</p>
            <button
              onClick={() => (window.location.href = '/trips')}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Back to My Trips
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const tripOwnerId = (trip.createdBy as any)?._id ?? trip.createdBy;
  const currentUserId = user?._id;

  const isOwner = Boolean(tripOwnerId && currentUserId && tripOwnerId === currentUserId);

  return (
    <AppLayout>
      <TripLayout
        trip={trip}
        isOwner={isOwner}
        onEditClick={() => {}}
        onPublishToggle={handlePublishToggle}
        onDeleteClick={() => {}}
      >
        <Routes>
          <Route index element={<OverviewPage trip={trip} />} />
          <Route path="destinations" element={<DestinationsPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="budget" element={<BudgetPage />} />
          <Route path="accommodations" element={<AccommodationsPage />} />
          <Route path="members" element={<MembersPage tripId={tripId!} trip={trip} isOwner={isOwner} />} />
          <Route path="memories" element={<MemoriesPage />} />
          <Route path="chat" element={<ChatPage />} />
        </Routes>
      </TripLayout>
    </AppLayout>
  );
};

export default TripWorkspacePage;