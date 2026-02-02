import Icon from '@/ui/icon/Icon';

interface OverviewStatsProps {
  duration: number;
  participants: number;
  category: string;
  isPublic: boolean;
}

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

const OverviewStats = ({ duration, participants, category, isPublic }: OverviewStatsProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
      {/* Duration */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Duration</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{duration}</p>
            <p className="text-xs text-gray-500 mt-1">
              {duration === 1 ? 'day' : 'days'}
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
            <p className="text-2xl font-bold text-gray-900 mt-1">{participants}</p>
            <p className="text-xs text-gray-500 mt-1">
              {participants === 1 ? 'person' : 'people'}
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
              {category}
            </p>
            <p className="text-lg mt-1">
              {CATEGORY_EMOJI[category] || '✨'}
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
              {isPublic ? 'Public' : 'Private'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {isPublic ? 'Anyone can see' : 'Members only'}
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <Icon
              name={isPublic ? 'globe' : 'lock'}
              size={24}
              className="text-gray-600"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewStats;
