import { useMemo } from 'react';

export interface AttentionItem {
  id: string;
  title: string; // one-line insight
  why: string; // subtle reason
  cta: string; // clear CTA label
  icon: string;
  href: string; // target route
  urgency: number; // lower is more urgent
}

export const useNeedsAttention = (trip: any, stage: 'Upcoming' | 'Ongoing' | 'Past') => {
  const items = useMemo<AttentionItem[]>(() => {
    if (stage === 'Past') return [];

    const list: AttentionItem[] = [];

    const hasPrimaryDestination = !!(trip.destinationLocation?.name || trip.mainDestination);
    if (!hasPrimaryDestination) {
      list.push({
        id: 'route',
        title: 'No route yet',
        why: 'Add your first stop to shape the journey.',
        cta: 'Add first stop',
        icon: 'map',
        href: `/trips/${trip._id}/destinations`,
        urgency: 1,
      });
    }

    const hasMultipleTravellers = (trip.participants?.length || 1) > 1;
    if (!hasMultipleTravellers) {
      list.push({
        id: 'members',
        title: 'Travellers not invited',
        why: 'Trips are better together. Invite your crew.',
        cta: 'Invite members',
        icon: 'users',
        href: `/trips/${trip._id}/members`,
        urgency: 3,
      });
    }

    // Budget placeholder: always attention until implemented
    list.push({
      id: 'budget',
      title: 'Budget not started',
      why: 'Set expectations and avoid surprises.',
      cta: 'Plan budget',
      icon: 'dollarSign',
      href: `/trips/${trip._id}/budget`,
      urgency: 2,
    });

    // Tasks placeholder (higher when ongoing)
    list.push({
      id: 'tasks',
      title: 'No tasks yet',
      why: 'A simple list keeps everyone aligned.',
      cta: 'Create tasks',
      icon: 'check',
      href: `/trips/${trip._id}/tasks`,
      urgency: stage === 'Ongoing' ? 1 : 4,
    });

    return list.sort((a, b) => a.urgency - b.urgency).slice(0, 5);
  }, [trip, stage]);

  return { items };
}
