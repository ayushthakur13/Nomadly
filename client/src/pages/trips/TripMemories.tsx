import { useParams } from 'react-router-dom';

const TripMemories = () => {
  const { tripId } = useParams<{ tripId: string }>();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Memories</h2>
        <p className="text-gray-600 mb-4">Coming soon</p>
        <p className="text-sm text-gray-500">Share photos, stories, and memories from your trip.</p>
      </div>
    </div>
  );
};

export default TripMemories;
