import { useMemo } from 'react';
import { useTripStatus, useTripDateRange } from '@/features/trips/dashboard/hooks/domain';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const startOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());

const endOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

export const useTimelineProgress = (startDate: string, endDate: string) => {
  const { statusInfo } = useTripStatus(startDate, endDate);
  const { formattedDateRange } = useTripDateRange(startDate, endDate);

  const model = useMemo(() => {
    const start = startOfDay(new Date(startDate));
    const end = endOfDay(new Date(endDate));
    const today = startOfDay(new Date());

    const isUpcoming = today < start;
    const isPast = today > end;

    const totalDays =
      Math.floor((end.getTime() - start.getTime()) / MS_PER_DAY) + 1;

    const segments = Math.max(1, totalDays - 1);

    const diffFromStartDays = Math.floor(
      (today.getTime() - start.getTime()) / MS_PER_DAY
    );

    const clampedDayIndex = Math.min(
      segments,
      Math.max(0, diffFromStartDays)
    );

    // ✔️ Start = 0%, End = 100%, Today moves one full segment per day
    const todayPct = isUpcoming
      ? 0
      : Math.round((clampedDayIndex / segments) * 100);

    // Progress fill matches today position
    const progressPct = todayPct;

    const currentDayNumber = isUpcoming ? 0 : clampedDayIndex + 1;

    const daysUntilStart = isUpcoming
      ? Math.max(0, -diffFromStartDays)
      : 0;

    const startDisplay = start.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

    const endDisplay = end.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

    const todayDisplay = today.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

    const journeyLabel =
      totalDays === 1 ? '1-day adventure' : `${totalDays}-day journey`;

    const isEndToday =
      today.getFullYear() === end.getFullYear() &&
      today.getMonth() === end.getMonth() &&
      today.getDate() === end.getDate();

    return {
      statusInfo,
      formattedDateRange,
      progressPct,
      todayPct,
      isUpcoming,
      isPast,
      startDisplay,
      endDisplay,
      todayDisplay,
      journeyLabel,
      totalDays,
      currentDayNumber,
      daysUntilStart,
      isEndToday,
    };
  }, [startDate, endDate, statusInfo, formattedDateRange]);

  return { model };
};
