import { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchTripById,
  publishTrip,
  unpublishTrip,
  deleteTrip
} from '../../store/tripsSlice';
import AppLayout from '../../components/layout/AppLayout';
import { TripLayout, TripOverview } from '../../components/trip-dashboard';
import TripDestinations from './TripDestinations';
import TripTasks from './TripTasks';
import TripBudget from './TripBudget';
import TripAccommodations from './TripAccommodations';
import TripMembers from './TripMembers';
import TripMemories from './TripMemories';
import TripChat from './TripChat';
import toast from 'react-hot-toast';

const TripDashboard = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedTrip: trip, loading, error } = useSelector((state: any) => state.trips);
  const { user } = useSelector((state: any) => state.auth);

  // Fetch trip data
  useEffect(() => {
    if (tripId) {
      dispatch(fetchTripById(tripId) as any);
    }
  }, [dispatch, tripId]);

  // Handle trip delete
  const handleDeleteTrip = async () => {
    const confirmed = window.confirm('Are you sure you want to delete this trip?');
    if (!confirmed) return;

    try {
      await dispatch(deleteTrip(tripId!) as any).unwrap();
      toast.success('Trip deleted successfully');
      navigate('/trips');
    } catch (error: any) {
      toast.error(error || 'Failed to delete trip');
    }
  };

  // Handle trip publish/unpublish
  const handlePublishToggle = async () => {
    try {
      if (trip.isPublic) {
        await dispatch(unpublishTrip(tripId!) as any).unwrap();
        toast.success('Trip unpublished successfully');
      } else {
        await dispatch(publishTrip(tripId!) as any).unwrap();
        toast.success('Trip published successfully');
      }
    } catch (error: any) {
      toast.error(error || `Failed to ${trip.isPublic ? 'unpublish' : 'publish'} trip`);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-[calc(100vh-4rem)] bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading trip dashboard...</p>
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
              onClick={() => navigate('/trips')}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Back to My Trips
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const isOwner = trip.createdBy._id === user?.id;

  // Determine which content to show based on current route
  const renderContent = () => {
    const path = location.pathname.replace(`/trips/${tripId}`, '');

    switch (path) {
      case '/destinations':
        return <TripDestinations />;
      case '/tasks':
        return <TripTasks />;
      case '/budget':
        return <TripBudget />;
      case '/accommodations':
        return <TripAccommodations />;
      case '/members':
        return <TripMembers />;
      case '/memories':
        return <TripMemories />;
      case '/chat':
        return <TripChat />;
      default:
        return <TripOverview trip={trip} />;
    }
  };

  return (
    <AppLayout>
      <TripLayout
        trip={trip}
        isOwner={isOwner}
        onEditClick={() => {}}
        onPublishToggle={handlePublishToggle}
        onDeleteClick={handleDeleteTrip}
      >
        {renderContent()}
      </TripLayout>
    </AppLayout>
  );
};

export default TripDashboard;
