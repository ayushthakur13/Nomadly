import { useMemo } from 'react';
import Icon from '../icon/Icon';

interface OverviewProps {
  trip: {
    tripName: string;
    mainDestination: string;
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

const TripOverview = ({ trip }: OverviewProps) => {
  // Calculate trip stats
  const stats = useMemo(() => {
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const durationDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const participantCount = trip.participants?.length || 1;

    return {
      duration: durationDays,
      participants: participantCount,
    };
  }, [trip.startDate, trip.endDate, trip.participants]);

  const CATEGORY_EMOJI: Record<string, string> = {
    adventure: '🗻',
    leisure: '🏖️',
    business: '💼',
    family: '👨‍👩‍👧‍👦',
    solo: '🧳',
    couple: '💑',
    friends: '👯',
    backpacking: '🎒',
    luxury: '✨',
    budget: '💰',
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Key Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {/* Duration */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Duration</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.duration}</p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.duration === 1 ? 'day' : 'days'}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Icon name="calendar" size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        {/* Participants */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Travelers</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.participants}</p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.participants === 1 ? 'person' : 'people'}
              </p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg">
              <Icon name="users" size={24} className="text-emerald-600" />
            </div>
          </div>
        </div>

        {/* Category */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Vibe</p>
              <p className="text-sm font-semibold text-gray-900 mt-1 capitalize">
                {trip.category}
              </p>
              <p className="text-lg mt-1">
                {CATEGORY_EMOJI[trip.category] || '✨'}
              </p>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Visibility</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">
                {trip.isPublic ? 'Public' : 'Private'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {trip.isPublic ? 'Anyone can see' : 'Members only'}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <Icon
                name={trip.isPublic ? 'globe' : 'lock'}
                size={24}
                className="text-gray-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Trip Description */}
      {trip.description && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">About this trip</h2>
          <p className="text-gray-600 whitespace-pre-line">{trip.description}</p>
        </div>
      )}

      {/* Quick Start Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Add Destinations Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer group">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2.5 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
              <Icon name="map" size={20} className="text-blue-600" />
            </div>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Plan your route</h3>
          <p className="text-sm text-gray-600 mb-4">
            Add stops and destinations to map out your journey
          </p>
          <div className="text-xs font-medium text-blue-600">View Route →</div>
        </div>

        {/* Add Tasks Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer group">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2.5 bg-emerald-50 rounded-lg group-hover:bg-emerald-100 transition-colors">
              <Icon name="checkSquare" size={20} className="text-emerald-600" />
            </div>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Create tasks</h3>
          <p className="text-sm text-gray-600 mb-4">
            Keep everyone aligned on what needs to happen
          </p>
          <div className="text-xs font-medium text-emerald-600">View Tasks →</div>
        </div>

        {/* Set Budget Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer group">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2.5 bg-amber-50 rounded-lg group-hover:bg-amber-100 transition-colors">
              <Icon name="dollarSign" size={20} className="text-amber-600" />
            </div>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Track budget</h3>
          <p className="text-sm text-gray-600 mb-4">
            Plan expenses and keep spending on track
          </p>
          <div className="text-xs font-medium text-amber-600">View Budget →</div>
        </div>
      </div>

      {/* Empty State or Content Placeholder */}
      <div className="mt-8 p-8 bg-gradient-to-br from-blue-50 to-emerald-50 rounded-lg border border-blue-100">
        <h3 className="font-semibold text-gray-900 mb-2">Getting started</h3>
        <p className="text-sm text-gray-600 mb-4">
          Your trip is ready to go. Start planning by adding destinations, tasks, and inviting travelers.
        </p>
      </div>
    </div>
  );
};

export default TripOverview;
