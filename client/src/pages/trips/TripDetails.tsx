import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchTripById,
  updateTrip,
  deleteTrip,
  updateTripCover,
  deleteTripCover,
  publishTrip,
  unpublishTrip
} from '../../store/tripsSlice';
import Navbar from '../../components/common/PublicNavbar';
import Footer from '../../components/common/Footer';
import toast from 'react-hot-toast';

const TripDetails = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedTrip: trip, loading, error } = useSelector((state: any) => state.trips);
  const { user } = useSelector((state: any) => state.auth);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    tripName: '',
    mainDestination: '',
    startDate: '',
    endDate: '',
    category: '',
    description: ''
  });
  const [coverAction, setCoverAction] = useState<null | 'upload' | 'delete'>(null);

  // Fetch trip data
  useEffect(() => {
    if (tripId) {
      dispatch(fetchTripById(tripId) as any);
    }
  }, [dispatch, tripId]);

  // Initialize edit form when trip data is loaded
  useEffect(() => {
    if (trip) {
      setEditForm({
        tripName: trip.tripName,
        mainDestination: trip.mainDestination,
        startDate: new Date(trip.startDate).toISOString().split('T')[0],
        endDate: new Date(trip.endDate).toISOString().split('T')[0],
        category: trip.category,
        description: trip.description || ''
      });
    }
  }, [trip]);

  // Handle cover image upload
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setCoverAction('upload');
      const formData = new FormData();
      formData.append('image', file);
      await dispatch(updateTripCover({ tripId, formData }) as any).unwrap();
      toast.success('Cover image updated successfully');
      // Reset file input
      e.target.value = '';
    } catch (error: any) {
      const errorMsg = error?.message || error?.data?.message || error || 'Failed to update cover image';
      console.error('Cover upload error:', errorMsg);
      toast.error(errorMsg);
      // Reset file input
      e.target.value = '';
    } finally {
      setCoverAction(null);
    }
  };

  // Handle cover image delete
  const handleDeleteCover = async () => {
    try {
      setCoverAction('delete');
      await dispatch(deleteTripCover(tripId!) as any).unwrap();
      toast.success('Cover image removed successfully');
    } catch (error: any) {
      toast.error(error || 'Failed to remove cover image');
    } finally {
      setCoverAction(null);
    }
  };

  // Handle trip update
  const handleUpdateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(updateTrip({ tripId, updates: editForm }) as any).unwrap();
      setIsEditing(false);
      toast.success('Trip updated successfully');
    } catch (error: any) {
      toast.error(error || 'Failed to update trip');
    }
  };

  // Handle trip delete
  const handleDeleteTrip = async () => {
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
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h2>
            <p className="text-gray-600">{error || 'Trip not found'}</p>
            <button
              onClick={() => navigate('/trips')}
              className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Back to My Trips
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isOwner = trip.createdBy._id === user?.id;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="relative h-[300px] rounded-xl overflow-hidden mb-8">
            {/* Cover Image */}
            <img
              src={trip.coverImageUrl || '/images/default-trip.jpg'}
              alt={trip.tripName}
              className="w-full h-full object-cover"
            />
            {coverAction && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
              </div>
            )}
            {isOwner && (
              <div className="absolute top-4 right-4 flex gap-2">
                <label className="px-4 py-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white cursor-pointer transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpload}
                    className="hidden"
                    disabled={!!coverAction}
                  />
                  <i className="fas fa-camera mr-2"></i>
                  Change Cover
                </label>
                {trip.coverImageUrl && (
                  <button
                    onClick={handleDeleteCover}
                    disabled={!!coverAction}
                    className="px-4 py-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors text-red-600"
                  >
                    <i className="fas fa-trash mr-2"></i>
                    Remove
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex items-start justify-between gap-8">
            <div>
              {isEditing ? (
                <form onSubmit={handleUpdateTrip} className="space-y-4 max-w-2xl">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Trip Name
                    </label>
                    <input
                      type="text"
                      value={editForm.tripName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, tripName: e.target.value }))}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Main Destination
                    </label>
                    <input
                      type="text"
                      value={editForm.mainDestination}
                      onChange={(e) => setEditForm(prev => ({ ...prev, mainDestination: e.target.value }))}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={editForm.startDate}
                        onChange={(e) => setEditForm(prev => ({ ...prev, startDate: e.target.value }))}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={editForm.endDate}
                        onChange={(e) => setEditForm(prev => ({ ...prev, endDate: e.target.value }))}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={editForm.category}
                      onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                      required
                    >
                      <option value="">Select a category</option>
                      <option value="adventure">🗻 Adventure</option>
                      <option value="leisure">🏖️ Leisure</option>
                      <option value="business">💼 Business</option>
                      <option value="family">👨‍👩‍👧‍👦 Family</option>
                      <option value="solo">🧳 Solo</option>
                      <option value="couple">💑 Couple</option>
                      <option value="friends">👯 Friends</option>
                      <option value="backpacking">🎒 Backpacking</option>
                      <option value="luxury">✨ Luxury</option>
                      <option value="budget">💰 Budget</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 h-32 resize-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {trip.tripName}
                  </h1>
                  <p className="text-xl text-gray-600 mb-4">
                    {trip.mainDestination}
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
                    <div>
                      <i className="fas fa-calendar mr-2"></i>
                      {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                    </div>
                    <div>
                      <i className="fas fa-tag mr-2"></i>
                      {trip.category}
                    </div>
                    <div>
                      <i className="fas fa-user mr-2"></i>
                      Created by {trip.createdBy.name || trip.createdBy.username}
                    </div>
                  </div>
                  <p className="text-gray-600 whitespace-pre-line">
                    {trip.description || 'No description provided.'}
                  </p>
                </>
              )}
            </div>

            {isOwner && !isEditing && (
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <i className="fas fa-edit mr-2"></i>
                  Edit Trip
                </button>
                <button
                  onClick={handlePublishToggle}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <i className={`fas fa-${trip.isPublic ? 'lock' : 'globe'} mr-2`}></i>
                  {trip.isPublic ? 'Make Private' : 'Publish Trip'}
                </button>
                <button
                  onClick={handleDeleteTrip}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <i className="fas fa-trash mr-2"></i>
                  Delete Trip
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid md:grid-cols-12 gap-8">
        {/* Sidebar */}
        <div className="md:col-span-3 space-y-4">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Trip Stats</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Trip Duration</p>
                <p className="font-medium text-gray-900">
                  {Math.ceil((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Participants</p>
                <p className="font-medium text-gray-900">
                  {trip.participants?.length || 1} traveler{(trip.participants?.length || 1) !== 1 ? 's' : ''}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Trip Status</p>
                <p className="font-medium text-gray-900">
                  {trip.isPublic ? 'Public' : 'Private'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="md:col-span-9">
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Coming Soon</h3>
            <p className="text-gray-600">
              More features like destinations, tasks, budget, accommodations, and memories will be added soon!
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TripDetails;
