import { useState, useRef } from 'react';
import type { TaskCompletion } from '@shared/types';
import type { TripMember } from '@/services/members.service';
import Icon from '@/components/icon/Icon';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';
import { resolveId } from '../utils/idNormalizer';

interface TaskAssigneesProps {
  assignedTo: string[] | null;
  members: TripMember[];
  completions: TaskCompletion[];
  maxVisible?: number;
}

export default function TaskAssignees({
  assignedTo,
  members,
  completions,
  maxVisible = 4,
}: TaskAssigneesProps) {
  const [showViewAllModal, setShowViewAllModal] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal on outside click
  useOnClickOutside(modalRef, () => setShowViewAllModal(false), showViewAllModal);

  const isEveryone = !assignedTo || assignedTo.length === 0;

  // Build member map
  const memberMap = members.reduce<Record<string, TripMember>>((acc, m) => {
    acc[m.userId] = m;
    return acc;
  }, {});

  // Get completion status per user - normalize userId
  const completionMap = completions.reduce<Record<string, boolean>>((acc, c) => {
    const userId = resolveId(c.userId);
    if (userId) {
      acc[userId] = true;
    }
    return acc;
  }, {});

  // Determine which userIds to display
  const targetUserIds = isEveryone
    ? members.map((m) => m.userId).filter(Boolean)
    : assignedTo || [];

  // If no members available for "everyone" fallback, show icon
  if (isEveryone && targetUserIds.length === 0) {
    return (
      <div
        className="flex items-center gap-1.5 text-gray-600"
        title="Assigned to everyone"
      >
        <Icon name="users" size={14} className="text-gray-500" />
        <span className="text-xs text-gray-500">Everyone</span>
      </div>
    );
  }

  const visibleAssignees = targetUserIds.slice(0, maxVisible);
  const remainingCount = Math.max(0, targetUserIds.length - maxVisible);

  // Avatar component
  const AvatarBadge = ({ userId }: { userId: string }) => {
    const member = memberMap[userId];
    const isCompleted = completionMap[userId];
    const name = member?.name || member?.username || 'Unknown';
    const initials = name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    return (
      <div
        key={userId}
        className="relative group"
        title={`${name} ${isCompleted ? '(completed)' : '(not completed)'}`}
      >
        {member?.profilePicUrl ? (
          <img
            src={member.profilePicUrl}
            alt={name}
            className={`w-6 h-6 rounded-full border-2 border-white object-cover transition-opacity ${
              isCompleted ? 'opacity-50' : 'opacity-100'
            }`}
          />
        ) : (
          <div
            className={`w-6 h-6 rounded-full border-2 border-white bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-[9px] font-semibold text-white transition-opacity ${
              isCompleted ? 'opacity-50' : 'opacity-100'
            }`}
          >
            {initials}
          </div>
        )}
        {/* Status indicator - check for completed, nothing for pending */}
        {isCompleted && (
          <div className="absolute -bottom-1 -right-1 bg-emerald-600 rounded-full border border-white p-0.5">
            <Icon name="check" size={8} className="text-white" />
          </div>
        )}
      </div>
    );
  };

  // If expanded, show all assignees
  if (showViewAllModal) {
    return (
      <>
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" />
        <div
          ref={modalRef}
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4 max-h-96 overflow-y-auto z-50"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">All assignees</h3>
            <button
              onClick={() => setShowViewAllModal(false)}
              className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
              aria-label="Close modal"
            >
              <Icon name="close" size={20} />
            </button>
          </div>
          <div className="space-y-2">
            {targetUserIds.map((userId) => {
              const member = memberMap[userId];
              const isCompleted = completionMap[userId];
              const name = member?.name || member?.username || 'Unknown';

              return (
                <div
                  key={userId}
                  className="flex items-center gap-3 p-2 rounded hover:bg-gray-50"
                >
                  {member?.profilePicUrl ? (
                    <img
                      src={member.profilePicUrl}
                      alt={name}
                      className={`w-8 h-8 rounded-full object-cover ${
                        isCompleted ? 'opacity-50' : 'opacity-100'
                      }`}
                    />
                  ) : (
                    <div
                      className={`w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-[10px] font-semibold text-white ${
                        isCompleted ? 'opacity-50' : 'opacity-100'
                      }`}
                    >
                      {name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">{name}</div>
                    <div className={`text-xs font-medium flex items-center gap-1 ${
                      isCompleted 
                        ? 'text-emerald-600' 
                        : 'text-amber-600'
                    }`}>
                      {isCompleted ? (
                        <>
                          <Icon name="check" size={12} />
                          <span>Completed</span>
                        </>
                      ) : (
                        <>
                          <div className="w-1.5 h-1.5 rounded-full bg-current" />
                          <span>Pending</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </>
    );
  }

  // Default collapsed state
  return (
    <div ref={containerRef} className="flex items-center gap-1">
      {visibleAssignees.map((userId) => (
        <AvatarBadge key={userId} userId={userId} />
      ))}
      {remainingCount > 0 && (
        <button
          onClick={() => setShowViewAllModal(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setShowViewAllModal(true);
            }
          }}
          className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[9px] font-semibold text-gray-600 hover:bg-gray-300 transition-colors"
          title={`Show ${remainingCount} more assignees`}
          aria-label={`Show ${remainingCount} more assignees`}
        >
          +{remainingCount}
        </button>
      )}
    </div>
  );
}
