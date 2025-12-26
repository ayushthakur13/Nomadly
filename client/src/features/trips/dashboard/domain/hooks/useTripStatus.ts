import { useMemo } from 'react';

/**
 * Computes trip status (Upcoming/Ongoing/Past) and badge metadata.
 * Pure compute only—no side effects.
 */
export const useTripStatus = (startDate: string, endDate: string) => {
  const statusInfo = useMemo(() => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const daysToStart = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const daysSinceStart = Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    if (now < start) {
      return {
        status: 'Upcoming',
        text: daysToStart === 0 ? 'Starts tomorrow' : daysToStart === 1 ? '1 day to go' : `${daysToStart} days to go`,
        badgeColor: 'bg-blue-100 text-blue-700',
        icon: 'calendar',
      };
    } else if (now >= start && now <= end) {
      const currentDay = Math.min(daysSinceStart + 1, totalDays);
      return {
        status: 'Ongoing',
        text: `Day ${currentDay} of ${totalDays}`,
        badgeColor: 'bg-emerald-100 text-emerald-700',
        icon: 'zap',
      };
    } else {
      return {
        status: 'Past',
        text: 'Trip completed',
        badgeColor: 'bg-gray-100 text-gray-700',
        icon: 'checkCircle',
      };
    }
  }, [startDate, endDate]);

  return { statusInfo };
};
