import { useMemo } from 'react';
import type { Trip } from '@shared/types';

export interface QuickInfoItem {
  icon: string;
  label: string;
  value: string;
  suffix?: string;
  accentBg: string;
  accentIcon: string;
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

export const useQuickInfo = (trip: Trip, metrics: { participants: number }) => {
  const items = useMemo<QuickInfoItem[]>(() => {
    const budgetStatus = 'Budget not started'; // placeholder until budget module
    const participants = metrics.participants;
    const category = trip.category || '';
    const isPublic = !!trip.isPublic;

    return [
      {
        icon: 'users',
        label: 'Travellers',
        value: `${participants} ${participants === 1 ? 'person' : 'people'}`,
        accentBg: 'bg-emerald-50',
        accentIcon: 'text-emerald-600',
      },
      {
        icon: 'sparkles',
        label: 'Vibe',
        value: category ? category.charAt(0).toUpperCase() + category.slice(1) : '—',
        suffix: CATEGORY_EMOJI[category] || '✨',
        accentBg: 'bg-blue-50',
        accentIcon: 'text-blue-600',
      },
      {
        icon: isPublic ? 'globe' : 'lock',
        label: 'Visibility',
        value: isPublic ? 'Public' : 'Private',
        accentBg: 'bg-gray-50',
        accentIcon: 'text-gray-700',
      },
      {
        icon: 'dollarSign',
        label: 'Budget',
        value: budgetStatus,
        accentBg: 'bg-amber-50',
        accentIcon: 'text-amber-600',
      },
    ];
  }, [trip.category, trip.isPublic, metrics.participants]);

  return { items };
}
