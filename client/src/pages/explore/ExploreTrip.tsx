import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Navbar from '../../components/common/PublicNavbar';
import Footer from '../../components/common/Footer';
import toast from 'react-hot-toast';

const ExploreTrip = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/trips/public/${tripId}`);
        setTrip(response.data.trip);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to fetch trip details');
        toast.error(err.response?.data?.error || 'Failed to fetch trip details');
      } finally {
        setLoading(false);
      }
    };
    if (tripId) fetchTrip();
  }, [tripId]);

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="relative h-[300px] rounded-xl overflow-hidden mb-8">
            <img
              src={trip.coverImageUrl || '/images/default-trip.jpg'}
              alt={trip.tripName}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex items-start justify-between gap-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {trip.tripName}
              </h1>
              <p className="text-xl text-gray-600 mb-4">
                {trip.destinationLocation?.name || trip.mainDestination}
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
            </div>
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
                  Public
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
              More features like destinations, tasks, accommodations, and memories will be available for public trips soon!
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ExploreTrip;
