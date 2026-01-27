import { useEffect } from 'react';
import type { Task } from '@shared/types';
import { useTaskFilters } from '../hooks/useTaskFilters';

interface Props {
  tasks: Task[];
  currentUserId: string | null;
  onChange?: (filtered: Task[]) => void;
}

export default function TaskFilters({ tasks, currentUserId, onChange }: Props) {
  const {
    assignmentTab,
    setAssignmentTab,
    statusTab,
    setStatusTab,
    filtered,
    assignmentCounts,
    statusCounts,
  } = useTaskFilters(tasks, currentUserId);

  useEffect(() => { onChange?.(filtered); }, [filtered, onChange]);

  const pills = [
    { key: 'all', label: 'All', count: assignmentCounts.all },
    { key: 'assigned-to-me', label: 'Assigned to me', count: assignmentCounts.assignedToMe, priority: true },
    { key: 'assigned-to-everyone', label: 'Assigned to everyone', count: assignmentCounts.assignedToEveryone },
    { key: 'assigned-to-others', label: 'Assigned to others', count: assignmentCounts.assignedToOthers },
  ];

  return (
    <div className="flex items-center gap-3 m-4">
      {/* Top pills */}
      <div className="flex items-center gap-2 flex-wrap">
        {pills.map(pill => {
          const isActive = assignmentTab === pill.key;
          const isPriority = pill.priority && pill.count > 0;

          return (
            <button
              key={pill.key}
              className={`
                px-3 py-1.5 rounded-full text-sm font-medium transition-all
                ${isActive 
                  ? 'bg-gray-900 text-white shadow-sm' 
                  : isPriority
                    ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
                ${isPriority && !isActive ? 'ring-2 ring-amber-300 ring-opacity-50' : ''}
              `}
              onClick={() => setAssignmentTab(pill.key as any)}
            >
              <span className="flex items-center gap-1.5">
                {isPriority && !isActive && (
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                )}
                {pill.label}
                {pill.count > 0 && (
                  <span className={`
                    ml-0.5 px-1.5 py-0.5 rounded-full text-xs font-semibold
                    ${isActive 
                      ? 'bg-white/20 text-white' 
                      : isPriority
                        ? 'bg-amber-200 text-amber-800'
                        : 'bg-gray-200 text-gray-600'
                    }
                  `}>
                    {pill.count}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* Secondary toggle: Status (independent axis) */}
      <div className="ml-auto flex items-center gap-2">
        {[
          { key: 'all', label: 'All', count: statusCounts.all },
          { key: 'pending', label: 'Pending', count: statusCounts.pending },
          { key: 'completed', label: 'Completed', count: statusCounts.completed },
        ].map(t => (
          <button
            key={t.key}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              statusTab === t.key 
                ? 'bg-gray-900 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setStatusTab(t.key as any)}
          >
            <span className="flex items-center gap-1.5">
              {t.label}
              {t.count > 0 && (
                <span className={`
                  ml-0.5 px-1.5 py-0.5 rounded-full text-xs font-semibold
                  ${statusTab === t.key ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'}
                `}>
                  {t.count}
                </span>
              )}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
