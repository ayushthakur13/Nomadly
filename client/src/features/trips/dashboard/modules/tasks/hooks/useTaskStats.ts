import { useMemo } from 'react';
import type { Task } from '@shared/types';
import { isToday } from '../utils/taskHelpers';

export interface TaskStats {
  total: number;
  assignedToMeCount: number;
  dueTodayCount: number;
}

/**
 * Calculate task statistics for the current user
 */
export function useTaskStats(tasks: Task[], currentUserId: string | null): TaskStats {
  return useMemo(() => {
    if (!currentUserId) {
      return {
        total: tasks.length,
        assignedToMeCount: 0,
        dueTodayCount: 0,
      };
    }

    const assignedToMe = tasks.filter((t) => {
      // Everyone tasks include me
      if (!t.assignedTo || t.assignedTo.length === 0) return true;
      // Specifically assigned to me
      return Array.isArray(t.assignedTo) && t.assignedTo.includes(currentUserId);
    });

    const dueToday = tasks.filter((t) => {
      if (!t.dueDate) return false;
      return isToday(new Date(t.dueDate));
    });

    return {
      total: tasks.length,
      assignedToMeCount: assignedToMe.length,
      dueTodayCount: dueToday.length,
    };
  }, [tasks, currentUserId]);
}
