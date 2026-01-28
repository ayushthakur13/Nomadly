import { useMemo } from 'react';

/**
 * Computes overview metrics (duration, participants, etc.).
 * Pure compute only—no side effects.
 */
export const useOverviewMetrics = (trip: any) => {
  const metrics = useMemo(() => {
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const durationDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const participantCount = trip.membersCount || trip.members?.length || 1;

    return {
      duration: durationDays,
      participants: participantCount,
    };
  }, [trip.startDate, trip.endDate, trip.membersCount, trip.members]);

  return metrics;
};
