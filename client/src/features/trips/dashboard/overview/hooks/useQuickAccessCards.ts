import { useMemo } from 'react';
import type { PlanningStates } from './usePlanningStatus';

export interface QuickCard { icon: string; title: string; hint?: string; href: string; weight: number }

export const useQuickAccessCards = (tripId: string, stage: 'Upcoming' | 'Ongoing' | 'Past', planning?: PlanningStates) => {
  const cards = useMemo<QuickCard[]>(() => {
    // Placeholder signals (no real data yet)
    const tasksDueToday = 0;
    const budgetOverspend = false;
    const chatUnread = 0;
    const memoriesCount = 0;

    const list: QuickCard[] = [];

    if (stage !== 'Past' && tasksDueToday > 0) {
      list.push({ icon: 'check', title: 'Tasks due today', hint: `${tasksDueToday} items`, href: `/trips/${tripId}/tasks`, weight: 1 });
    }
    if (stage !== 'Past' && budgetOverspend) {
      list.push({ icon: 'dollarSign', title: 'Budget alert', hint: 'Overspend risk', href: `/trips/${tripId}/budget`, weight: 2 });
    }
    if (stage !== 'Past' && chatUnread > 0) {
      list.push({ icon: 'messageCircle', title: 'Unread chat', hint: `${chatUnread} new`, href: `/trips/${tripId}/chat`, weight: 3 });
    }
    if (memoriesCount > 0) {
      list.push({ icon: 'image', title: 'Latest memories', hint: `${memoriesCount} photos`, href: `/trips/${tripId}/memories`, weight: 4 });
    }

    const sorted = list.sort((a, b) => a.weight - b.weight);

    // Show generic helper only for a first-time trip with nothing started
    const allNotStarted = planning
      ? Object.values(planning).every((s) => s === 'Not started')
      : false;

    if (sorted.length === 0 && stage !== 'Past' && allNotStarted) {
      sorted.push({ icon: 'sparkles', title: 'Start planning your trip', hint: 'Begin with destinations or tasks', href: `/trips/${tripId}/destinations`, weight: 10 });
    }

    return sorted.slice(0, 2);
  }, [tripId, stage, planning]);

  return { cards };
}
