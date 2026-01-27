import type { Task, Trip } from '@shared/types';
import type { TripMember } from '@/services/members.service';
import TaskItem from './TaskItem';

interface Props {
  tasks: Task[];
  currentUserId: string | null;
  trip: Trip | null;
  members: TripMember[];
  pendingOps: Record<string, { completing?: 'complete' | 'uncomplete'; updating?: Partial<any>; deleting?: boolean; creating?: boolean }>
  onToggleComplete: (id: string, next: boolean) => Promise<void> | void;
  onUpdate: (id: string, patch: Partial<Pick<Task, 'title' | 'description' | 'dueDate' | 'assignedTo'>>) => Promise<void> | void;
  onDelete: (id: string) => Promise<void> | void;
}

export default function TaskList({ tasks, currentUserId, trip, members, pendingOps, onToggleComplete, onUpdate, onDelete }: Props) {
  return (
    <div className="divide-y divide-gray-100">
      {tasks.map(task => (
        <TaskItem
          key={task._id}
          task={task}
          currentUserId={currentUserId}
          trip={trip}
          members={members}
          pending={{
            completing: pendingOps[task._id]?.completing,
            deleting: pendingOps[task._id]?.deleting,
            updating: !!pendingOps[task._id]?.updating,
          }}
          onToggleComplete={onToggleComplete}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
