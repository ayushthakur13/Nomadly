import type { TripMember } from '@/services/members.service';
import ThreeDotMenu from '@/components/common/ThreeDotMenu';

interface MemberCardProps {
  member: TripMember;
  currentUserId?: string;
  canRemove: boolean;
  canLeave: boolean;
  onRemove: (userId: string) => void;
  onLeave: () => void;
}

export default function MemberCard({
  member,
  currentUserId,
  canRemove,
  canLeave,
  onRemove,
  onLeave,
}: MemberCardProps) {
  const isCurrentUser = member.userId === currentUserId;
  const isCreator = member.role === 'creator';

  const cardClasses = `flex items-center gap-4 p-4 border rounded-lg transition-colors bg-white hover:border-gray-300 ${
    isCurrentUser ? 'border-emerald-200 bg-emerald-50' : 'border-gray-200'
  }`;

  const initials = member.name
    ? member.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : member.username?.slice(0, 2).toUpperCase() || '??';

  return (
    <div className={cardClasses}>
      {/* Avatar */}
      <div className="flex-shrink-0">
        {member.profilePicUrl ? (
          <img
            src={member.profilePicUrl}
            alt={member.name || member.username}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
            {initials}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-gray-900 truncate">
            {member.name || member.username}
            {isCurrentUser && <span className="text-sm text-emerald-700 ml-1">(You)</span>}
          </p>
          <span
            className={`px-2 py-0.5 text-xs font-medium rounded-full ${
              isCreator
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {isCreator ? 'Creator' : 'Member'}
          </span>
        </div>
        {member.username && member.name && (
          <p className="text-sm text-gray-500">@{member.username}</p>
        )}
        <p className="text-xs text-gray-400 mt-1">
          Joined {new Date(member.joinedAt).toLocaleDateString()}
        </p>
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 flex items-center gap-2">
        {/* Three-dot menu for creator */}
        {canRemove && (
          <ThreeDotMenu
            visible={canRemove}
            actions={[{
              label: 'Remove Member',
              icon: 'userMinus',
              onClick: () => onRemove(member.userId),
              variant: 'danger',
            }]}
          />
        )}

        {/* Leave button for current non-creator user */}
        {canLeave && (
          <button
            onClick={onLeave}
            className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            Leave Trip
          </button>
        )}
      </div>
    </div>
  );
}
