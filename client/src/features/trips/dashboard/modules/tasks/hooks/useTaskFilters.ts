import { useMemo, useState } from 'react';
import type { Task } from '@shared/types';

export type AssignmentTab = 'all' | 'assigned-to-me' | 'assigned-to-everyone' | 'assigned-to-others';
export type StatusTab = 'all' | 'pending' | 'completed';

const isAssignedToEveryone = (task: Task) => !task.assignedTo || task.assignedTo.length === 0;
const isAssignedToMe = (task: Task, userId: string | null) => {
  if (!userId) return false;
  if (isAssignedToEveryone(task)) return true;
  return Array.isArray(task.assignedTo) && task.assignedTo.includes(userId);
};
const isAssignedToOthers = (task: Task, userId: string | null) => {
  if (!userId) return false;
  if (isAssignedToEveryone(task)) return false;
  return Array.isArray(task.assignedTo) && !task.assignedTo.includes(userId);
};
const isRelevantToUser = (task: Task, userId: string | null) => isAssignedToEveryone(task) || isAssignedToMe(task, userId);
const isCompletedByUser = (task: Task, userId: string | null) => {
  if (!userId) return false;
  return task.completions.some(c => c.userId === userId);
};

export function useTaskFilters(tasks: Task[], currentUserId: string | null) {
  const [assignmentTab, setAssignmentTab] = useState<AssignmentTab>('all');
  const [statusTab, setStatusTab] = useState<StatusTab>('all');

  const filtered = useMemo(() => {
    return tasks.filter(task => {
      // Apply assignment filter
      const passesAssignment = (() => {
        switch (assignmentTab) {
          case 'assigned-to-me':
            return isAssignedToMe(task, currentUserId);
          case 'assigned-to-everyone':
            return isAssignedToEveryone(task);
          case 'assigned-to-others':
            return isAssignedToOthers(task, currentUserId);
          case 'all':
          default:
            return true;
        }
      })();
      
      if (!passesAssignment) return false;
      
      // Apply status filter
      switch (statusTab) {
        case 'pending':
          return isRelevantToUser(task, currentUserId) && !isCompletedByUser(task, currentUserId);
        case 'completed':
          return isRelevantToUser(task, currentUserId) && isCompletedByUser(task, currentUserId);
        case 'all':
        default:
          return true;
      }
    });
  }, [tasks, assignmentTab, statusTab, currentUserId]);

  // Badge counts: each axis ignores the other
  const assignmentCounts = useMemo(() => ({
    all: tasks.length,
    assignedToMe: tasks.filter(t => isAssignedToMe(t, currentUserId)).length,
    assignedToEveryone: tasks.filter(isAssignedToEveryone).length,
    assignedToOthers: tasks.filter(t => isAssignedToOthers(t, currentUserId)).length,
  }), [tasks, currentUserId]);

  const statusCounts = useMemo(() => ({
    all: tasks.length,
    pending: tasks.filter(t => isRelevantToUser(t, currentUserId) && !isCompletedByUser(t, currentUserId)).length,
    completed: tasks.filter(t => isRelevantToUser(t, currentUserId) && isCompletedByUser(t, currentUserId)).length,
  }), [tasks, currentUserId]);

  return {
    assignmentTab,
    setAssignmentTab,
    statusTab,
    setStatusTab,
    filtered,
    assignmentCounts,
    statusCounts,
  };
}
